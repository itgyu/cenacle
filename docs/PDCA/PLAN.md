# CenacleDesign 코드 리뷰, 리팩토링 및 E2E 테스트 계획서

## 개요

cenacledesign 프로젝트의 전체 코드 리뷰, 아키텍처 리팩토링, 백엔드 API 개선, Playwright E2E 테스트 구축을 PDCA 방식으로 진행합니다.

**총 작업 기간**: 6주 (약 135시간)

---

## Phase 1: 기반 설정 (1주)

### 1.1 테스트 프레임워크 설치

- Playwright E2E 테스트 프레임워크
- Jest 단위 테스트 프레임워크
- Testing Library (React)
- ESLint, Prettier 코드 품질 도구
- Husky, lint-staged Git Hooks

### 1.2 생성 파일

| 파일                         | 목적                  |
| ---------------------------- | --------------------- |
| `playwright.config.ts`       | Playwright E2E 설정   |
| `jest.config.js`             | Jest 단위 테스트 설정 |
| `.eslintrc.json`             | ESLint 규칙 강화      |
| `.prettierrc`                | 코드 포매팅           |
| `.github/workflows/test.yml` | CI/CD 파이프라인      |

---

## Phase 2: 보안 강화 (1주) - P0 Critical

### 2.1 CORS 도메인 제한

- **대상**: `lambda-layer/*.js` (5개 파일)
- **변경**: `'Access-Control-Allow-Origin': '*'` → 특정 도메인만 허용

### 2.2 JWT Secret 환경변수 필수화

- **변경**: Fallback 제거, 환경변수 미설정 시 에러 발생

### 2.3 로깅 정리

- `lib/api-config.ts`: 환경 기반 조건부 로깅
- `lib/auth-api.ts`: 민감 정보 로깅 제거

---

## Phase 3: 아키텍처 리팩토링 (2주) - P1 High

### 3.1 상태 관리 개선

- **문제**: `app/projects/[id]/page.tsx`에 17개 useState
- **해결**: Zustand Store 도입

### 3.2 타입 안정성 확보

- `any` 타입 제거
- 명시적 타입 정의

### 3.3 인증 로직 통합

- AuthGuard 컴포넌트 생성
- 중복 인증 체크 코드 통합

### 3.4 Lambda 공통 모듈화

- `lambda-layer/shared/` 디렉토리 생성
- CORS, Auth, Response, Validation 모듈화

### 3.5 에러 처리 표준화

- 에러 코드 기반 처리
- `lib/errors.ts` 생성

---

## Phase 4: E2E 테스트 (1.5주)

### 4.1 테스트 구조

```
e2e/
├── fixtures/
│   └── auth.fixture.ts
├── pages/
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── project.page.ts
└── tests/
    ├── auth.spec.ts
    ├── project.spec.ts
    └── photo.spec.ts
```

### 4.2 테스트 시나리오 (우선순위순)

**P0 - 필수**

- AUTH-01: 회원가입 성공
- AUTH-03: 로그인 성공
- AUTH-05: 로그아웃
- AUTH-06: 미인증 리다이렉트
- PROJ-01: 프로젝트 생성
- PROJ-02: 프로젝트 목록 조회
- PHOTO-01: 사진 업로드

**P1 - 중요**

- AUTH-02: 회원가입 실패 (중복 이메일)
- AUTH-04: 로그인 실패 (잘못된 비밀번호)
- PROJ-04: 프로젝트 삭제
- AI-01: AI 스타일링

---

## Phase 5: 문서화 (0.5주)

### 5.1 PDCA 문서

```
docs/PDCA/
├── PLAN.md    # 이 계획서
├── DESIGN.md  # 아키텍처 설계
├── DO.md      # 구현 가이드
└── CHECK.md   # 검증 체크리스트
```

### 5.2 API 문서

- `docs/API.md` - Lambda 엔드포인트 명세
- `docs/ARCHITECTURE.md` - 시스템 구조도

---

## 검증 기준

### 보안

- [ ] CORS: 특정 도메인만 허용
- [ ] JWT Secret: 환경변수에서만 로드
- [ ] 로그: 민감 정보 미노출

### 코드 품질

- [ ] `any` 타입 0개
- [ ] ESLint 에러 0개
- [ ] 테스트 커버리지 80%+

### 기능

- [ ] 모든 E2E 테스트 통과
- [ ] 기존 기능 정상 동작

---

## 일정 요약

| Phase         | 기간    | 시간     |
| ------------- | ------- | -------- |
| 1. 기반 설정  | 1주     | 20h      |
| 2. 보안 강화  | 1주     | 20h      |
| 3. 아키텍처   | 2주     | 50h      |
| 4. E2E 테스트 | 1.5주   | 35h      |
| 5. 문서화     | 0.5주   | 10h      |
| **총계**      | **6주** | **135h** |
