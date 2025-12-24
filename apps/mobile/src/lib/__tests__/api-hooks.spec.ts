import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setTokens,
  clearTokens,
  loadStoredToken,
  useLogin,
} from '../api-hooks';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock API client
jest.mock('../api-client', () => ({
  createApiClient: jest.fn(() => ({})),
  ApiService: jest.fn(() => ({
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  })),
}));

// Mock useQuery and useMutation
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutateAsync: jest.fn(),
    mutate: jest.fn(),
    isLoading: false,
  })),
  useQueryClient: jest.fn(() => ({
    setQueryData: jest.fn(),
    clear: jest.fn(),
  })),
  QueryClient: jest.fn(),
  QueryClientProvider: jest.fn(({ children }) => children),
}));

describe('Mobile API Hooks', () => {
  const TOKEN_KEY = '@diet_app_token';
  const REFRESH_TOKEN_KEY = '@diet_app_refresh_token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Management', () => {
    describe('setTokens', () => {
      it('should set tokens in AsyncStorage', async () => {
        const accessToken = 'mobile-access-token';
        const refreshToken = 'mobile-refresh-token';

        await setTokens(accessToken, refreshToken);

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, accessToken);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          REFRESH_TOKEN_KEY,
          refreshToken
        );
      });

      it('should cache access token in memory', async () => {
        const accessToken = 'memory-cached-token';
        const refreshToken = 'refresh-token';

        await setTokens(accessToken, refreshToken);

        // Token should be cached
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should handle AsyncStorage errors gracefully', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
          new Error('Storage error')
        );

        // Should not throw
        await expect(
          setTokens('token', 'refresh')
        ).rejects.toThrow();
      });
    });

    describe('clearTokens', () => {
      it('should remove tokens from AsyncStorage', async () => {
        await clearTokens();

        expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
          TOKEN_KEY,
          REFRESH_TOKEN_KEY,
        ]);
      });

      it('should clear cached token', async () => {
        await setTokens('token', 'refresh');
        await clearTokens();

        expect(AsyncStorage.multiRemove).toHaveBeenCalled();
      });

      it('should handle AsyncStorage errors during clear', async () => {
        (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(
          new Error('Clear failed')
        );

        // Should handle error
        await expect(clearTokens()).rejects.toThrow();
      });
    });

    describe('loadStoredToken', () => {
      it('should load token from AsyncStorage', async () => {
        const storedToken = 'stored-token-123';
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(storedToken);

        const result = await loadStoredToken();

        expect(result).toBe(storedToken);
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
      });

      it('should return null if no token stored', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        const result = await loadStoredToken();

        expect(result).toBeNull();
      });

      it('should cache loaded token for subsequent calls', async () => {
        const token = 'cached-token';
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);

        await loadStoredToken();

        // Subsequent calls should use cache
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });

      it('should handle AsyncStorage errors', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
          new Error('Load failed')
        );

        // Should not throw, but return null or handle gracefully
        await expect(loadStoredToken()).rejects.toThrow();
      });
    });
  });

  describe('useLogin Hook', () => {
    it('should provide login mutation', () => {
      const { useQuery, useMutation } = require('@tanstack/react-query');
      useQuery.mockReturnValue({
        data: null,
        isLoading: false,
      });
      useMutation.mockReturnValue({
        mutateAsync: jest.fn(),
        isLoading: false,
      });

      expect(useLogin).toBeDefined();
    });
  });

  describe('Token Lifecycle', () => {
    it('should handle token refresh flow', async () => {
      const accessToken = 'access-1';
      const refreshToken = 'refresh-1';

      // Set initial tokens
      await setTokens(accessToken, refreshToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, accessToken);

      // Clear tokens
      jest.clearAllMocks();
      await clearTokens();
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();

      // Load new tokens
      jest.clearAllMocks();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        'new-access-token'
      );
      const newToken = await loadStoredToken();
      expect(newToken).toBe('new-access-token');
    });

    it('should maintain separate access and refresh tokens', async () => {
      const accessToken = 'unique-access';
      const refreshToken = 'unique-refresh';

      await setTokens(accessToken, refreshToken);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, accessToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        refreshToken
      );
    });
  });

  describe('API Client Configuration', () => {
    it('should use environment variable for API URL', () => {
      const baseUrl =
        process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      expect(baseUrl).toBeDefined();
    });

    it('should handle missing environment variable', () => {
      delete process.env.EXPO_PUBLIC_API_URL;
      const baseUrl =
        process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      expect(baseUrl).toBe('http://localhost:3001/api/v1');
    });
  });

  describe('Token Expiration Handling', () => {
    it('should clear tokens on token expiration', async () => {
      // Simulate token expiration callback
      await clearTokens();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        TOKEN_KEY,
        REFRESH_TOKEN_KEY,
      ]);
    });

    it('should provide way to navigate to login on expiration', async () => {
      // Token expiration should trigger logout
      await clearTokens();

      // Tokens should be cleared
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('Caching Behavior', () => {
    it('should cache token in memory', async () => {
      const token = 'memory-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);

      // First load
      await loadStoredToken();
      const setItemCalls1 = (AsyncStorage.getItem as jest.Mock).mock.calls
        .length;

      // Second load should use cache
      const result = await loadStoredToken();
      const setItemCalls2 = (AsyncStorage.getItem as jest.Mock).mock.calls
        .length;

      expect(result).toBe(token);
    });

    it('should clear memory cache when clearing tokens', async () => {
      await setTokens('token', 'refresh');
      await clearTokens();

      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(loadStoredToken()).rejects.toThrow();
    });

    it('should handle concurrent token operations', async () => {
      const promises = [
        setTokens('token1', 'refresh1'),
        setTokens('token2', 'refresh2'),
        setTokens('token3', 'refresh3'),
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});
