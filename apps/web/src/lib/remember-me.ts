'use client';

const REMEMBER_ME_KEY = 'auth:remember-me';
const REMEMBER_ME_EMAIL_KEY = 'auth:remember-me-email';
const REMEMBER_ME_TOKEN_KEY = 'auth:remember-me-token';
const REMEMBER_ME_EXPIRY_KEY = 'auth:remember-me-expiry';

export interface RememberedCredentials {
  email: string;
  token: string;
  expiryTime: number;
}

/**
 * Save credentials for "Remember Me" functionality
 * @param email User email
 * @param token Long-lived token from server (should be refresh token)
 * @param expiryDays How many days to remember (default: 30)
 */
export function saveRememberedCredentials(
  email: string,
  token: string,
  expiryDays: number = 30
): void {
  if (typeof window === 'undefined') return;

  try {
    const expiryTime = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
    localStorage.setItem(REMEMBER_ME_EMAIL_KEY, email);
    localStorage.setItem(REMEMBER_ME_TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_ME_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Failed to save remembered credentials:', error);
  }
}

/**
 * Get remembered credentials if they exist and haven't expired
 */
export function getRememberedCredentials(): RememberedCredentials | null {
  if (typeof window === 'undefined') return null;

  try {
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY);
    if (!isRemembered) return null;

    const email = localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
    const token = localStorage.getItem(REMEMBER_ME_TOKEN_KEY);
    const expiryTimeStr = localStorage.getItem(REMEMBER_ME_EXPIRY_KEY);

    if (!email || !token || !expiryTimeStr) {
      clearRememberedCredentials();
      return null;
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    if (Date.now() > expiryTime) {
      clearRememberedCredentials();
      return null;
    }

    return {
      email,
      token,
      expiryTime,
    };
  } catch (error) {
    console.error('Failed to get remembered credentials:', error);
    return null;
  }
}

/**
 * Check if user is remembered (without returning sensitive data)
 */
export function isUserRemembered(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY);
    const expiryTimeStr = localStorage.getItem(REMEMBER_ME_EXPIRY_KEY);

    if (!isRemembered || !expiryTimeStr) return false;

    const expiryTime = parseInt(expiryTimeStr, 10);
    return Date.now() <= expiryTime;
  } catch (error) {
    return false;
  }
}

/**
 * Get remembered email for login form pre-fill
 */
export function getRememberedEmail(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const isRemembered = localStorage.getItem(REMEMBER_ME_KEY);
    if (!isRemembered) return null;

    const expiryTimeStr = localStorage.getItem(REMEMBER_ME_EXPIRY_KEY);
    if (!expiryTimeStr) return null;

    const expiryTime = parseInt(expiryTimeStr, 10);
    if (Date.now() > expiryTime) {
      clearRememberedCredentials();
      return null;
    }

    return localStorage.getItem(REMEMBER_ME_EMAIL_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Clear all remembered credentials
 */
export function clearRememberedCredentials(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(REMEMBER_ME_EMAIL_KEY);
    localStorage.removeItem(REMEMBER_ME_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_EXPIRY_KEY);
  } catch (error) {
    console.error('Failed to clear remembered credentials:', error);
  }
}
