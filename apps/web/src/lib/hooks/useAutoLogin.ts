'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { getRememberedCredentials, clearRememberedCredentials } from '@/lib/remember-me';
import { api } from '@/lib/api-hooks';

/**
 * Hook to handle auto-login with remembered credentials
 * Should be called once on app startup if user is not already authenticated
 */
export function useAutoLoginRemembered() {
  const router = useRouter();
  const { isAuthenticated, login, setLoading } = useAuthStore();

  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (isAuthenticated) {
        return; // Already logged in
      }

      const remembered = getRememberedCredentials();
      if (!remembered) {
        return; // No remembered credentials
      }

      try {
        setLoading(true);

        // Try to use refresh token to get new access token
        const response = await api.refreshToken(remembered.token);

        // Update auth store with refreshed credentials
        login(response.user, response.accessToken, response.refreshToken);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Auto-login failed:', error);
        // Clear invalid credentials
        clearRememberedCredentials();
        setLoading(false);
      }
    };

    attemptAutoLogin();
  }, [isAuthenticated, login, router, setLoading]);
}
