const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { handlePreflight, generateToken, response, validation } = require('./shared');

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

    const { name, email, password, company, phone } = body;

    // 입력값 검증
    const { valid, missingFields } = validation.validateRequiredFields(body, [
      'name',
      'email',
      'password',
    ]);
    if (!valid) {
      return response.error(`${missingFields.join(', ')} are required`, origin, 400);
    }

    // 이메일 형식 검증
    if (!validation.isValidEmail(email)) {
      return response.error('Invalid email format', origin, 400);
    }

    // 비밀번호 검증
    const passwordValidation = validation.validatePassword(password);
    if (!passwordValidation.valid) {
      return response.error(passwordValidation.error, origin, 400);
    }

    // 이메일 중복 확인
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { email },
    });

    const existingUser = await docClient.send(getCommand);
    if (existingUser.Item) {
      return response.conflict('Email already exists', origin);
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 사용자 데이터 생성
    const timestamp = new Date().toISOString();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newUser = {
      email,
      userId,
      name: validation.sanitizeString(name, 100),
      passwordHash,
      company: company ? validation.sanitizeString(company, 200) : null,
      phone: phone ? validation.sanitizeString(phone, 20) : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // DynamoDB에 저장
    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: newUser,
    });

    await docClient.send(putCommand);

    // JWT 토큰 생성
    const token = generateToken({
      userId: newUser.userId,
      email: newUser.email,
    });

    // 응답용 사용자 정보 (passwordHash 제외)
    const userResponse = {
      userId: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    };

    // 성공 응답
    return response.created(
      {
        message: 'User created successfully',
        user: userResponse,
        token,
      },
      origin
    );
  } catch (error) {
    console.error('Signup Error:', error.message);

    return response.serverError('Internal server error', origin);
  }
};
