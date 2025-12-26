'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { apiService } from '../api-client';

const REFRESH_BUFFER_MS = 60_000; 
const TOKEN_LIFETIME_MS = 25 * 60 * 1000; 

export function useAuthInitializer() {
  const { hydrate, setLoading } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      hydrate();
      setLoading(false);
    }
  }, [hydrate, setLoading]);
}

export function useTokenRefresh() {
  const { accessToken, refreshToken, login, logout, user } = useAuthStore();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTokenRefresh = useCallback(async () => {
    if (!refreshToken || !user) return;

    try {
      const response = await apiService.refreshToken(refreshToken);

      login(user, response.accessToken, response.refreshToken || refreshToken);

      // Yeni refresh için tekrar timeout planla
      refreshTimeoutRef.current = setTimeout(
        scheduleTokenRefresh,
        TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS
      );
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [refreshToken, user, login, logout]);

  useEffect(() => {
    if (accessToken && refreshToken) {
      refreshTimeoutRef.current = setTimeout(
        scheduleTokenRefresh,
        TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS
      );
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [accessToken, refreshToken, scheduleTokenRefresh]);
}

export function useHandleTokenExpiry() {
  const { logout } = useAuthStore();

  useEffect(() => {
    const handleTokenExpired = () => {
      logout();
    };

    window.addEventListener('token-expired', handleTokenExpired);
    return () => {
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, [logout]);
}
