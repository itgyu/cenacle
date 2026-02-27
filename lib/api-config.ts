import { logger, isAuthError } from './errors';

// API 기본 설정
export const API_BASE_URL = 'https://su1m1ky0ib.execute-api.eu-north-1.amazonaws.com/prod';

export const API_ENDPOINTS = {
  SIGNUP: '/signup',
  LOGIN: '/login',
  PROFILE: '/profile',
} as const;

/**
 * API Response type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}

/**
 * API 요청 헬퍼 함수
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    logger.debug('API Request:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    logger.debug('API Response Status:', response.status);
    const data = await response.json();

    if (!response.ok) {
      // 실제 API는 error 필드로 에러 메시지 전달
      return {
        error: data.error || data.message || '요청 처리 중 오류가 발생했습니다.',
        code: data.code,
      };
    }

    return { data };
  } catch (error) {
    logger.error('API Request Error:', error);
    return { error: '네트워크 오류가 발생했습니다.' };
  }
}

/**
 * 인증이 필요한 API 요청
 */
export async function authenticatedApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return { error: '로그인이 필요합니다.', code: 'UNAUTHORIZED' };
  }

  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Check if response indicates auth error and handle accordingly
 */
export function handleApiError(
  error: string,
  router: { replace: (path: string) => void }
): boolean {
  if (isAuthError(error)) {
    logger.info('Authentication error detected, redirecting to login');
    router.replace('/auth/login');
    return true;
  }
  return false;
}
