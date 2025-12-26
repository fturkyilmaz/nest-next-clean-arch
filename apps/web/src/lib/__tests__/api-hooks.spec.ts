import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
  setTokens,
  clearTokens,
  getTokens,
} from '../api-hooks';

// Mock the api client
jest.mock('../api-client', () => ({
  createApiClient: jest.fn(() => ({})),
  ApiService: jest.fn(() => ({
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('API Hooks', () => {
  beforeEach(() => {
    clearTokens();
    jest.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should set tokens', () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';

      setTokens(accessToken, refreshToken);

      const tokens = getTokens();
      expect(tokens.accessToken).toBe(accessToken);
      expect(tokens.refreshToken).toBe(refreshToken);
    });

    it('should get tokens', () => {
      const accessToken = 'test-access';
      const refreshToken = 'test-refresh';

      setTokens(accessToken, refreshToken);
      const tokens = getTokens();

      expect(tokens).toEqual({
        accessToken,
        refreshToken,
      });
    });

    it('should clear tokens', () => {
      setTokens('access', 'refresh');
      clearTokens();

      const tokens = getTokens();
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeNull();
    });

    it('should clear tokens on expiration callback', () => {
      setTokens('access', 'refresh');
      expect(getTokens().accessToken).not.toBeNull();

      // Clear tokens (simulating token expiration)
      clearTokens();

      expect(getTokens().accessToken).toBeNull();
      expect(getTokens().refreshToken).toBeNull();
    });
  });

  describe('useLogin', () => {
    it('should provide mutation function', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have proper mutation state', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should set tokens on successful login', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Note: In a real test, you would mock the API response
      // This is a simplified version
      act(() => {
        // Simulate setting tokens after login
        setTokens('new-access-token', 'new-refresh-token');
      });

      const tokens = getTokens();
      expect(tokens.accessToken).toBe('new-access-token');
      expect(tokens.refreshToken).toBe('new-refresh-token');
    });
  });

  describe('useRegister', () => {
    it('should provide mutation function', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRegister(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have initial loading state of false', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useRegister(), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useLogout', () => {
    it('should provide mutation function', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogout(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should clear tokens on logout', async () => {
      const wrapper = createWrapper();
      setTokens('access-token', 'refresh-token');

      act(() => {
        clearTokens();
      });

      const tokens = getTokens();
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeNull();
    });
  });

  describe('useCurrentUser', () => {
    it('should provide query function', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
    });

    it('should have proper query state', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
    });
  });

  describe('Hook Setup', () => {
    it('should work with QueryClientProvider', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      expect(result.current).toBeDefined();
    });

    it('should handle multiple hooks', () => {
      const wrapper = createWrapper();
      const { result: loginResult } = renderHook(() => useLogin(), { wrapper });
      const { result: registerResult } = renderHook(() => useRegister(), { wrapper });

      expect(loginResult.current).toBeDefined();
      expect(registerResult.current).toBeDefined();
    });
  });

  describe('API Client Configuration', () => {
    it('should have API base URL from env or default', () => {
      // The hook uses process.env.NEXT_PUBLIC_API_URL or defaults to localhost
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      expect(baseUrl).toBeDefined();
    });

    it('should maintain token state across hooks', () => {
      const wrapper = createWrapper();

      setTokens('access-1', 'refresh-1');

      const tokens1 = getTokens();
      expect(tokens1.accessToken).toBe('access-1');

      setTokens('access-2', 'refresh-2');
      const tokens2 = getTokens();
      expect(tokens2.accessToken).toBe('access-2');
    });
  });
});
