const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
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

    // userId를 String으로 변환 (DynamoDB 타입 일치)
    const userId = String(user.userId);

    // DynamoDB에서 사용자의 모든 프로젝트 조회
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'PROJECT#',
      },
    });

    const result = await docClient.send(queryCommand);

    // 프로젝트 데이터 변환 (PK, SK 제거)
    const projects = result.Items.map((item) => ({
      projectId: item.projectId,
      projectName: item.projectName,
      location: item.location,
      area: item.area,
      rooms: item.rooms,
      bathrooms: item.bathrooms,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // 최신순 정렬
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return response.success(
      {
        projects,
        total: projects.length,
      },
      origin
    );
  } catch (error) {
    console.error('GetProjects Error:', error.message);

    return response.serverError('Internal server error', origin);
  }
};
