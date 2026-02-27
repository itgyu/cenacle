const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
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
    const { email, password } = body;

    // 입력값 검증
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Email and password are required'
        })
      };
    }

    // 사용자 조회
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { email }
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Invalid email or password'
        })
      };
    }

    const user = result.Item;

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          error: 'Invalid email or password'
        })
      };
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 응답용 사용자 정보 (passwordHash 제외)
    const userResponse = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      company: user.company,
      phone: user.phone,
      createdAt: user.createdAt
    };

    // 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Login successful',
        user: userResponse,
        token
      })
    };

  } catch (error) {
    console.error('Login Error:', error);

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
