const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { handlePreflight, authenticateRequest, response } = require('./shared');

// S3 클라이언트 설정
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-north-1' });
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'cenacle-design-photos';

exports.handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';

  // OPTIONS 요청 처리 (CORS preflight)
  const preflightResponse = handlePreflight(event);
  if (preflightResponse) {
    return preflightResponse;
  }

  try {
    // 인증 확인
    const { user, error: authError } = authenticateRequest(event);
    if (authError) {
      return response.unauthorized(authError, origin);
    }

    // URL에서 projectId 추출
    const projectId = event.pathParameters?.projectId || event.pathParameters?.id;
    if (!projectId) {
      return response.error('프로젝트 ID가 필요합니다.', origin, 400);
    }

    // 쿼리 파라미터에서 정보 추출
    const queryParams = event.queryStringParameters || {};
    const { type, spaceId, shotId, contentType = 'image/jpeg' } = queryParams;

    if (!type || !spaceId || !shotId) {
      return response.error('type, spaceId, shotId 파라미터가 필요합니다.', origin, 400);
    }

    // userId를 String으로 변환
    const userId = String(user.userId);

    // S3 키 생성 (photos/userId/projectId/type/spaceId/shotId/timestamp.ext)
    const timestamp = Date.now();
    const extension = contentType.split('/')[1] || 'jpg';
    const s3Key = `photos/${userId}/${projectId}/${type}/${spaceId}/${shotId}_${timestamp}.${extension}`;

    // Presigned URL 생성 (5분 유효)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // 업로드 후 접근할 이미지 URL
    const imageUrl = `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${s3Key}`;

    console.log('[GetPresignedUrl] Generated presigned URL:', {
      userId,
      projectId,
      type,
      spaceId,
      shotId,
      s3Key,
    });

    return response.success(
      {
        uploadUrl,
        imageUrl,
        s3Key,
      },
      origin
    );
  } catch (error) {
    console.error('GetPresignedUrl Error:', error.message);
    return response.serverError('Presigned URL 생성 중 오류가 발생했습니다.', origin);
  }
};
