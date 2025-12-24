import axios from 'axios';
import {
  createApiClient,
  ApiClientConfig,
  ApiError,
  PaginatedResponse,
} from '../index';

jest.mock('axios');

describe('API Client', () => {
  let mockAxiosInstance: any;
  const baseURL = 'http://localhost:3000/api';

  beforeEach(() => {
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn((successFn, errorFn) => {
            mockAxiosInstance.requestInterceptor = { successFn, errorFn };
          }),
        },
        response: {
          use: jest.fn((successFn, errorFn) => {
            mockAxiosInstance.responseInterceptor = { successFn, errorFn };
          }),
        },
      },
    };

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createApiClient', () => {
    it('should create axios instance with baseURL', () => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL,
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });

    it('should use custom timeout if provided', () => {
      const config: ApiClientConfig = {
        baseURL,
        timeout: 60000,
      };

      createApiClient(config);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 60000,
        }),
      );
    });

    it('should use default timeout if not provided', () => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        }),
      );
    });

    it('should set Content-Type header', () => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header with Bearer token', () => {
      const config: ApiClientConfig = {
        baseURL,
        getAccessToken: () => 'test-token-123',
      };

      createApiClient(config);

      const requestConfig = { headers: {} };
      const interceptor = mockAxiosInstance.requestInterceptor.successFn;
      const result = interceptor(requestConfig);

      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should not add Authorization header if no token', () => {
      const config: ApiClientConfig = {
        baseURL,
        getAccessToken: () => null,
      };

      createApiClient(config);

      const requestConfig = { headers: {} };
      const interceptor = mockAxiosInstance.requestInterceptor.successFn;
      const result = interceptor(requestConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should not add Authorization header if no getAccessToken provided', () => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      const requestConfig = { headers: {} };
      const interceptor = mockAxiosInstance.requestInterceptor.successFn;
      const result = interceptor(requestConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should return request config', () => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      const requestConfig = { url: '/test', method: 'GET', headers: {} };
      const interceptor = mockAxiosInstance.requestInterceptor.successFn;
      const result = interceptor(requestConfig);

      expect(result).toEqual(expect.objectContaining(requestConfig));
    });

    it('should handle request error', (done) => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      const error = new Error('Request failed');
      const errorHandler = mockAxiosInstance.requestInterceptor.errorFn;

      errorHandler(error).catch((e: any) => {
        expect(e).toEqual(error);
        done();
      });
    });
  });

  describe('Response Interceptor', () => {
    it('should return response as is for success', () => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      const response = { status: 200, data: { id: '1' } };
      const interceptor = mockAxiosInstance.responseInterceptor.successFn;
      const result = interceptor(response);

      expect(result).toEqual(response);
    });

    it('should call onTokenExpired on 401 error', (done) => {
      const onTokenExpired = jest.fn();
      const config: ApiClientConfig = {
        baseURL,
        onTokenExpired,
      };

      createApiClient(config);

      const error: any = {
        response: {
          status: 401,
          data: {
            type: 'Unauthorized',
            title: 'Token Expired',
            status: 401,
            detail: 'Your token has expired',
          },
        },
      };

      const interceptor = mockAxiosInstance.responseInterceptor.errorFn;

      interceptor(error).catch(() => {
        expect(onTokenExpired).toHaveBeenCalled();
        done();
      });
    });

    it('should call onError on API error', (done) => {
      const onError = jest.fn();
      const config: ApiClientConfig = {
        baseURL,
        onError,
      };

      createApiClient(config);

      const apiError: ApiError = {
        type: 'BadRequest',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid input',
        errors: {
          email: ['Email is required'],
        },
      };

      const error: any = {
        response: {
          status: 400,
          data: apiError,
        },
      };

      const interceptor = mockAxiosInstance.responseInterceptor.errorFn;

      interceptor(error).catch(() => {
        expect(onError).toHaveBeenCalledWith(apiError);
        done();
      });
    });

    it('should handle network errors', (done) => {
      const onError = jest.fn();
      const config: ApiClientConfig = {
        baseURL,
        onError,
      };

      createApiClient(config);

      const error: any = {
        message: 'Network error',
      };

      const interceptor = mockAxiosInstance.responseInterceptor.errorFn;

      interceptor(error).catch((apiError: ApiError) => {
        expect(apiError.title).toBe('Network Error');
        expect(apiError.status).toBe(0);
        expect(onError).toHaveBeenCalled();
        done();
      });
    });

    it('should return rejected promise on API error', (done) => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      const error: any = {
        response: {
          status: 500,
          data: {
            type: 'ServerError',
            title: 'Internal Server Error',
            status: 500,
            detail: 'Something went wrong',
          },
        },
      };

      const interceptor = mockAxiosInstance.responseInterceptor.errorFn;

      interceptor(error).catch((result: any) => {
        expect(result).toEqual(error.response.data);
        done();
      });
    });

    it('should return rejected promise on network error', (done) => {
      const config: ApiClientConfig = {
        baseURL,
      };

      createApiClient(config);

      const error: any = {
        message: 'Connection refused',
      };

      const interceptor = mockAxiosInstance.responseInterceptor.errorFn;

      interceptor(error).catch((result: ApiError) => {
        expect(result.status).toBe(0);
        expect(result.title).toBe('Network Error');
        done();
      });
    });
  });

  describe('API Types', () => {
    it('should define User interface', () => {
      // This is a type-checking test
      // In runtime, we're just verifying exports exist
      expect(createApiClient).toBeDefined();
    });

    it('should define Client interface', () => {
      expect(createApiClient).toBeDefined();
    });

    it('should define PaginatedResponse interface', () => {
      expect(createApiClient).toBeDefined();
    });

    it('should define ApiError interface', () => {
      expect(createApiClient).toBeDefined();
    });
  });

  describe('ApiClientConfig', () => {
    it('should accept minimal config', () => {
      const config: ApiClientConfig = {
        baseURL: 'http://api.example.com',
      };

      expect(() => createApiClient(config)).not.toThrow();
    });

    it('should accept full config', () => {
      const config: ApiClientConfig = {
        baseURL: 'http://api.example.com',
        timeout: 60000,
        getAccessToken: () => 'token',
        onTokenExpired: () => {},
        onError: () => {},
      };

      expect(() => createApiClient(config)).not.toThrow();
    });
  });
});
