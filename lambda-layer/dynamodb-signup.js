const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// DynamoDB 클라이언트 설정
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);

// 환경 변수
const TABLE_NAME = process.env.TABLE_NAME || 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // 요청 본문 파싱
    const body = JSON.parse(event.body);
    const { name, email, password, company, phone } = body;

    // 입력값 검증
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Name, email, and password are required'
        })
      };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid email format'
        })
      };
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Password must be at least 6 characters'
        })
      };
    }

    // 이메일 중복 확인
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { email }
    });

    const existingUser = await docClient.send(getCommand);
    if (existingUser.Item) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'Email already exists'
        })
      };
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
      name,
      passwordHash,
      company: company || null,
      phone: phone || null,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // DynamoDB에 저장
    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: newUser
    });

    await docClient.send(putCommand);

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: newUser.userId,
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 응답용 사용자 정보 (passwordHash 제외)
    const userResponse = {
      userId: newUser.userId,
      name: newUser.name,
      email: newUser.email,
      company: newUser.company,
      phone: newUser.phone,
      createdAt: newUser.createdAt
    };

    // 성공 응답
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'User created successfully',
        user: userResponse,
        token
      })
    };

  } catch (error) {
    console.error('Signup Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
