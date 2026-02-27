# 프로젝트 Lambda 함수 배포 가이드

## 새로 생성된 Lambda 함수

1. **`dynamodb-create-project.js`** - 프로젝트 생성
2. **`dynamodb-get-projects.js`** - 프로젝트 목록 조회

---

## AWS Lambda 배포 방법

### 1. Lambda Layer 준비 (이미 완료되어 있다면 스킵)

```bash
cd /Users/taegyulee/Desktop/keystonepartners/partners/lambda-layer

# Layer 디렉토리가 없다면 생성
mkdir -p nodejs/node_modules

# 의존성 설치
cd nodejs
npm install jsonwebtoken aws-sdk
cd ..

# Layer ZIP 생성
zip -r lambda-layer.zip nodejs/
```

### 2. Lambda Layer 생성/업데이트 (AWS Console)

1. **AWS Lambda Console** 접속
2. **Layers** → **Create layer**
3. Layer 이름: `keystone-partners-layer`
4. `lambda-layer.zip` 업로드
5. Runtime: **Node.js 18.x** 선택
6. **Create** 클릭

---

## 프로젝트 생성 Lambda 배포

### 1. Lambda 함수 생성

1. **AWS Lambda Console** → **Functions** → **Create function**
2. 설정:
   - 함수 이름: `keystone-create-project`
   - Runtime: **Node.js 18.x**
   - 아키텍처: **x86_64**
3. **Create function** 클릭

### 2. 코드 배포

1. **Code source** 섹션에서 `index.js` 선택
2. `dynamodb-create-project.js` 내용 전체 복사
3. Lambda 에디터에 붙여넣기
4. **Deploy** 클릭

### 3. Layer 연결

1. **Layers** 섹션 → **Add a layer**
2. **Custom layers** 선택
3. `keystone-partners-layer` 선택 (최신 버전)
4. **Add** 클릭

### 4. 환경 변수 설정

1. **Configuration** → **Environment variables** → **Edit**
2. 추가:
   - `JWT_SECRET`: `your-secret-key-change-this` (실제 시크릿 키로 변경)
   - `TABLE_NAME`: `KeystonePartners`

### 5. 권한 설정

1. **Configuration** → **Permissions**
2. **Execution role** 클릭
3. IAM Console에서 정책 추가:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:eu-north-1:*:table/KeystonePartners"
    }
  ]
}
```

### 6. API Gateway 연결

1. **Configuration** → **Function URL** → **Create function URL**
   - 또는 **API Gateway** → **Create API**
2. 설정:
   - Auth type: **NONE**
   - CORS 활성화
   - Allowed origins: `*`
   - Allowed methods: `POST, OPTIONS`
   - Allowed headers: `Content-Type, Authorization`

3. 생성된 URL을 복사: `https://....execute-api.eu-north-1.amazonaws.com/prod/projects`

---

## 프로젝트 목록 조회 Lambda 배포

### 위의 프로세스 반복

1. Lambda 함수 이름: `keystone-get-projects`
2. 코드: `dynamodb-get-projects.js` 내용 복사
3. Layer, 환경 변수, 권한 동일하게 설정
4. API Gateway HTTP Method: **GET, OPTIONS**

---

## API Gateway 라우팅 설정

기존 API Gateway에 새 리소스 추가:

### 프로젝트 생성 엔드포인트
- **Method**: POST
- **Path**: `/projects`
- **Lambda 함수**: `keystone-create-project`

### 프로젝트 목록 조회 엔드포인트
- **Method**: GET
- **Path**: `/projects`
- **Lambda 함수**: `keystone-get-projects`

### CORS 설정
- **Allowed Origins**: `*`
- **Allowed Headers**: `Content-Type, Authorization`
- **Allowed Methods**: `GET, POST, OPTIONS`

---

## 배포 후 테스트

### 1. 프로젝트 생성 테스트

```javascript
const token = localStorage.getItem('token');

fetch('https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectName: '우리집 리모델링',
    location: '강남구 역삼동',
    area: '32',
    rooms: '3',
    bathrooms: '2'
  })
}).then(r => r.json()).then(d => console.log('✅ 생성 결과:', d));
```

예상 응답:
```json
{
  "message": "Project created successfully",
  "project": {
    "projectId": "PROJ-1736133033123-abc123",
    "projectName": "우리집 리모델링",
    "location": "강남구 역삼동",
    "area": "32",
    "rooms": "3",
    "bathrooms": "2",
    "status": "planning",
    "createdAt": "2025-01-06T12:30:33.123Z",
    "updatedAt": "2025-01-06T12:30:33.123Z"
  }
}
```

### 2. 프로젝트 목록 조회 테스트

```javascript
const token = localStorage.getItem('token');

fetch('https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/projects', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(d => console.log('✅ 프로젝트 목록:', d));
```

예상 응답:
```json
{
  "projects": [
    {
      "projectId": "PROJ-1736133033123-abc123",
      "projectName": "우리집 리모델링",
      "location": "강남구 역삼동",
      "area": "32",
      "rooms": "3",
      "bathrooms": "2",
      "status": "planning",
      "createdAt": "2025-01-06T12:30:33.123Z",
      "updatedAt": "2025-01-06T12:30:33.123Z"
    }
  ],
  "total": 1
}
```

---

## 중요 포인트

### userId 타입 변환

두 Lambda 함수 모두에서 **`userId`를 String으로 변환**합니다:

```javascript
const userId = String(decoded.userId);
```

이렇게 해야 DynamoDB의 타입 불일치 오류가 발생하지 않습니다!

### DynamoDB 스키마

```
PK: USER#{userId}
SK: PROJECT#{projectId}
```

이 구조로 저장되므로, 한 사용자의 모든 프로젝트를 쉽게 조회할 수 있습니다.

---

## 문제 해결

### 타입 오류 발생 시

```
Type mismatch: Expected S Actual: N
```

→ Lambda 함수에서 `String(decoded.userId)` 확인

### CORS 오류 발생 시

→ API Gateway에서 CORS 설정 확인
→ Lambda 응답 헤더에 CORS 헤더 포함 확인

### 401 Unauthorized

→ JWT_SECRET 환경 변수 확인
→ 토큰 만료 여부 확인 (7일)

---

## 다음 단계

Lambda 함수 배포 후:
1. 프론트엔드 API 통합
2. 프로젝트 생성 페이지 연결
3. 대시보드에서 프로젝트 목록 표시
