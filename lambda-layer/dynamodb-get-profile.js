const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { handlePreflight, authenticateRequest, response } = require('./shared');

// DynamoDB 클라이언트 설정
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);

// 환경 변수
const TABLE_NAME = process.env.TABLE_NAME || 'users';

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

    // 사용자 조회
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { email: user.email },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return response.notFound('User not found', origin);
    }

    const userData = result.Item;

    // 응답용 사용자 정보 (passwordHash 제외)
    const userResponse = {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      company: userData.company,
      phone: userData.phone,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    // 성공 응답
    return response.success(
      {
        success: true,
        data: {
          user: userResponse,
        },
      },
      origin
    );
  } catch (error) {
    console.error('Get Profile Error:', error.message);

    return response.serverError('Internal server error', origin);
  }
};
