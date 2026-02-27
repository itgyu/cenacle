'use client';

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-api';
import { logger } from '@/lib/errors';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

interface AuthState {
  isChecking: boolean;
  isAuthed: boolean;
}

/**
 * AuthGuard component that protects routes requiring authentication.
 * Automatically redirects to login if not authenticated.
 */
export function AuthGuard({ children, fallback, redirectTo = '/auth/login' }: AuthGuardProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isChecking: true,
    isAuthed: false,
  });

  const checkAuth = useCallback(() => {
    logger.debug('AuthGuard: Checking authentication...');

    const authenticated = isAuthenticated();
    logger.debug('AuthGuard: Authenticated:', authenticated);

    if (!authenticated) {
      logger.info('AuthGuard: Not authenticated, redirecting to', redirectTo);
      router.replace(redirectTo);
      return;
    }

    setAuthState({ isChecking: false, isAuthed: true });
  }, [router, redirectTo]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner while checking authentication
  if (authState.isChecking) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#4b5840] border-t-transparent rounded-full animate-spin" />
        </div>
      )
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!authState.isAuthed) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook for checking authentication status
 */
export function useAuthGuard(redirectTo = '/auth/login') {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isChecking: true,
    isAuthed: false,
  });

  const checkAuth = useCallback(() => {
    const authenticated = isAuthenticated();

    if (!authenticated) {
      router.replace(redirectTo);
      return;
    }

    setAuthState({ isChecking: false, isAuthed: true });
  }, [router, redirectTo]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isChecking: authState.isChecking, isAuthenticated: authState.isAuthed };
}
