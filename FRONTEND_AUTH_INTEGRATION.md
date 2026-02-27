# 프론트엔드 인증 API 연동 가이드

Keystone Partners 프론트엔드에 AWS 백엔드 API를 연동한 문서입니다.

## 📁 파일 구조

```
keystonepartners-app/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       ✅ API 연동 완료
│   │   └── signup/page.tsx      ✅ API 연동 완료
│   └── layout.tsx               ✅ AuthProvider 추가
├── contexts/
│   └── AuthContext.tsx          ✅ 인증 상태 관리
├── lib/
│   ├── api-config.ts            ✅ API 설정
│   └── auth-api.ts              ✅ 인증 API 함수들
└── lambda-layer/                (백엔드 코드)
    ├── signup.js
    ├── login.js
    └── get-profile.js
```

## 🔧 주요 변경사항

### 1. API 설정 (`lib/api-config.ts`)

- API 기본 URL 설정: `https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod`
- API 엔드포인트 상수 정의
- API 요청 헬퍼 함수
- 인증이 필요한 API 요청 함수

### 2. 인증 API 서비스 (`lib/auth-api.ts`)

**제공 함수:**
- `signup(signupData)` - 회원가입
- `login(loginData)` - 로그인
- `getProfile()` - 프로필 조회
- `logout()` - 로그아웃
- `getCurrentUser()` - 현재 사용자 정보 가져오기
- `isAuthenticated()` - 로그인 상태 확인

**타입 정의:**
```typescript
interface SignupData {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}
```

### 3. 인증 Context (`contexts/AuthContext.tsx`)

**제공 상태 및 함수:**
```typescript
{
  user: User | null;            // 현재 로그인된 사용자
  isAuthenticated: boolean;     // 로그인 여부
  isLoading: boolean;           // 로딩 상태
  setUser: (user) => void;      // 사용자 정보 업데이트
  logout: () => void;           // 로그아웃
}
```

**사용 예시:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>로그인이 필요합니다</div>;
  }

  return (
    <div>
      <p>환영합니다, {user?.name}님!</p>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
```

### 4. 회원가입 페이지 (`app/auth/signup/page.tsx`)

**변경사항:**
- API 연동 (`signup` 함수 호출)
- 로딩 상태 처리
- 에러 메시지 표시
- 성공 시 대시보드로 자동 이동
- AuthContext를 통한 사용자 상태 업데이트

**처리 흐름:**
1. 폼 입력 검증
2. API 호출 (`signup`)
3. 성공 시:
   - JWT 토큰 localStorage 저장
   - 사용자 정보 저장
   - AuthContext 업데이트
   - `/dashboard`로 리다이렉트
4. 실패 시:
   - 에러 메시지 표시

### 5. 로그인 페이지 (`app/auth/login/page.tsx`)

**변경사항:**
- API 연동 (`login` 함수 호출)
- 2단계 로그인 유지 (이메일 → 비밀번호)
- 로딩 상태 처리
- 에러 메시지 표시
- 성공 시 대시보드로 자동 이동

**처리 흐름:**
1. Step 1: 이메일 입력 및 검증
2. Step 2: 비밀번호 입력
3. API 호출 (`login`)
4. 성공 시:
   - JWT 토큰 저장
   - 사용자 정보 저장
   - AuthContext 업데이트
   - `/dashboard`로 리다이렉트

## 🔐 인증 흐름

### 회원가입 흐름
```
사용자 입력
  → 프론트엔드 검증
  → POST /signup
  → Lambda 함수 처리
  → PostgreSQL 저장
  → JWT 토큰 발급
  → 프론트엔드 저장 (localStorage)
  → 대시보드 이동
```

### 로그인 흐름
```
이메일 입력
  → 이메일 검증
  → 비밀번호 입력
  → POST /login
  → Lambda 함수 처리
  → 비밀번호 검증 (bcrypt)
  → JWT 토큰 발급
  → 프론트엔드 저장
  → 대시보드 이동
```

### 인증이 필요한 API 호출
```
API 요청
  → localStorage에서 토큰 가져오기
  → Authorization: Bearer [token]
  → Lambda 함수에서 토큰 검증
  → 응답 반환
```

## 💾 데이터 저장

### localStorage에 저장되는 데이터:

1. **token** (JWT 토큰)
   ```
   localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIs...')
   ```

2. **user** (사용자 정보)
   ```javascript
   localStorage.setItem('user', JSON.stringify({
     id: 1,
     name: "홍길동",
     email: "hong@example.com",
     company: "Keystone Partners",
     phone: "010-1234-5678",
     createdAt: "2025-11-03T..."
   }))
   ```

## 🚀 사용 방법

### 1. 다른 페이지에서 인증 확인

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>환영합니다, {user?.name}님!</h1>
      {/* 보호된 컨텐츠 */}
    </div>
  );
}
```

### 2. 프로필 정보 가져오기

```tsx
import { getProfile } from '@/lib/auth-api';
import { useAuth } from '@/contexts/AuthContext';

async function fetchProfile() {
  const { data, error } = await getProfile();

  if (error) {
    console.error('프로필 조회 실패:', error);
    return;
  }

  console.log('프로필:', data);
  // AuthContext가 자동으로 localStorage 업데이트
}
```

### 3. 로그아웃 구현

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout(); // localStorage 정리 + Context 업데이트
    router.push('/auth/login');
  };

  return (
    <button onClick={handleLogout}>
      로그아웃
    </button>
  );
}
```

### 4. 인증이 필요한 API 호출 예시

```tsx
import { authenticatedApiRequest } from '@/lib/api-config';

