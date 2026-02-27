import { apiRequest, authenticatedApiRequest, API_ENDPOINTS } from './api-config';

// 타입 정의
export interface SignupData {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

// 실제 API 응답 형식 (성공)
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// API 에러 응답 형식
export interface ErrorResponse {
  error: string;
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// 회원가입 API
export async function signup(signupData: SignupData) {
  const { data, error } = await apiRequest<AuthResponse>(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    body: JSON.stringify(signupData),
  });

  if (error || !data) {
    return { error: error || '회원가입에 실패했습니다.' };
  }

  // 토큰과 사용자 정보 저장 (실제 API 응답 형식에 맞춤)
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return { data: { user: data.user, token: data.token } };
}

// 로그인 API
export async function login(loginData: LoginData) {
  console.log('[Login] Starting login with:', loginData.email);

  const { data, error } = await apiRequest<AuthResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(loginData),
  });

  if (error || !data) {
    console.error('[Login] Login failed:', error);

    // API 에러 메시지를 사용자 친화적인 한글로 변환
    let errorMessage = error || '로그인에 실패했습니다.';

    if (error?.includes('Invalid credentials') || error?.includes('password')) {
      errorMessage = '이메일 또는 비밀번호가 일치하지 않습니다.';
    } else if (error?.includes('User not found') || error?.includes('not found')) {
      errorMessage = '등록되지 않은 이메일입니다.';
    } else if (error?.includes('network') || error?.includes('Network')) {
      errorMessage = '네트워크 오류가 발생했습니다. 다시 시도해주세요.';
    }

    return { error: errorMessage };
  }

  // 토큰과 사용자 정보 저장 (실제 API 응답 형식에 맞춤)
  if (data.token) {
    console.log('[Login] Saving token and user to localStorage');
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('[Login] Token saved:', data.token.substring(0, 20) + '...');
    console.log('[Login] User saved:', data.user);
  }

  return { data: { user: data.user, token: data.token } };
}

// 프로필 조회 API
export async function getProfile() {
  const { data, error } = await authenticatedApiRequest<ProfileResponse>(
    API_ENDPOINTS.PROFILE
  );

  if (error || !data) {
    return { error: error || '프로필 조회에 실패했습니다.' };
  }

  // 사용자 정보 업데이트
  localStorage.setItem('user', JSON.stringify(data.data.user));

  return { data: data.data.user };
}

// 로그아웃
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// 현재 로그인된 사용자 정보 가져오기
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// 로그인 상태 확인
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}
