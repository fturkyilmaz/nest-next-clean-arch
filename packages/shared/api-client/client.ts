// packages/shared/api/client.ts
import axios, { AxiosInstance } from 'axios';

/**
 * Axios client instance used by Orval generated hooks.
 * Orval config expects `export const api`.
 */
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// JWT token eklemek için interceptor
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Opsiyonel: 401 durumunda refresh/logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized, handle refresh or redirect to login');
    }
    return Promise.reject(error);
  },
);
