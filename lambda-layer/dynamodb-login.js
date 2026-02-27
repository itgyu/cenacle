const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const {
  handlePreflight,
  getCorsHeaders,
  generateToken,
  response,
  validation,
} = require('./shared');

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
    // 요청 본문 파싱
    const { data: body, error: parseError } = validation.parseJsonBody(event);
    if (parseError) {
      return response.error(parseError, origin, 400);
    }

    const { email, password } = body;

    // 입력값 검증
    const { valid, missingFields } = validation.validateRequiredFields(body, ['email', 'password']);
    if (!valid) {
      return response.error(`${missingFields.join(', ')} are required`, origin, 400);
    }

    if (!validation.isValidEmail(email)) {
      return response.error('Invalid email format', origin, 400);
    }

    // 사용자 조회
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { email },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return response.unauthorized('Invalid email or password', origin);
    }

    const user = result.Item;

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return response.unauthorized('Invalid email or password', origin);
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.userId,
      email: user.email,
    });

    // 응답용 사용자 정보 (passwordHash 제외)
    const userResponse = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      company: user.company,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    // 성공 응답
    return response.success(
      {
        message: 'Login successful',
        user: userResponse,
        token,
      },
      origin
    );
  } catch (error) {
    console.error('Login Error:', error.message);

    return response.serverError('Internal server error', origin);
  }
};
