/**
 * Error Code Definitions
 * Standardized error codes for consistent error handling
 */

export const ErrorCode = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * API Error Response interface
 */
export interface ApiError {
  error: string;
  code?: ErrorCodeType;
  message?: string;
}

/**
 * Check if error indicates authentication failure
 */
export function isAuthError(error: string | ApiError): boolean {
  if (typeof error === 'string') {
    const authKeywords = ['로그인', 'token', '인증', 'unauthorized', 'authentication'];
    return authKeywords.some((keyword) => error.toLowerCase().includes(keyword.toLowerCase()));
  }

  return (
    error.code === ErrorCode.UNAUTHORIZED ||
    error.code === ErrorCode.FORBIDDEN ||
    error.code === ErrorCode.TOKEN_EXPIRED ||
    error.code === ErrorCode.INVALID_TOKEN
  );
}

/**
 * Check if error indicates not found
 */
export function isNotFoundError(error: string | ApiError): boolean {
  if (typeof error === 'string') {
    return error.toLowerCase().includes('not found');
  }
  return error.code === ErrorCode.NOT_FOUND;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: string | ApiError): string {
  const messages: Record<string, string> = {
    [ErrorCode.UNAUTHORIZED]: '로그인이 필요합니다.',
    [ErrorCode.FORBIDDEN]: '접근 권한이 없습니다.',
    [ErrorCode.TOKEN_EXPIRED]: '로그인이 만료되었습니다. 다시 로그인해주세요.',
    [ErrorCode.INVALID_TOKEN]: '인증 정보가 올바르지 않습니다.',
    [ErrorCode.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
    [ErrorCode.CONFLICT]: '이미 존재하는 데이터입니다.',
    [ErrorCode.NETWORK_ERROR]: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
    [ErrorCode.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  };

  if (typeof error === 'object' && error.code && messages[error.code]) {
    return messages[error.code];
  }

  if (typeof error === 'string') {
    // Map common API error messages to Korean
    if (error.includes('Invalid credentials') || error.includes('password')) {
      return '이메일 또는 비밀번호가 일치하지 않습니다.';
    }
    if (error.includes('User not found') || error.includes('not found')) {
      return '등록되지 않은 이메일입니다.';
    }
    if (error.includes('network') || error.includes('Network')) {
      return '네트워크 오류가 발생했습니다.';
    }
    if (error.includes('Email already exists')) {
      return '이미 사용 중인 이메일입니다.';
    }
  }

  return typeof error === 'string' ? error : error.error || '알 수 없는 오류가 발생했습니다.';
}

/**
 * Logger utility that respects environment
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};
