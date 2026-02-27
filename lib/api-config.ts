// API 기본 설정
export const API_BASE_URL = 'https://s1pi302i06.execute-api.eu-north-1.amazonaws.com/prod';

export const API_ENDPOINTS = {
  SIGNUP: '/signup',
  LOGIN: '/login',
  PROFILE: '/profile',
} as const;

// API 요청 헬퍼 함수
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('[API Request]', url);
    console.log('[API Options]', options);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('[API Response Status]', response.status);
    const data = await response.json();
    console.log('[API Response Data]', data);

    if (!response.ok) {
      // 실제 API는 error 필드로 에러 메시지 전달
      return { error: data.error || data.message || '요청 처리 중 오류가 발생했습니다.' };
    }

    return { data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { error: '네트워크 오류가 발생했습니다.' };
  }
}

// 인증이 필요한 API 요청
export async function authenticatedApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  const token = localStorage.getItem('token');

  if (!token) {
    return { error: '로그인이 필요합니다.' };
  }

  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
