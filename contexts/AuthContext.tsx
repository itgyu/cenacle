'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getCurrentUser, isAuthenticated as checkAuth, logout as logoutApi } from '@/lib/auth-api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 로그인 상태 확인
    const initAuth = () => {
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const logout = () => {
    logoutApi();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    setIsAuthenticated(!!newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser: handleSetUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
