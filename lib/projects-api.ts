import { authenticatedApiRequest } from './api-config';
import { logger, getUserFriendlyMessage } from './errors';

// 타입 정의
export interface ProjectData {
  projectName: string;
  location: string;
  area: string;
  rooms: string;
  bathrooms: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  location: string;
  area: string;
  rooms: string;
  bathrooms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectResponse {
  message: string;
  project: Project;
}

export interface GetProjectsResponse {
  projects: Project[];
  total: number;
}

/**
 * 프로젝트 생성 API
 */
export async function createProject(projectData: ProjectData) {
  logger.debug('Creating project:', projectData);

  const { data, error } = await authenticatedApiRequest<CreateProjectResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });

  if (error || !data) {
    logger.error('Create project failed:', error);
    return { error: getUserFriendlyMessage(error || '프로젝트 생성에 실패했습니다.') };
  }

  logger.debug('Project created:', data.project.projectId);
  return { data: data.project };
}

/**
 * 프로젝트 목록 조회 API
 */
export async function getProjects() {
  logger.debug('Fetching projects...');

  const { data, error } = await authenticatedApiRequest<GetProjectsResponse>('/projects', {
    method: 'GET',
  });

  if (error || !data) {
    logger.error('Fetch projects failed:', error);
    return { error: getUserFriendlyMessage(error || '프로젝트 목록 조회에 실패했습니다.') };
  }

  logger.debug('Projects fetched:', data.projects.length);
  return { data: data.projects };
}

/**
 * 프로젝트 상세 조회 API
 */
export async function getProject(projectId: string) {
  logger.debug('Fetching project:', projectId);

  const { data, error } = await authenticatedApiRequest<{ project: Project }>(
    `/projects/${projectId}`,
    {
      method: 'GET',
    }
  );

  if (error || !data) {
    logger.error('Fetch project failed:', error);
    return { error: getUserFriendlyMessage(error || '프로젝트 조회에 실패했습니다.') };
  }

  logger.debug('Project fetched:', data.project.projectId);
  return { data: data.project };
}

// 사진 업로드 API 타입 정의
export interface GetPresignedUrlParams {
  type: 'before' | 'after';
  spaceId: string;
  shotId: string;
  contentType?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  s3Key: string;
}

export interface CompleteUploadRequest {
  imageUrl: string;
  type: 'before' | 'after';
  spaceId: string;
  shotId: string;
}

/**
 * Presigned URL 요청
 */
export async function getPresignedUrl(projectId: string, params: GetPresignedUrlParams) {
  logger.debug('Getting presigned URL:', { projectId, ...params });

  const queryParams = new URLSearchParams({
    type: params.type,
    spaceId: params.spaceId,
    shotId: params.shotId,
    ...(params.contentType && { contentType: params.contentType }),
  });

  const { data, error } = await authenticatedApiRequest<PresignedUrlResponse>(
    `/projects/${projectId}/photos?${queryParams}`,
    {
      method: 'GET',
    }
  );

  if (error || !data) {
    logger.error('Get presigned URL failed:', error);
    return { error: getUserFriendlyMessage(error || 'Presigned URL 생성에 실패했습니다.') };
  }

  logger.debug('Presigned URL generated');
  return { data };
}

/**
 * S3에 직접 업로드
 */
export async function uploadToS3(presignedUrl: string, file: File) {
  logger.debug('Uploading to S3:', file.name, file.size);

  try {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status}`);
    }

    logger.debug('S3 upload successful');
    return { success: true };
  } catch (error) {
    logger.error('S3 upload error:', error);
    return { error: error instanceof Error ? error.message : 'S3 업로드에 실패했습니다.' };
  }
}

/**
 * DynamoDB 업데이트 알림
 */
export async function completePhotoUpload(projectId: string, params: CompleteUploadRequest) {
  logger.debug('Completing photo upload:', { projectId, imageUrl: params.imageUrl });

  const { data, error } = await authenticatedApiRequest<{ message: string; imageUrl: string }>(
    `/projects/${projectId}/photos`,
    {
      method: 'POST',
      body: JSON.stringify(params),
    }
  );

  if (error || !data) {
    logger.error('Complete upload failed:', error);
    return { error: getUserFriendlyMessage(error || '업로드 완료 처리에 실패했습니다.') };
  }

  logger.debug('Photo upload completed');
  return { data: data.imageUrl };
}

/**
 * 통합 업로드 함수
 */
export async function uploadPhoto(
  projectId: string,
  file: File,
  type: 'before' | 'after',
  spaceId: string,
  shotId: string
) {
  logger.debug('Starting photo upload workflow:', {
    projectId,
    type,
    spaceId,
    shotId,
    fileName: file.name,
    fileSize: file.size,
  });

  // 1. Presigned URL 요청
  const urlResult = await getPresignedUrl(projectId, {
    type,
    spaceId,
    shotId,
    contentType: file.type,
  });

  if (urlResult.error || !urlResult.data) {
    return { error: urlResult.error };
  }

  const { uploadUrl, imageUrl } = urlResult.data;

  // 2. S3에 업로드
  const uploadResult = await uploadToS3(uploadUrl, file);
  if (uploadResult.error) {
    return { error: uploadResult.error };
  }

  // 3. DynamoDB 업데이트
  const completeResult = await completePhotoUpload(projectId, {
    imageUrl,
    type,
    spaceId,
    shotId,
  });

  if (completeResult.error) {
    return { error: completeResult.error };
  }

  logger.debug('Photo upload workflow completed:', imageUrl);
  return { data: imageUrl };
}

/**
 * Base64 이미지를 S3에 업로드 (스타일링 결과용)
 */
export async function uploadBase64ToS3(presignedUrl: string, base64Data: string) {
  logger.debug('Uploading base64 to S3...');

  try {
    // base64에서 data URL prefix 제거
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // base64를 바이너리로 변환
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status}`);
    }

    logger.debug('S3 base64 upload successful');
    return { success: true };
  } catch (error) {
    logger.error('S3 base64 upload error:', error);
    return { error: error instanceof Error ? error.message : 'S3 업로드에 실패했습니다.' };
  }
}

