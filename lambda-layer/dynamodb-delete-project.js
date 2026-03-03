const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
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

    // DynamoDB에서 프로젝트 삭제
    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROJECT#${projectId}`,
      },
      // 삭제 전 존재 여부 확인을 위해 조건 추가
      ConditionExpression: 'attribute_exists(PK)',
      ReturnValues: 'ALL_OLD',
    });

    const result = await docClient.send(deleteCommand);

    console.log('[DeleteProject] Project deleted:', {
      userId,
      projectId,
      projectName: result.Attributes?.projectName,
    });

    return response.success(
      {
        message: '프로젝트가 삭제되었습니다.',
        projectId,
        projectName: result.Attributes?.projectName,
      },
      origin
    );
  } catch (error) {
    console.error('DeleteProject Error:', error.message);

    // 프로젝트가 존재하지 않는 경우
    if (error.name === 'ConditionalCheckFailedException') {
      return response.notFound('프로젝트를 찾을 수 없습니다.', origin);
    }

    return response.serverError('프로젝트 삭제 중 오류가 발생했습니다.', origin);
  }
};
