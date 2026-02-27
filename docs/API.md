# CenacleDesign API Documentation

## Base URL

```
https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod
```

---

## Authentication

### POST /signup

회원가입

**Request Body:**

```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "company": "string (optional)",
  "phone": "string (optional)"
}
```

**Response (201):**

```json
{
  "message": "User created successfully",
  "user": {
    "userId": "user_1234567890_abc123",
    "name": "홍길동",
    "email": "user@example.com",
    "company": "회사명",
    "phone": "010-1234-5678",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

- `400` - Validation error (missing fields, invalid email, short password)
- `409` - Email already exists

---

### POST /login

로그인

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "userId": "user_1234567890_abc123",
    "name": "홍길동",
    "email": "user@example.com",
    "company": "회사명",
    "phone": "010-1234-5678",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**

- `400` - Missing email or password
- `401` - Invalid email or password

---

### GET /profile

프로필 조회 (인증 필요)

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "user_1234567890_abc123",
      "name": "홍길동",
      "email": "user@example.com",
      "company": "회사명",
      "phone": "010-1234-5678",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `401` - Invalid or missing token
- `404` - User not found

---

## Projects

### GET /projects

프로젝트 목록 조회 (인증 필요)

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "projects": [
    {
      "projectId": "PROJ-1234567890-abc123",
      "projectName": "강남 아파트 인테리어",
      "location": "서울시 강남구",
      "area": "30",
      "rooms": "2",
      "bathrooms": "1",
      "status": "planning",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### POST /projects

프로젝트 생성 (인증 필요)

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "projectName": "string (required)",
  "location": "string (required)",
  "area": "string (optional)",
  "rooms": "string (optional)",
  "bathrooms": "string (optional)"
}
```

**Response (201):**

```json
{
  "message": "Project created successfully",
  "project": {
    "projectId": "PROJ-1234567890-abc123",
    "projectName": "강남 아파트 인테리어",
    "location": "서울시 강남구",
    "area": "30",
    "rooms": "2",
    "bathrooms": "1",
    "status": "planning",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET /projects/{projectId}

프로젝트 상세 조회 (인증 필요)

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "project": {
    "projectId": "PROJ-1234567890-abc123",
    "projectName": "강남 아파트 인테리어",
    "location": "서울시 강남구",
    "area": "30",
    "rooms": "2",
    "bathrooms": "1",
    "status": "planning",
    "beforePhotos": {},
    "afterPhotos": {},
    "stylingPhotos": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

---

## Photos

### GET /projects/{projectId}/photos

Presigned URL 요청 (인증 필요)

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `type` - "before" | "after" (required)
- `spaceId` - 공간 ID (required)
- `shotId` - 샷 ID (required)
- `contentType` - MIME 타입 (optional, default: image/jpeg)

**Response (200):**

```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "imageUrl": "https://cdn.cenacledesign.com/...",
  "s3Key": "projects/PROJ-123/before/living/shot1.jpg"
}
```

---

### POST /projects/{projectId}/photos

사진 업로드 완료 알림 (인증 필요)

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "imageUrl": "string (required)",
  "type": "before | after (required)",
  "spaceId": "string (required)",
  "shotId": "string (required)"
}
```

**Response (200):**

```json
{
  "message": "Photo uploaded successfully",
  "imageUrl": "https://cdn.cenacledesign.com/..."
}
```

---

## Error Response Format

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE (optional)"
}
```

### Error Codes

| Code             | Description |
| ---------------- | ----------- |
| UNAUTHORIZED     | 인증 필요   |
| FORBIDDEN        | 권한 없음   |
| NOT_FOUND        | 리소스 없음 |
| CONFLICT         | 중복 데이터 |
| VALIDATION_ERROR | 입력값 오류 |
| SERVER_ERROR     | 서버 오류   |

---

## CORS

### Allowed Origins (Production)

- `https://cenacledesign.vercel.app`
- `https://www.cenacledesign.com`

### Allowed Origins (Development)

- `http://localhost:3000`
- `http://127.0.0.1:3000`

### Allowed Headers

- `Content-Type`
- `Authorization`

### Allowed Methods

- `GET`
- `POST`
- `PUT`
- `DELETE`
- `OPTIONS`
