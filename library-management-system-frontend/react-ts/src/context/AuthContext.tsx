/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import React, { createContext, useCallback, useEffect, useState } from 'react';
import authApi from '../api/authApi';
import { clearAccessToken, setAccessToken, setOnAuthFailure } from '../api/tokenStorage';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types';

export interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateCurrentUser: (updatedUser: UserResponse) => void;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth: attempt to refresh session from HttpOnly cookie
  const initializeAuth = useCallback(async () => {
    try {
      const authRes = await authApi.refresh();
      if (authRes.token) {
        setAccessToken(authRes.token);
        const userProfile = await authApi.getMe();
        setUser(userProfile);
      } else {
        clearAccessToken();
        setUser(null);
      }
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Wire up global auth failure handler from axios interceptor
    setOnAuthFailure(() => {
      clearAccessToken();
      setUser(null);
    });

    return () => {
      setOnAuthFailure(null);
    };
  }, [initializeAuth]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    const authRes = await authApi.login(credentials);
    if (!authRes.token) {
      throw new Error('No access token returned from login');
    }
    setAccessToken(authRes.token);
    const userProfile = await authApi.getMe();
    setUser(userProfile);
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    return await authApi.register(data);
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const updateCurrentUser = useCallback((updatedUser: UserResponse) => {
    setUser(updatedUser);
  }, []);

  const refreshSession = useCallback(async () => {
    const authRes = await authApi.refresh();
    if (authRes.token) {
      setAccessToken(authRes.token);
      const userProfile = await authApi.getMe();
      setUser(userProfile);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateCurrentUser,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