async function updateProfile(data) {
  const result = await authenticatedApiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (result.error) {
    console.error('프로필 업데이트 실패:', result.error);
    return;
  }

  console.log('프로필 업데이트 성공:', result.data);
}
```

## 🧪 테스트

### 로컬에서 테스트

1. **개발 서버 실행:**
   ```bash
   cd ~/Desktop/keystonepartners/keystonepartners-app
   npm run dev
   ```

2. **회원가입 테스트:**
   - http://localhost:3000/auth/signup 접속
   - 정보 입력 후 회원가입 버튼 클릭
   - 성공 시 자동으로 `/dashboard`로 이동

3. **로그인 테스트:**
   - http://localhost:3000/auth/login 접속
   - 이메일 입력 → 다음
   - 비밀번호 입력 → 로그인
   - 성공 시 자동으로 `/dashboard`로 이동

4. **개발자 도구로 확인:**
   - F12 → Application → Local Storage
   - `token`과 `user` 데이터 확인

### curl로 API 직접 테스트

```bash
# 회원가입
curl -X POST https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트유저",
    "email": "test@example.com",
    "password": "test1234",
    "company": "테스트회사",
    "phone": "010-1234-5678"
  }'

# 로그인
curl -X POST https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234"
  }'

# 프로필 조회 (토큰 필요)
curl -X GET https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod/profile \
  -H "Authorization: Bearer [토큰]"
```

## 🔍 에러 처리

### 일반적인 에러 케이스

1. **네트워크 오류:**
   ```
   "네트워크 오류가 발생했습니다."
   ```

2. **이메일 중복:**
   ```
   "이미 사용 중인 이메일입니다."
   ```

3. **로그인 실패:**
   ```
   "이메일 또는 비밀번호가 올바르지 않습니다."
   ```

4. **토큰 만료:**
   ```
   "유효하지 않은 토큰입니다."
   → 자동으로 로그인 페이지로 리다이렉트
   ```

## 📋 TODO: 추가 구현 필요

- [ ] Protected Route 컴포넌트 생성
- [ ] 토큰 자동 갱신 (Refresh Token)
- [ ] 프로필 수정 페이지
- [ ] 비밀번호 변경 기능
- [ ] 이메일 인증
- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 로딩/에러 상태 개선 (Toast 메시지)

## 🔧 환경 변수 (선택사항)

`.env.local` 파일 생성:
```env
NEXT_PUBLIC_API_URL=https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod
```

사용:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://...';
```

---

**작성일:** 2025-11-03
**버전:** 1.0
