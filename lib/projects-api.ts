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
