const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
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
      return response.badRequest('프로젝트 ID가 필요합니다.', origin);
    }

    // userId를 String으로 변환 (DynamoDB 타입 일치)
    const userId = String(user.userId);

    // DynamoDB에서 프로젝트 조회
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROJECT#${projectId}`,
      },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return response.notFound('프로젝트를 찾을 수 없습니다.', origin);
    }

    // 프로젝트 데이터 변환 (PK, SK 제거)
    const project = {
      projectId: result.Item.projectId,
      projectName: result.Item.projectName,
      location: result.Item.location,
      area: result.Item.area,
      rooms: result.Item.rooms,
      bathrooms: result.Item.bathrooms,
      status: result.Item.status,
      createdAt: result.Item.createdAt,
      updatedAt: result.Item.updatedAt,
      photos: result.Item.photos || {},
      styling: result.Item.styling || {},
    };

    return response.success({ project }, origin);
  } catch (error) {
    console.error('GetProject Error:', error.message);

    return response.serverError('Internal server error', origin);
  }
};
