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

    const { imageUrl, type, spaceId, shotId } = body;

    if (!imageUrl || !type || !spaceId || !shotId) {
      return response.error('imageUrl, type, spaceId, shotId가 필요합니다.', origin, 400);
    }

    // userId를 String으로 변환
    const userId = String(user.userId);

    // DynamoDB에서 photos 필드 업데이트
    // photos.{spaceId}.{shotId} = imageUrl
    const updateExpression = `SET photos.#spaceId.#shotId = :imageUrl, updatedAt = :updatedAt`;
    const expressionAttributeNames = {
      '#spaceId': spaceId,
      '#shotId': shotId,
    };
    const expressionAttributeValues = {
      ':imageUrl': imageUrl,
      ':updatedAt': new Date().toISOString(),
    };

    // 먼저 photos 객체가 존재하는지 확인하고 없으면 초기화
    try {
      // photos.{spaceId} 가 없을 경우를 대비해 먼저 초기화 시도
      const initCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `PROJECT#${projectId}`,
        },
        UpdateExpression: 'SET photos = if_not_exists(photos, :emptyMap)',
        ExpressionAttributeValues: {
          ':emptyMap': {},
        },
      });
      await docClient.send(initCommand);

      // photos.{spaceId} 초기화
      const initSpaceCommand = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `PROJECT#${projectId}`,
        },
        UpdateExpression: 'SET photos.#spaceId = if_not_exists(photos.#spaceId, :emptyMap)',
        ExpressionAttributeNames: {
          '#spaceId': spaceId,
        },
        ExpressionAttributeValues: {
          ':emptyMap': {},
        },
      });
      await docClient.send(initSpaceCommand);
    } catch (initError) {
      console.log('Init warning (may be ignorable):', initError.message);
    }

    // 실제 업데이트
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROJECT#${projectId}`,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);

    console.log('[SavePhoto] Photo saved to DynamoDB:', {
      userId,
      projectId,
      type,
      spaceId,
      shotId,
      imageUrl,
    });

    return response.success(
      {
        message: '사진이 저장되었습니다.',
        imageUrl,
      },
      origin
    );
  } catch (error) {
    console.error('SavePhoto Error:', error.message);
    return response.serverError('사진 저장 중 오류가 발생했습니다.', origin);
  }
};
