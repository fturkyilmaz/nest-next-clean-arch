import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear the store before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user and set tokens', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'DIETITIAN' as const,
    };

    act(() => {
      result.current.login(mockUser, 'access-token', 'refresh-token');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.accessToken).toBe('access-token');
    expect(result.current.refreshToken).toBe('refresh-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'DIETITIAN' as const,
    };

    act(() => {
      result.current.login(mockUser, 'access-token', 'refresh-token');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.refreshToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update access token', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAccessToken('new-token');
    });

    expect(result.current.accessToken).toBe('new-token');
  });

  it('should update refresh token', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setRefreshToken('new-refresh-token');
    });

    expect(result.current.refreshToken).toBe('new-refresh-token');
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });
});
