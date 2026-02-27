const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'KeystonePartners'; // DynamoDB 테이블 이름
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// CORS 헤더
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

// JWT 토큰 검증
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 프로젝트 ID 생성
function generateProjectId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `PROJ-${timestamp}-${random}`;
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    // 요청 본문 파싱
    const body = JSON.parse(event.body);
    const { projectName, location, area, rooms, bathrooms } = body;

    // 필수 필드 검증
    if (!projectName || !location) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'projectName and location are required' })
      };
    }

    // 프로젝트 데이터 생성
    const projectId = generateProjectId();
    const now = new Date().toISOString();

    // userId를 String으로 변환 (DynamoDB 타입 불일치 방지)
    const userId = String(decoded.userId);

    const project = {
      PK: `USER#${userId}`,
      SK: `PROJECT#${projectId}`,
      entityType: 'PROJECT',
      userId: userId,  // String 타입으로 저장
      projectId: projectId,
      projectName: projectName,
      location: location,
      area: area || '',
      rooms: rooms || '',
      bathrooms: bathrooms || '',
      status: 'planning',
      createdAt: now,
      updatedAt: now
    };

    // DynamoDB에 저장
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: project
    }).promise();

    console.log('Project created:', project);

    // 응답 데이터 (PK, SK 제거)
    const responseProject = {
      projectId: project.projectId,
      projectName: project.projectName,
      location: project.location,
      area: project.area,
      rooms: project.rooms,
      bathrooms: project.bathrooms,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Project created successfully',
        project: responseProject
      })
    };

  } catch (error) {
    console.error('Error:', error);
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
