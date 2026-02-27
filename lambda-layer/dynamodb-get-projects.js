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

    // userId를 String으로 변환 (DynamoDB 타입 일치)
    const userId = String(decoded.userId);

    // DynamoDB에서 사용자의 모든 프로젝트 조회
    const result = await dynamodb.query({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'PROJECT#'
      }
    }).promise();

    console.log('Query result:', result);

    // 프로젝트 데이터 변환 (PK, SK 제거)
    const projects = result.Items.map(item => ({
      projectId: item.projectId,
      projectName: item.projectName,
      location: item.location,
      area: item.area,
      rooms: item.rooms,
      bathrooms: item.bathrooms,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    // 최신순 정렬
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        projects: projects,
        total: projects.length
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
