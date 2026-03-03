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

    const { spaceId, shotId } = body;

    if (!spaceId || !shotId) {
      return response.error('spaceId와 shotId가 필요합니다.', origin, 400);
    }

    // userId를 String으로 변환
    const userId = String(user.userId);

    // DynamoDB에서 photos.{spaceId}.{shotId} 삭제 (REMOVE 사용)
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROJECT#${projectId}`,
      },
      UpdateExpression: 'REMOVE photos.#spaceId.#shotId SET updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#spaceId': spaceId,
        '#shotId': shotId,
      },
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    await docClient.send(updateCommand);

    console.log('[DeletePhoto] Photo deleted from DynamoDB:', {
      userId,
      projectId,
      spaceId,
      shotId,
    });

    return response.success(
      {
        message: '사진이 삭제되었습니다.',
        spaceId,
        shotId,
      },
      origin
    );
  } catch (error) {
    console.error('DeletePhoto Error:', error.message);
    return response.serverError('사진 삭제 중 오류가 발생했습니다.', origin);
  }
};
