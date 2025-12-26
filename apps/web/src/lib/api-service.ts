import { createApiClient, ApiService } from './api-client';
import { useAuthStore } from '@/stores/auth.store';

let apiServiceInstance: ApiService | null = null;

export function initializeApiClient(): ApiService {
  if (apiServiceInstance) {
    return apiServiceInstance;
  }

  const client = createApiClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    getAccessToken: () => useAuthStore.getState().accessToken,
    onTokenExpired: () => {
      useAuthStore.getState().logout();
      // Redirect to login is handled by middleware
      window.dispatchEvent(new Event('token-expired'));
    },
    onError: (error) => {
      console.error('API Error:', error);
    },
  });

  apiServiceInstance = new ApiService(client);
  return apiServiceInstance;
}

export function getApiService(): ApiService {
  if (!apiServiceInstance) {
    return initializeApiClient();
  }
  return apiServiceInstance;
}

export const apiService = new Proxy({} as ApiService, {
  get(target, prop) {
    const service = getApiService();
    const value = (service as any)[prop];
    if (typeof value === 'function') {
      return value.bind(service);
    }
    return value;
  },
});
