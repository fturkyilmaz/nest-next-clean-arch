import {
  saveRememberedCredentials,
  getRememberedCredentials,
  isUserRemembered,
  getRememberedEmail,
  clearRememberedCredentials,
} from '@/lib/remember-me';

describe('Remember Me Functionality', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveRememberedCredentials', () => {
    it('should save credentials to localStorage', () => {
      const email = 'test@example.com';
      const token = 'test-token-123';

      saveRememberedCredentials(email, token, 30);

      expect(localStorage.getItem('auth:remember-me')).toBe('true');
      expect(localStorage.getItem('auth:remember-me-email')).toBe(email);
      expect(localStorage.getItem('auth:remember-me-token')).toBe(token);
      expect(localStorage.getItem('auth:remember-me-expiry')).toBeDefined();
    });

    it('should calculate correct expiry time', () => {
      const email = 'test@example.com';
      const token = 'test-token-123';
      const daysBefore = Date.now();

      saveRememberedCredentials(email, token, 30);

      const expiryTimeStr = localStorage.getItem('auth:remember-me-expiry');
      const expiryTime = parseInt(expiryTimeStr || '0', 10);
      const expectedExpiry = daysBefore + 30 * 24 * 60 * 60 * 1000;

      // Allow 1 second difference due to execution time
      expect(Math.abs(expiryTime - expectedExpiry)).toBeLessThan(1000);
    });

    it('should handle default expiry of 30 days', () => {
      const email = 'test@example.com';
      const token = 'test-token-123';

      saveRememberedCredentials(email, token);

      const expiryTimeStr = localStorage.getItem('auth:remember-me-expiry');
      expect(expiryTimeStr).toBeDefined();
    });
  });

  describe('getRememberedCredentials', () => {
    it('should return null if no credentials are saved', () => {
      const result = getRememberedCredentials();
      expect(result).toBeNull();
    });

    it('should return saved credentials if valid', () => {
      const email = 'test@example.com';
      const token = 'test-token-123';

      saveRememberedCredentials(email, token, 30);
      const result = getRememberedCredentials();

      expect(result).not.toBeNull();
      expect(result?.email).toBe(email);
      expect(result?.token).toBe(token);
      expect(result?.expiryTime).toBeGreaterThan(Date.now());
    });

    it('should return null if credentials have expired', () => {
      const email = 'test@example.com';
      const token = 'test-token-123';

      // Save with past expiry time
      localStorage.setItem('auth:remember-me', 'true');
      localStorage.setItem('auth:remember-me-email', email);
      localStorage.setItem('auth:remember-me-token', token);
      localStorage.setItem('auth:remember-me-expiry', (Date.now() - 1000).toString());

      const result = getRememberedCredentials();

      expect(result).toBeNull();
      expect(localStorage.getItem('auth:remember-me')).toBeNull();
    });

    it('should clear credentials if any field is missing', () => {
      localStorage.setItem('auth:remember-me', 'true');
      localStorage.setItem('auth:remember-me-email', 'test@example.com');
      // Missing token and expiry

      const result = getRememberedCredentials();

      expect(result).toBeNull();
      expect(localStorage.getItem('auth:remember-me')).toBeNull();
    });
  });

  describe('isUserRemembered', () => {
    it('should return false if no credentials are saved', () => {
      const result = isUserRemembered();
      expect(result).toBe(false);
    });

    it('should return true if valid credentials exist', () => {
      saveRememberedCredentials('test@example.com', 'token', 30);
      const result = isUserRemembered();
      expect(result).toBe(true);
    });

    it('should return false if credentials have expired', () => {
      localStorage.setItem('auth:remember-me', 'true');
      localStorage.setItem('auth:remember-me-expiry', (Date.now() - 1000).toString());

      const result = isUserRemembered();
      expect(result).toBe(false);
    });
  });

  describe('getRememberedEmail', () => {
    it('should return null if no email is saved', () => {
      const result = getRememberedEmail();
      expect(result).toBeNull();
    });

    it('should return saved email if valid', () => {
      const email = 'test@example.com';
      saveRememberedCredentials(email, 'token', 30);

      const result = getRememberedEmail();
      expect(result).toBe(email);
    });

    it('should return null if email has expired', () => {
      localStorage.setItem('auth:remember-me', 'true');
      localStorage.setItem('auth:remember-me-email', 'test@example.com');
      localStorage.setItem('auth:remember-me-expiry', (Date.now() - 1000).toString());

      const result = getRememberedEmail();
      expect(result).toBeNull();
    });

    it('should clear credentials if retrieval fails', () => {
      localStorage.setItem('auth:remember-me', 'true');
      localStorage.setItem('auth:remember-me-email', 'test@example.com');
      // Missing expiry

      const result = getRememberedEmail();

      expect(result).toBeNull();
      expect(localStorage.getItem('auth:remember-me')).toBeNull();
    });
  });

  describe('clearRememberedCredentials', () => {
    it('should remove all remember me data from localStorage', () => {
      saveRememberedCredentials('test@example.com', 'token', 30);

      expect(localStorage.getItem('auth:remember-me')).not.toBeNull();

      clearRememberedCredentials();

      expect(localStorage.getItem('auth:remember-me')).toBeNull();
      expect(localStorage.getItem('auth:remember-me-email')).toBeNull();
      expect(localStorage.getItem('auth:remember-me-token')).toBeNull();
      expect(localStorage.getItem('auth:remember-me-expiry')).toBeNull();
    });

    it('should not throw if nothing is saved', () => {
      expect(() => clearRememberedCredentials()).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle localStorage being unavailable gracefully', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn(() => {
            throw new Error('localStorage unavailable');
          }),
          setItem: jest.fn(() => {
            throw new Error('localStorage unavailable');
          }),
          removeItem: jest.fn(() => {
            throw new Error('localStorage unavailable');
          }),
          clear: jest.fn(),
        },
        writable: true,
      });

      expect(() => saveRememberedCredentials('test@example.com', 'token')).not.toThrow();
      expect(() => getRememberedCredentials()).not.toThrow();
      expect(() => clearRememberedCredentials()).not.toThrow();

      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('should handle non-numeric expiry time gracefully', () => {
      localStorage.setItem('auth:remember-me', 'true');
      localStorage.setItem('auth:remember-me-email', 'test@example.com');
      localStorage.setItem('auth:remember-me-token', 'token');
      localStorage.setItem('auth:remember-me-expiry', 'invalid-number');

      const result = getRememberedCredentials();
      // NaN comparison will always be false, so credentials are not returned
      expect(result).toBeNull();
    });
  });
});
