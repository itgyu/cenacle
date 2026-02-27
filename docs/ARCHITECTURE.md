# CenacleDesign 시스템 아키텍처

## 개요

CenacleDesign은 인테리어 프로젝트 관리 및 AI 스타일링 서비스를 제공하는 웹 애플리케이션입니다.

---

## 기술 스택

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Form**: React Hook Form + Zod

### Backend

- **API Gateway**: AWS API Gateway (REST)
- **Compute**: AWS Lambda (Node.js)
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront

### DevOps

- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Testing**: Playwright (E2E), Jest (Unit)

---

## 시스템 구성도

```
                                    ┌─────────────┐
                                    │   Vercel    │
                                    │  (CDN+Edge) │
                                    └──────┬──────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Next.js Application                        │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │     Pages       │  │   Components    │  │     Stores       │ │
│  │                 │  │                 │  │                  │ │
│  │ • Landing       │  │ • AuthGuard     │  │ • ProjectStore   │ │
│  │ • Auth          │  │ • UI Components │  │                  │ │
│  │ • Dashboard     │  │ • ThemeProvider │  │                  │ │
│  │ • Projects      │  │                 │  │                  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      API Layer (lib/)                        │ │
│  │                                                              │ │
│  │  api-config.ts → auth-api.ts → projects-api.ts              │ │
│  │        ↓                                                     │ │
│  │  errors.ts (Error handling & logging)                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                                           │
                                           │ HTTPS
                                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      AWS API Gateway                              │
│                                                                   │
│  /signup   /login   /profile   /projects   /projects/{id}/photos │
└──────────────────────────────────────────────────────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────┐
              │                            │                        │
              ▼                            ▼                        ▼
     ┌────────────────┐           ┌────────────────┐       ┌──────────────┐
     │  Auth Lambdas  │           │ Project Lambdas │       │ Photo Lambda │
     │                │           │                │       │              │
     │ • login        │           │ • get-projects │       │ • presigned  │
     │ • signup       │           │ • create       │       │   URL        │
     │ • get-profile  │           │ • get-project  │       │ • complete   │
     └───────┬────────┘           └───────┬────────┘       └──────┬───────┘
             │                            │                       │
             │                            │                       │
             ▼                            ▼                       ▼
     ┌────────────────┐           ┌────────────────┐       ┌──────────────┐
     │   DynamoDB     │           │   DynamoDB     │       │     S3       │
     │   (users)      │           │ (KeystoneP...) │       │   (photos)   │
     └────────────────┘           └────────────────┘       └──────────────┘
```

---

## 데이터 모델

### Users Table (DynamoDB)

```
Partition Key: email

{
  email: "user@example.com",
  userId: "user_1234567890_abc123",
  name: "홍길동",
  passwordHash: "bcrypt_hash",
  company: "회사명",
  phone: "010-1234-5678",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### Projects Table (DynamoDB)

```
Partition Key: PK (USER#{userId})
Sort Key: SK (PROJECT#{projectId})

{
  PK: "USER#user_123",
  SK: "PROJECT#PROJ-456",
  entityType: "PROJECT",
  userId: "user_123",
  projectId: "PROJ-456",
  projectName: "강남 아파트",
  location: "서울시 강남구",
  area: "30",
  rooms: "2",
  bathrooms: "1",
  status: "planning",
  beforePhotos: { ... },
  afterPhotos: { ... },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### S3 구조

```
cenacledesign-photos/
├── projects/
│   └── {projectId}/
│       ├── before/
│       │   └── {spaceId}/
│       │       └── {shotId}.jpg
│       ├── after/
│       │   └── {spaceId}/
│       │       └── {shotId}.jpg
│       └── styled/
│           └── {photoId}.jpg
```

---

## 인증 흐름

```
1. 사용자가 로그인 폼 제출
         │
         ▼
2. POST /login API 호출
         │
         ▼
3. Lambda에서 비밀번호 검증 (bcrypt)
         │
         ▼
4. JWT 토큰 생성 (7일 유효)
         │
         ▼
5. 클라이언트에서 localStorage에 저장
         │
         ▼
6. 이후 API 요청 시 Authorization 헤더에 포함
         │
         ▼
7. Lambda에서 JWT 검증 후 요청 처리
```

---

## 사진 업로드 흐름

```
1. 사용자가 사진 선택
         │
         ▼
2. GET /projects/{id}/photos로 Presigned URL 요청
         │
         ▼
3. Lambda에서 S3 Presigned URL 생성 (5분 유효)
         │
         ▼
4. 클라이언트에서 S3에 직접 업로드 (PUT)
         │
         ▼
5. POST /projects/{id}/photos로 메타데이터 저장
         │
         ▼
6. Lambda에서 DynamoDB 업데이트
         │
         ▼
7. 프론트엔드에서 이미지 URL로 표시
```

---

## 보안 고려사항

### 인증

- JWT 기반 인증 (7일 만료)
- 비밀번호 bcrypt 해싱 (salt rounds: 10)
- Authorization Bearer 토큰

### CORS

- 프로덕션: 특정 도메인만 허용
- 개발: localhost 추가 허용

### API

- 모든 민감한 엔드포인트 인증 필요
- 입력값 검증 및 새니타이징
- 에러 메시지에 내부 정보 미노출

### 저장소

- S3 버킷 프라이빗 설정
- Presigned URL로 접근 제어
- CloudFront CDN 배포

---

## 확장성 고려사항

### 현재 제약

- 단일 리전 (eu-north-1)
- 단일 DynamoDB 테이블 (Projects)
- 동기적 Lambda 실행

### 향후 개선 방안

- Multi-AZ 배포
- DynamoDB Global Tables
- SQS를 통한 비동기 처리
- Lambda Provisioned Concurrency
