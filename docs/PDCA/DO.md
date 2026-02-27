# CenacleDesign 구현 가이드

## 구현 완료 내역

### Phase 1: 기반 설정 ✅

#### 설치된 패키지

```bash
# 테스트 프레임워크
@playwright/test
jest
@testing-library/react
@testing-library/jest-dom

# 코드 품질
eslint-config-prettier
prettier
husky
lint-staged
```

#### 생성된 설정 파일

- `playwright.config.ts` - E2E 테스트 설정
- `jest.config.js` - 단위 테스트 설정
- `jest.setup.js` - Jest 초기화
- `.eslintrc.json` - ESLint 규칙
- `.prettierrc` - Prettier 설정
- `.prettierignore` - Prettier 제외 파일
- `.github/workflows/test.yml` - CI/CD 파이프라인
- `.husky/pre-commit` - Git Hook

#### 추가된 npm scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:ci": "jest --ci --coverage",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

---

### Phase 2: 보안 강화 ✅

#### Lambda 공통 모듈 (`lambda-layer/shared/`)

**cors.js**

- `ALLOWED_ORIGINS` - 허용된 도메인 목록
- `getCorsHeaders()` - CORS 헤더 생성
- `handlePreflight()` - OPTIONS 요청 처리

**auth.js**

- `getJwtSecret()` - 환경변수에서 JWT Secret 로드 (필수화)
- `verifyToken()` - JWT 검증
- `generateToken()` - JWT 생성
- `authenticateRequest()` - 요청 인증

**response.js**

- `success()`, `error()` - 표준 응답 생성
- `unauthorized()`, `forbidden()`, `notFound()` - HTTP 에러 응답
- `serverError()`, `conflict()`, `created()` - 기타 응답

**validation.js**

- `isValidEmail()` - 이메일 검증
- `validatePassword()` - 비밀번호 검증
- `validateRequiredFields()` - 필수 필드 검증
- `parseJsonBody()` - JSON 파싱

#### 수정된 Lambda 함수

- `dynamodb-login.js` - 공통 모듈 사용
- `dynamodb-signup.js` - 공통 모듈 사용
- `dynamodb-get-profile.js` - 공통 모듈 사용
- `dynamodb-get-projects.js` - 공통 모듈 사용
- `dynamodb-create-project.js` - 공통 모듈 사용

#### 프론트엔드 보안 개선

**lib/errors.ts**

- `ErrorCode` - 에러 코드 상수
- `isAuthError()` - 인증 에러 판별
- `getUserFriendlyMessage()` - 사용자 친화적 메시지
- `logger` - 환경 기반 로깅

**lib/api-config.ts**

- 조건부 로깅 적용
- 에러 코드 지원

**lib/auth-api.ts**

- 민감 정보 로깅 제거
- 에러 메시지 표준화

---

### Phase 3: 아키텍처 리팩토링 ✅

#### Zustand Store (`lib/stores/project.store.ts`)

- 17개 useState를 단일 Store로 통합
- DevTools 미들웨어 적용
- 타입 안전한 액션 정의

#### AuthGuard 컴포넌트 (`components/AuthGuard.tsx`)

- 인증 체크 로직 통합
- 로딩 상태 처리
- 자동 리다이렉트

#### Dashboard 리팩토링 (`app/dashboard/page.tsx`)

- `any[]` → `Project[]` 타입 명시
- AuthGuard 적용
- 검색 필터 기능 추가

---

### Phase 4: E2E 테스트 ✅

#### 테스트 구조

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts     # 테스트 사용자 정의
│   └── README.md           # 픽스처 가이드
├── pages/
│   ├── login.page.ts       # 로그인 Page Object
│   ├── signup.page.ts      # 회원가입 Page Object
│   ├── dashboard.page.ts   # 대시보드 Page Object
│   └── project.page.ts     # 프로젝트 Page Object
└── tests/
    ├── auth.spec.ts        # 인증 테스트
    ├── project.spec.ts     # 프로젝트 테스트
    └── photo.spec.ts       # 사진 업로드 테스트
```

#### 구현된 테스트 시나리오

| ID       | 설명                 | 파일            |
| -------- | -------------------- | --------------- |
| AUTH-01  | 회원가입 성공        | auth.spec.ts    |
| AUTH-02  | 회원가입 실패 (중복) | auth.spec.ts    |
| AUTH-03  | 로그인 성공          | auth.spec.ts    |
| AUTH-04  | 로그인 실패          | auth.spec.ts    |
| AUTH-05  | 로그아웃             | auth.spec.ts    |
| AUTH-06  | 미인증 리다이렉트    | auth.spec.ts    |
| PROJ-01  | 프로젝트 생성        | project.spec.ts |
| PROJ-02  | 프로젝트 목록 조회   | project.spec.ts |
| PHOTO-01 | 사진 업로드          | photo.spec.ts   |

---

## 실행 방법

### 개발 서버

```bash
npm run dev
```

### 테스트 실행

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# E2E 테스트 (UI 모드)
npm run test:e2e:ui
```

### 코드 품질 검사

```bash
# 린트
npm run lint

# 포맷 검사
npm run format:check

# 포맷 적용
npm run format
```

---

## 다음 단계

1. 프로젝트 상세 페이지에 Zustand Store 적용
2. 단위 테스트 추가
3. AI 스타일링 테스트 구현
4. 프로젝트 삭제 API 구현
