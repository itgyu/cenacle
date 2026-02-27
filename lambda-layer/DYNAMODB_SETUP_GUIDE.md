# DynamoDB + Lambda 백엔드 설정 가이드

## 📋 목차
1. [DynamoDB 테이블 설정](#1-dynamodb-테이블-설정)
2. [Lambda Layer 업로드](#2-lambda-layer-업로드)
3. [Lambda 함수 생성](#3-lambda-함수-생성)
4. [API Gateway 설정](#4-api-gateway-설정)
5. [테스트](#5-테스트)

---

## 1. DynamoDB 테이블 설정

### ✅ 이미 완료됨!

스크린샷에서 확인된 내용:
- 테이블 이름: `users`
- 파티션 키: `email (S)`
- 상태: 활성

추가 설정은 필요 없습니다!

---

## 2. Lambda Layer 업로드

### 2.1 Lambda 콘솔 접속

https://console.aws.amazon.com/lambda
- 리전: `eu-north-1` (Stockholm)

### 2.2 Layer 생성

1. 왼쪽 메뉴 → **Layers** 클릭
2. **Create layer** 버튼
3. **설정:**
   - Name: `dynamodb-auth-layer`
   - Description: `DynamoDB, bcryptjs, jsonwebtoken, AWS SDK`
   - Upload: `dynamodb-layer.zip` (3.3MB) 업로드
   - Compatible runtimes: `Node.js 18.x`, `Node.js 20.x` 선택
   - Compatible architectures: `x86_64` 선택
4. **Create** 클릭

### 2.3 Layer ARN 복사

생성된 Layer 클릭 → Version ARN 복사:
```
arn:aws:lambda:eu-north-1:xxxxx:layer:dynamodb-auth-layer:1
```

---

## 3. Lambda 함수 생성

### 3.1 Signup 함수

#### 함수 생성
1. Lambda 콘솔 → **Create function**
2. **설정:**
   - Function name: `keystonepartners-signup`
   - Runtime: `Node.js 20.x`
   - Architecture: `x86_64`
   - Execution role: **Create a new role with basic Lambda permissions**
3. **Create function** 클릭

#### 코드 배포
1. Code 탭에서 `index.js` 삭제
2. **Upload from** → **.zip file** 선택 또는
3. 코드 에디터에 `dynamodb-signup.js` 내용 붙여넣기
4. **Deploy** 클릭

#### Layer 연결
1. 하단 **Layers** 섹션 → **Add a layer**
2. **Custom layers** 선택
3. Layer: `dynamodb-auth-layer`
4. Version: `1`
5. **Add** 클릭

#### 환경 변수 설정
1. Configuration → Environment variables → **Edit**
2. 변수 추가:
   ```
   TABLE_NAME=users
   AWS_REGION=eu-north-1
   JWT_SECRET=your-super-secret-jwt-key-12345
   ```
3. **Save** 클릭

#### IAM 권한 추가
1. Configuration → Permissions → Execution role 클릭
2. **Add permissions** → **Attach policies**
3. `AmazonDynamoDBFullAccess` 검색 및 선택
4. **Add permissions** 클릭

#### 타임아웃 설정
1. Configuration → General configuration → **Edit**
2. Timeout: `30 seconds`
3. Memory: `256 MB`
4. **Save** 클릭

### 3.2 Login 함수

위와 동일한 방법으로 생성:
- Function name: `keystonepartners-login`
- 코드: `dynamodb-login.js` 사용
- Layer, 환경 변수, IAM 권한, 타임아웃 동일하게 설정

### 3.3 Get Profile 함수

위와 동일한 방법으로 생성:
- Function name: `keystonepartners-get-profile`
- 코드: `dynamodb-get-profile.js` 사용
- Layer, 환경 변수, IAM 권한, 타임아웃 동일하게 설정

---

## 4. API Gateway 설정

### 4.1 기존 API 확인

API Gateway 콘솔에서 기존 API가 있는지 확인:
- API ID: `s1pi302i06`
- Region: `eu-north-1`

### 4.2 Lambda 함수 연결 업데이트

#### /signup 엔드포인트
1. API Gateway → APIs → 기존 API 선택
2. Resources → `/signup` → `POST` 메서드 클릭
3. **Integration Request** 클릭
4. Lambda Function: `keystonepartners-signup` 으로 변경
5. **Save** → **OK** (권한 허용)

#### /login 엔드포인트
1. `/login` → `POST` 메서드
2. Lambda Function: `keystonepartners-login`
3. **Save**

#### /profile 엔드포인트 (새로 생성)
1. Resources → `/` 선택
2. **Actions** → **Create Resource**
3. Resource Name: `profile`
4. **Create Resource**
5. `/profile` 선택 → **Actions** → **Create Method**
6. `GET` 선택 → ✓ 클릭
7. Lambda Function: `keystonepartners-get-profile`
8. **Save** → **OK**

### 4.3 CORS 활성화 (중요!)

**각 리소스(/signup, /login, /profile)에 대해:**

1. 리소스 선택
2. **Actions** → **Enable CORS**
3. 설정:
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,Authorization`
   - Access-Control-Allow-Methods: 적절한 메서드 선택
4. **Enable CORS and replace existing CORS headers** 클릭

### 4.4 API 재배포

1. **Actions** → **Deploy API**
2. Deployment stage: `prod`
3. **Deploy** 클릭

### 4.5 API URL 확인

Stages → `prod` → Invoke URL:
```
https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod
```

---

## 5. 테스트

### 5.1 회원가입 테스트

```bash
curl -X POST https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "email": "hong@test.com",
    "password": "test1234",
    "company": "테스트회사",
    "phone": "010-1234-5678"
  }'
```

**예상 응답 (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "userId": "user_1234567890_abc123",
    "name": "홍길동",
    "email": "hong@test.com",
    "company": "테스트회사",
    "phone": "010-1234-5678",
    "createdAt": "2025-11-03T14:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5.2 로그인 테스트

```bash
curl -X POST https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hong@test.com",
    "password": "test1234"
  }'
```

**예상 응답 (200):**
```json
{
  "message": "Login successful",
  "user": {
    "userId": "user_1234567890_abc123",
    "name": "홍길동",
    "email": "hong@test.com",
    "company": "테스트회사",
    "phone": "010-1234-5678",
    "createdAt": "2025-11-03T14:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5.3 프로필 조회 테스트

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 5.4 DynamoDB 데이터 확인

1. DynamoDB 콘솔 접속
2. Tables → `users` 클릭
3. **Explore table items** 클릭
4. 저장된 사용자 데이터 확인

---

## 🔒 보안 권장사항

### 1. JWT Secret 강화
```bash
# 강력한 랜덤 문자열 생성
openssl rand -base64 32
```
Lambda 환경 변수에서 `JWT_SECRET` 업데이트

### 2. CORS 설정 제한
프로덕션 환경에서는:
```
Access-Control-Allow-Origin: https://ian-partners.vercel.app
```

### 3. API Key 추가
API Gateway → API Keys 생성 → Usage Plan 설정

### 4. IAM 권한 최소화
Lambda execution role에서:
- `AmazonDynamoDBFullAccess` 제거
- 커스텀 정책 생성:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:eu-north-1:*:table/users"
    }
  ]
}
```

---

## 🐛 트러블슈팅

### CORS 에러
- API Gateway에서 CORS 재활성화
- Lambda 함수의 headers 확인
- OPTIONS 요청 처리 확인

### DynamoDB 권한 에러
- Lambda execution role 확인
- IAM 정책 확인
- CloudWatch Logs 확인

### 토큰 만료
- JWT_SECRET 일치 여부 확인
- 토큰 만료 시간 확인 (현재 7일)

---

## 📊 DynamoDB vs PostgreSQL 차이점

| 항목 | DynamoDB | PostgreSQL |
|------|----------|------------|
| 데이터 모델 | NoSQL (Key-Value) | SQL (관계형) |
| 스키마 | 유연함 | 고정됨 |
| 확장성 | 자동 확장 | 수동 확장 |
| 비용 | 사용량 기반 | 인스턴스 기반 |
| 관리 | 완전 관리형 | 일부 관리 필요 |
| 복잡한 쿼리 | 제한적 | 강력함 |

---

## 📝 다음 단계

- [ ] 프로필 업데이트 API 추가
- [ ] 비밀번호 변경 API 추가
- [ ] 이메일 인증 추가
- [ ] 소셜 로그인 추가
- [ ] Rate limiting 설정

---

**작성일:** 2025-11-03
**버전:** 1.0 (DynamoDB)
