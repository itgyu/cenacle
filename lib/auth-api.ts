import { apiRequest, authenticatedApiRequest, API_ENDPOINTS } from './api-config';
import { logger, getUserFriendlyMessage } from './errors';

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

/**
 * Save auth token to localStorage
 * Note: Only token is stored locally, user data is fetched from API
 */
function saveAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    logger.debug('Auth token saved');
  }
}

/**
 * Clear auth token from localStorage
 */
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    logger.debug('Auth token cleared');
  }
}

/**
 * 회원가입 API
 */
export async function signup(signupData: SignupData) {
  const { data, error } = await apiRequest<AuthResponse>(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    body: JSON.stringify(signupData),
  });

  if (error || !data) {
    return { error: getUserFriendlyMessage(error || '회원가입에 실패했습니다.') };
  }

  // 토큰만 저장 (사용자 정보는 AWS에서 관리)
  if (data.token) {
    saveAuthToken(data.token);
  }

  return { data: { user: data.user, token: data.token } };
}

/**
 * 로그인 API
 */
export async function login(loginData: LoginData) {
  logger.debug('Starting login for:', loginData.email);

  const { data, error } = await apiRequest<AuthResponse>(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify(loginData),
  });

  if (error || !data) {
    logger.debug('Login failed');
    return { error: getUserFriendlyMessage(error || '로그인에 실패했습니다.') };
  }

  // 토큰만 저장 (사용자 정보는 AWS에서 관리)
  if (data.token) {
    saveAuthToken(data.token);
    logger.debug('Login successful');
  }

  return { data: { user: data.user, token: data.token } };
}

/**
 * 프로필 조회 API
 */
export async function getProfile() {
  const { data, error } = await authenticatedApiRequest<ProfileResponse>(API_ENDPOINTS.PROFILE);

  if (error || !data) {
    return { error: getUserFriendlyMessage(error || '프로필 조회에 실패했습니다.') };
  }

  // 사용자 정보는 localStorage에 저장하지 않고 반환만 함
  return { data: data.data.user };
}

/**
 * 로그아웃
 */
export function logout() {
  clearAuthToken();
}

/**
 * 현재 로그인된 사용자 정보 가져오기
 * Note: 이 함수는 deprecated. 대신 getProfile() API를 사용하세요.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  // API에서 사용자 정보 조회
  const { data, error } = await getProfile();
  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * 로그인 상태 확인
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem('token');
}
