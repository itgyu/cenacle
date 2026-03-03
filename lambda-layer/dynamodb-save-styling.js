const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { handlePreflight, authenticateRequest, response } = require('./shared');

// DynamoDB 클라이언트 설정
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'KeystonePartners';

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

    // 요청 바디 파싱
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return response.error('잘못된 요청 형식입니다.', origin, 400);
    }

    const { photoId, originalPhoto, styledPhoto, style } = body;

    if (!photoId || !styledPhoto || !style) {
      return response.error('photoId, styledPhoto, style이 필요합니다.', origin, 400);
    }

    // userId를 String으로 변환
    const userId = String(user.userId);

    // stylingPhotos 객체 초기화
    try {
      const initCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `PROJECT#${projectId}`,
        },
        UpdateExpression: 'SET stylingPhotos = if_not_exists(stylingPhotos, :emptyMap)',
        ExpressionAttributeValues: {
          ':emptyMap': {},
        },
      });
      await docClient.send(initCommand);
    } catch (initError) {
      console.log('Init warning (may be ignorable):', initError.message);
    }

    // stylingPhotos.{photoId} 업데이트
    const stylingData = {
      originalPhoto: originalPhoto || '',
      styledPhoto: styledPhoto,
      style: style,
      createdAt: new Date().toISOString(),
    };

    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROJECT#${projectId}`,
      },
      UpdateExpression: 'SET stylingPhotos.#photoId = :stylingData, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#photoId': photoId,
      },
      ExpressionAttributeValues: {
        ':stylingData': stylingData,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);

    console.log('[SaveStyling] Styling photo saved to DynamoDB:', {
      userId,
      projectId,
      photoId,
      style,
      styledPhoto: styledPhoto.substring(0, 50) + '...',
    });

    return response.success(
      {
        message: '스타일링 사진이 저장되었습니다.',
        photoId,
        stylingData,
      },
      origin
    );
  } catch (error) {
    console.error('SaveStyling Error:', error.message);
    return response.serverError('스타일링 사진 저장 중 오류가 발생했습니다.', origin);
  }
};
