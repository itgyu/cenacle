# Lambda 함수 배포 가이드

## 📦 배포 패키지 준비 완료

다음 파일들이 생성되었습니다:
- `create-project.zip` - 프로젝트 생성 Lambda 함수
- `get-projects.zip` - 프로젝트 목록 조회 Lambda 함수
- `dynamodb-layer.zip` - Lambda Layer (jsonwebtoken 포함)

---

## 🚀 배포 방법 1: AWS 콘솔 (권장)

### Step 1: Lambda 함수 생성 - 프로젝트 생성

1. **AWS Lambda 콘솔 접속**
   - https://console.aws.amazon.com/lambda
   - Region: **eu-north-1** (스톡홀름)

2. **함수 생성**
   - "함수 생성" 클릭
   - "처음부터 작성" 선택
   - 함수 이름: `keystone-create-project`
   - 런타임: **Node.js 18.x** 또는 **20.x**
   - 아키텍처: **x86_64**
   - "함수 생성" 클릭

3. **코드 업로드**
   - "코드" 탭에서 "업로드 원본" → ".zip 파일" 선택
   - `create-project.zip` 파일 업로드
   - "저장" 클릭

4. **Layer 연결**
   - 페이지 하단 "레이어" 섹션
   - "레이어 추가" 클릭
   - "사용자 지정 레이어" 선택
   - 기존 `keystonepartners-layer` 선택 (또는 새로 생성)
   - 최신 버전 선택
   - "추가" 클릭

5. **환경 변수 설정**
   - "구성" 탭 → "환경 변수"
   - "편집" 클릭
   - 환경 변수 추가:
     - 키: `JWT_SECRET`
     - 값: `your-secret-key-change-this` (기존 값과 동일하게)
   - "저장" 클릭

6. **IAM 권한 확인**
   - "구성" 탭 → "권한"
   - 실행 역할 클릭
   - 다음 권한 필요:
     ```json
     {
       "Effect": "Allow",
       "Action": [
         "dynamodb:PutItem",
         "dynamodb:Query"
       ],
       "Resource": [
         "arn:aws:dynamodb:eu-north-1:*:table/KeystonePartners",
         "arn:aws:dynamodb:eu-north-1:*:table/KeystonePartners/index/*"
       ]
     }
     ```

7. **타임아웃 설정**
   - "구성" 탭 → "일반 구성"
   - "편집" 클릭
   - 제한 시간: **10초**
   - 메모리: **256 MB**
   - "저장" 클릭

---

### Step 2: Lambda 함수 생성 - 프로젝트 목록 조회

1. **함수 생성**
   - 함수 이름: `keystone-get-projects`
   - 런타임: **Node.js 18.x** 또는 **20.x**
   - 나머지는 위와 동일

2. **코드 업로드**
   - `get-projects.zip` 파일 업로드

3. **Layer 연결**
   - 동일한 `keystonepartners-layer` 연결

4. **환경 변수 설정**
   - 키: `JWT_SECRET`
   - 값: 동일한 값 사용

5. **IAM 권한 확인**
   - DynamoDB Query 권한 필요 (위와 동일)

6. **타임아웃 설정**
   - 제한 시간: **10초**
   - 메모리: **256 MB**

---

### Step 3: API Gateway 설정

#### 기존 API에 엔드포인트 추가

1. **API Gateway 콘솔 접속**
   - https://console.aws.amazon.com/apigateway
   - 기존 API 선택: `KeystonePartnersAPI`

2. **POST /projects 엔드포인트 생성**
   - 리소스 선택: `/` (루트)
   - "리소스 생성" 클릭
   - 리소스 이름: `projects`
   - 리소스 경로: `/projects`
   - "리소스 생성" 클릭

3. **POST 메서드 추가**
   - `/projects` 리소스 선택
   - "메서드 생성" 클릭
   - 메서드 유형: **POST**
   - 통합 유형: **Lambda 함수**
   - Lambda 프록시 통합: **활성화**
   - Lambda 함수: `keystone-create-project`
   - "메서드 생성" 클릭

4. **GET 메서드 추가**
   - `/projects` 리소스 선택
   - "메서드 생성" 클릭
   - 메서드 유형: **GET**
   - 통합 유형: **Lambda 함수**
   - Lambda 프록시 통합: **활성화**
   - Lambda 함수: `keystone-get-projects`
   - "메서드 생성" 클릭

5. **CORS 설정**
   - `/projects` 리소스 선택
   - "CORS 활성화" 클릭
   - Access-Control-Allow-Origin: `*`
   - Access-Control-Allow-Headers: `Content-Type,Authorization`
   - Access-Control-Allow-Methods: `GET,POST,OPTIONS`
   - "저장" 클릭

6. **API 배포**
   - "API 배포" 클릭
   - 스테이지: **prod**
   - "배포" 클릭

7. **API URL 확인**
   - 스테이지 URL: `https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod`
   - 엔드포인트:
     - POST: `https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/projects`
     - GET: `https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/projects`

---

## 🚀 배포 방법 2: AWS CLI

### 1. create-project 함수 업데이트

```bash
# 함수가 이미 있는 경우
aws lambda update-function-code \
  --function-name keystone-create-project \
  --zip-file fileb://create-project.zip \
  --region eu-north-1

# 함수가 없는 경우 (IAM Role ARN 필요)
aws lambda create-function \
  --function-name keystone-create-project \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-dynamodb-role \
  --handler dynamodb-create-project.handler \
  --zip-file fileb://create-project.zip \
  --timeout 10 \
  --memory-size 256 \
  --environment Variables="{JWT_SECRET=your-secret-key-change-this}" \
  --region eu-north-1
```

### 2. get-projects 함수 업데이트