/**
 * 스타일링 이미지 업로드 (원본 + 스타일링 결과)
 */
export async function uploadStylingPhoto(
  projectId: string,
  originalPhoto: string,
  styledPhoto: string,
  style: string,
  spaceId: string
) {
  logger.debug('Starting styling photo upload:', { projectId, style, spaceId });

  const photoId = `${spaceId}_${Date.now()}`;

  // 1. Presigned URL 요청 (스타일링 이미지용)
  const urlResult = await getPresignedUrl(projectId, {
    type: 'after',
    spaceId: `styling_${spaceId}`,
    shotId: photoId,
    contentType: 'image/jpeg',
  });

  if (urlResult.error || !urlResult.data) {
    return { error: urlResult.error };
  }

  const { uploadUrl, imageUrl } = urlResult.data;

  // 2. S3에 스타일링 이미지 업로드
  const uploadResult = await uploadBase64ToS3(uploadUrl, styledPhoto);
  if (uploadResult.error) {
    return { error: uploadResult.error };
  }

  // 3. DynamoDB stylingPhotos 필드에 저장 (새 API 사용)
  const { data: saveData, error: saveError } = await authenticatedApiRequest<{
    message: string;
    photoId: string;
    stylingData: {
      originalPhoto: string;
      styledPhoto: string;
      style: string;
      createdAt: string;
    };
  }>(`/projects/${projectId}/styling`, {
    method: 'POST',
    body: JSON.stringify({
      photoId,
      originalPhoto,
      styledPhoto: imageUrl, // S3 URL 저장
      style,
    }),
  });

  if (saveError) {
    logger.error('DynamoDB styling save failed:', saveError);
    // S3에는 이미 업로드됨, 로컬 상태로라도 유지
  }

  logger.debug('Styling photo upload completed:', imageUrl);
  return {
    data: {
      imageUrl,
      photoId,
      originalPhoto,
      style,
    },
  };
}

/**
 * 영역별 사진 삭제 API
 */
export async function deletePhoto(projectId: string, spaceId: string, shotId: string) {
  logger.debug('Deleting photo:', { projectId, spaceId, shotId });

  const { data, error } = await authenticatedApiRequest<{ message: string }>(
    `/projects/${projectId}/photos/delete`,
    {
      method: 'POST',
      body: JSON.stringify({ spaceId, shotId }),
    }
  );

  if (error || !data) {
    logger.error('Delete photo failed:', error);
    return { error: error || '사진 삭제에 실패했습니다.' };
  }

  logger.debug('Photo deleted successfully');
  return { success: true };
}

/**
 * 스타일링 사진 삭제 API
 */
export async function deleteStylingPhoto(projectId: string, photoId: string) {
  logger.debug('Deleting styling photo:', { projectId, photoId });

  const { data, error } = await authenticatedApiRequest<{ message: string }>(
    `/projects/${projectId}/styling/delete`,
    {
      method: 'POST',
      body: JSON.stringify({ photoId }),
    }
  );

  if (error || !data) {
    logger.error('Delete styling photo failed:', error);
    return { error: error || '스타일링 사진 삭제에 실패했습니다.' };
  }

  logger.debug('Styling photo deleted successfully');
  return { success: true };
}

/**
 * 프로젝트 삭제 API
 */
export async function deleteProject(projectId: string) {
  logger.debug('Deleting project:', projectId);

  const { data, error } = await authenticatedApiRequest<{ message: string; projectId: string }>(
    `/projects/${projectId}`,
    {
      method: 'DELETE',
    }
  );

  if (error || !data) {
    logger.error('Delete project failed:', error);
    return { error: getUserFriendlyMessage(error || '프로젝트 삭제에 실패했습니다.') };
  }

  logger.debug('Project deleted successfully:', projectId);
  return { success: true, data };
}
