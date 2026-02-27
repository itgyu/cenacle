const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { handlePreflight, authenticateRequest, response, validation } = require('./shared');

// DynamoDB 클라이언트 설정
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME || 'KeystonePartners';

// 프로젝트 ID 생성
function generateProjectId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `PROJ-${timestamp}-${random}`;
}

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

    // 요청 본문 파싱
    const { data: body, error: parseError } = validation.parseJsonBody(event);
    if (parseError) {
      return response.error(parseError, origin, 400);
    }

    const { projectName, location, area, rooms, bathrooms } = body;

    // 필수 필드 검증
    const { valid, missingFields } = validation.validateRequiredFields(body, [
      'projectName',
      'location',
    ]);
    if (!valid) {
      return response.error(`${missingFields.join(', ')} are required`, origin, 400);
    }

    // 프로젝트 데이터 생성
    const projectId = generateProjectId();
    const now = new Date().toISOString();

    // userId를 String으로 변환 (DynamoDB 타입 불일치 방지)
    const userId = String(user.userId);

    const project = {
      PK: `USER#${userId}`,
      SK: `PROJECT#${projectId}`,
      entityType: 'PROJECT',
      userId,
      projectId,
      projectName: validation.sanitizeString(projectName, 200),
      location: validation.sanitizeString(location, 500),
      area: area || '',
      rooms: rooms || '',
      bathrooms: bathrooms || '',
      status: 'planning',
      createdAt: now,
      updatedAt: now,
    };

    // DynamoDB에 저장
    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: project,
    });
    await docClient.send(putCommand);

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
      updatedAt: project.updatedAt,
    };

    return response.created(
      {
        message: 'Project created successfully',
        project: responseProject,
      },
      origin
    );
  } catch (error) {
    console.error('CreateProject Error:', error.message);

    return response.serverError('Internal server error', origin);
  }
};