```bash
# 함수가 이미 있는 경우
aws lambda update-function-code \
  --function-name keystone-get-projects \
  --zip-file fileb://get-projects.zip \
  --region eu-north-1

# 함수가 없는 경우
aws lambda create-function \
  --function-name keystone-get-projects \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-dynamodb-role \
  --handler dynamodb-get-projects.handler \
  --zip-file fileb://get-projects.zip \
  --timeout 10 \
  --memory-size 256 \
  --environment Variables="{JWT_SECRET=your-secret-key-change-this}" \
  --region eu-north-1
```

### 3. Layer 연결

```bash
# Layer ARN 확인
aws lambda list-layers --region eu-north-1

# Layer 연결
aws lambda update-function-configuration \
  --function-name keystone-create-project \
  --layers arn:aws:lambda:eu-north-1:YOUR_ACCOUNT_ID:layer:keystonepartners-layer:VERSION \
  --region eu-north-1

aws lambda update-function-configuration \
  --function-name keystone-get-projects \
  --layers arn:aws:lambda:eu-north-1:YOUR_ACCOUNT_ID:layer:keystonepartners-layer:VERSION \
  --region eu-north-1
```

---

## ✅ 배포 후 테스트

### 1. Lambda 콘솔에서 테스트

#### create-project 함수 테스트

```json
{
  "httpMethod": "POST",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN"
  },
  "body": "{\"projectName\":\"테스트 프로젝트\",\"location\":\"서울시 강남구\",\"area\":\"32\",\"rooms\":\"3\",\"bathrooms\":\"2\"}"
}
```

#### get-projects 함수 테스트

```json
{
  "httpMethod": "GET",
  "headers": {
    "Authorization": "Bearer YOUR_JWT_TOKEN"
  }
}
```

### 2. 프론트엔드에서 테스트

1. **로그인**
   - http://localhost:3000/auth/login
   - 기존 계정으로 로그인

2. **프로젝트 생성**
   - http://localhost:3000/create-project
   - 프로젝트 정보 입력
   - "프로젝트 생성" 버튼 클릭
   - 브라우저 콘솔에서 로그 확인:
     ```
     [CreateProject] Creating project via API...
     [ProjectAPI] Creating project: {projectName, location, ...}
     [ProjectAPI] Project created: {projectId, ...}
     ```

3. **대시보드 확인**
   - http://localhost:3000/dashboard
   - 생성된 프로젝트가 목록에 표시되는지 확인
   - 브라우저 콘솔에서 로그 확인:
     ```
     [Dashboard] Loading projects from API...
     [ProjectAPI] Fetching projects...
     [ProjectAPI] Projects fetched: 1
     ```

### 3. DynamoDB 확인

1. **DynamoDB 콘솔 접속**
   - https://console.aws.amazon.com/dynamodb
   - 테이블: `KeystonePartners`
   - "항목 탐색" 클릭

2. **프로젝트 데이터 확인**
   - PK: `USER#{userId}`
   - SK: `PROJECT#{projectId}`
   - 필드 확인:
     - projectName
     - location
     - area
     - rooms
     - bathrooms
     - status: "planning"
     - createdAt
     - updatedAt

---

## 🔍 문제 해결

### Lambda 함수 로그 확인

```bash
# CloudWatch Logs 확인
aws logs tail /aws/lambda/keystone-create-project --follow --region eu-north-1
aws logs tail /aws/lambda/keystone-get-projects --follow --region eu-north-1
```

### 일반적인 오류

1. **401 Unauthorized**
   - JWT_SECRET 환경 변수 확인
   - 토큰 만료 확인 (7일)
   - Authorization 헤더 형식: `Bearer {token}`

2. **500 Internal Server Error**
   - Lambda 함수 로그 확인
   - DynamoDB 권한 확인
   - userId String 타입 변환 확인

3. **CORS 오류**
   - API Gateway CORS 설정 확인
   - OPTIONS 메서드 응답 확인
   - Access-Control-Allow-Headers 확인

4. **Type mismatch for Index Key**
   - userId가 String으로 변환되는지 확인
   - Line 84 (create), Line 60 (get) 확인:
     ```javascript
     const userId = String(decoded.userId);
     ```

---

## 📋 체크리스트

배포 전:
- [ ] `create-project.zip` 생성 완료
- [ ] `get-projects.zip` 생성 완료
- [ ] `dynamodb-layer.zip` 존재 확인
- [ ] JWT_SECRET 값 확인
- [ ] DynamoDB 테이블 `KeystonePartners` 존재 확인

Lambda 함수 생성:
- [ ] `keystone-create-project` 함수 생성
- [ ] `keystone-get-projects` 함수 생성
- [ ] 두 함수에 Layer 연결
- [ ] 환경 변수 `JWT_SECRET` 설정
- [ ] IAM 권한 확인 (DynamoDB 접근)
- [ ] 타임아웃 10초로 설정

API Gateway 설정:
- [ ] `/projects` 리소스 생성
- [ ] POST 메서드 생성 및 Lambda 연결
- [ ] GET 메서드 생성 및 Lambda 연결
- [ ] CORS 설정 완료
- [ ] API 배포 (prod 스테이지)

테스트:
- [ ] Lambda 콘솔에서 테스트
- [ ] 프론트엔드에서 프로젝트 생성
- [ ] 대시보드에서 프로젝트 목록 확인
- [ ] DynamoDB에서 데이터 확인

---

## 📞 지원

문제가 발생하면:
1. CloudWatch Logs 확인
2. 브라우저 개발자 도구 콘솔 확인
3. Network 탭에서 API 요청/응답 확인
4. DynamoDB 테이블 스캔으로 데이터 확인
