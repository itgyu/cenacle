# CenacleDesign 아키텍처 설계서

## 1. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Pages     │  │ Components  │  │   Stores    │              │
│  │ - dashboard │  │ - AuthGuard │  │ - project   │              │
│  │ - project   │  │ - UI        │  │   store     │              │
│  │ - auth      │  │             │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────┐              │
│  │              API Layer (lib/)                  │              │
│  │  - api-config.ts  - auth-api.ts               │              │
│  │  - projects-api.ts - errors.ts                │              │
│  └───────────────────────┬───────────────────────┘              │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼ HTTPS
┌──────────────────────────────────────────────────────────────────┐
│                     AWS API Gateway                               │
│                      (REST API)                                   │
└────────────┬─────────────┬─────────────┬─────────────┬───────────┘
             │             │             │             │
             ▼             ▼             ▼             ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
      │  Login   │  │  Signup  │  │ Projects │  │  Photos  │
      │ Lambda   │  │ Lambda   │  │ Lambda   │  │ Lambda   │
      └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
           │             │             │             │
           └─────────────┼─────────────┼─────────────┘
                         │             │
                         ▼             ▼
              ┌─────────────────┐  ┌──────────┐
              │    DynamoDB     │  │    S3    │
              │ - users table   │  │ - photos │
              │ - projects      │  │          │
              └─────────────────┘  └──────────┘
```

## 2. 디렉토리 구조

```
cenacledesign/
├── app/                      # Next.js App Router
│   ├── auth/                 # 인증 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/            # 대시보드
│   ├── projects/[id]/        # 프로젝트 상세
│   │   ├── components/       # 페이지별 컴포넌트
│   │   ├── constants/        # 상수 정의
│   │   └── types/            # 타입 정의
│   └── api/                  # Next.js API Routes
│       ├── style/            # AI 스타일링
│       └── edit/             # AI 에디팅
│
├── components/               # 공통 컴포넌트
│   ├── ui/                   # shadcn/ui 컴포넌트
│   ├── AuthGuard.tsx         # 인증 가드
│   └── theme-provider.tsx
│
├── lib/                      # 유틸리티 & API
│   ├── api-config.ts         # API 설정
│   ├── auth-api.ts           # 인증 API
│   ├── projects-api.ts       # 프로젝트 API
│   ├── errors.ts             # 에러 처리
│   ├── utils.ts              # 유틸리티
│   └── stores/               # Zustand 스토어
│       └── project.store.ts
│
├── contexts/                 # React Contexts
│   └── AuthContext.tsx
│
├── lambda-layer/             # Lambda 함수들
│   ├── shared/               # 공통 모듈
│   │   ├── cors.js
│   │   ├── auth.js
│   │   ├── response.js
│   │   └── validation.js
│   ├── dynamodb-login.js
│   ├── dynamodb-signup.js
│   ├── dynamodb-get-profile.js
│   ├── dynamodb-get-projects.js
│   └── dynamodb-create-project.js
│
├── e2e/                      # E2E 테스트
│   ├── fixtures/
│   ├── pages/
│   └── tests/
│
└── docs/                     # 문서
    ├── PDCA/
    ├── API.md
    └── ARCHITECTURE.md
```

## 3. 상태 관리 설계

### Zustand Store 구조

```typescript
interface ProjectState {
  // Core state
  project: Project | null;
  isLoading: boolean;
  error: string | null;

  // UI state
  activeTab: number;
  showPhotoGallery: boolean;
  showProjectInfo: boolean;

  // Guide states
  guides: {
    before: boolean;
    after: boolean;
    styling: boolean;
    editing: boolean;
    release: boolean;
  };

  // Expanded spaces
  expandedSpaces: Record<string, boolean>;

  // Styling state
  styling: {
    selectedSpace: string | null;
    selectedPhoto: string | null;
    selectedStyle: string;
    isStyling: boolean;
  };

  // Editing state
  editing: {
    isGenerating: boolean;
    selectedPhoto: string | null;
    concept: string;
    color: string;
  };

  // Actions
  setProject: (project: Project | null) => void;
  toggleSpace: (spaceId: string) => void;
  updateBeforePhoto: (spaceId: string, shotId: string, url: string) => void;
  // ... more actions
}
```

## 4. 에러 처리 설계

### 에러 코드 체계

```typescript
const ErrorCode = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELD: 'MISSING_FIELD',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Server
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};
```

### 에러 처리 흐름

```
Lambda Error
     │
     ▼
API Response { error: string, code: ErrorCode }
     │
     ▼
lib/errors.ts - getUserFriendlyMessage()
     │
     ▼
한글 사용자 친화적 메시지
```

## 5. 보안 설계

### CORS 설정

```javascript
const ALLOWED_ORIGINS = ['https://cenacledesign.vercel.app', 'https://www.cenacledesign.com'];

// Development only
const DEV_ORIGINS = ['http://localhost:3000'];
```

### JWT 인증 흐름

```
1. Login Request
      │
      ▼
2. Lambda validates credentials
      │
      ▼
3. Generate JWT (7d expiry)
      │
      ▼
4. Store in localStorage
      │
      ▼
5. Include in Authorization header
      │
      ▼
6. Lambda validates JWT on protected routes
```

## 6. 테스트 설계

### E2E 테스트 Page Object Pattern

```typescript
class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### 테스트 시나리오 매핑

| 시나리오 ID | 설명                 | 우선순위 |
| ----------- | -------------------- | -------- |
| AUTH-01     | 회원가입 성공        | P0       |
| AUTH-02     | 회원가입 실패 (중복) | P1       |
| AUTH-03     | 로그인 성공          | P0       |
| AUTH-04     | 로그인 실패          | P1       |
| AUTH-05     | 로그아웃             | P0       |
| AUTH-06     | 미인증 리다이렉트    | P0       |
| PROJ-01     | 프로젝트 생성        | P0       |
| PROJ-02     | 프로젝트 목록 조회   | P0       |
| PHOTO-01    | 사진 업로드          | P0       |
