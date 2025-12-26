/**
 * Advanced Authentication Types & Interfaces
 * Session management, token rotation, and 2FA support
 */

export enum TwoFactorMethod {
    TOTP = 'TOTP',          // Time-based One-Time Password
    SMS = 'SMS',            // SMS-based 2FA
    EMAIL = 'EMAIL',        // Email-based 2FA
}

export enum SessionStatus {
    ACTIVE = 'ACTIVE',
    REVOKED = 'REVOKED',
    EXPIRED = 'EXPIRED',
}

export enum DeviceType {
    WEB = 'WEB',
    MOBILE_IOS = 'MOBILE_IOS',
    MOBILE_ANDROID = 'MOBILE_ANDROID',
    DESKTOP = 'DESKTOP',
}

/**
 * User session representation
 * Each session maps to an authenticated device/app instance
 */
export interface UserSession {
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string;
    deviceType: DeviceType;
    ipAddress: string;
    userAgent: string;
    accessTokenHash: string;    // Hash of access token (not plaintext)
    refreshTokenHash: string;   // Hash of refresh token
    status: SessionStatus;
    lastActivityAt: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Token pair for authentication
 */
export interface TokenPair {
    accessToken: string;        // Short-lived JWT (15min default)
    refreshToken: string;       // Long-lived token for rotation
    expiresIn: number;          // Access token TTL in seconds
}

/**
 * Token payload (JWT claims)
 */
export interface TokenPayload {
    sub: string;                // User ID
    email: string;
    sessionId: string;          // Session ID for validation
    deviceId: string;           // Device ID
    iat: number;                // Issued at
    exp: number;                // Expiration
}

/**
 * Refresh token data stored in database
 */
export interface StoredRefreshToken {
    id: string;
    userId: string;
    sessionId: string;
    tokenHash: string;          // Hash of refresh token
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Two-Factor Authentication setup
 */
export interface TwoFactorSetup {
    id: string;
    userId: string;
    method: TwoFactorMethod;
    secret?: string;            // Base32-encoded secret for TOTP
    backupCodes?: string[];     // Recovery codes
    verified: boolean;
    enabledAt?: Date;
    disabledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 2FA Verification Request
 */
export interface TwoFactorVerification {
    code: string;               // 6-digit code
    method: TwoFactorMethod;
    backupCode?: boolean;       // Using backup code instead of code
}

/**
 * Device/Session information
 */
export interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    deviceType: DeviceType;
    ipAddress: string;
    userAgent: string;
}

/**
 * Login response with tokens
 */
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    requiresTwoFactor: boolean;
    twoFactorToken?: string;    // For 2FA verification
}

/**
 * Token rotation result
 */
export interface TokenRotationResult {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Session info for user
 */
export interface SessionInfo {
    id: string;
    deviceName: string;
    deviceType: DeviceType;
    ipAddress: string;
    lastActivityAt: Date;
    expiresAt: Date;
    isCurrent: boolean;
    createdAt: Date;
}

/**
 * TOTP URI for QR code generation
 */
export interface TOTPUri {
    uri: string;                // otpauth://totp/...
    secret: string;             // Base32 secret
    qrCode: string;             // Data URL for QR code image
}

/**
 * Security event for logging
 */
export interface SecurityEvent {
    userId: string;
    eventType: 'LOGIN' | 'LOGOUT' | 'TOKEN_ROTATION' | 'SESSION_REVOKED' | '2FA_ENABLED' | '2FA_DISABLED' | '2FA_VERIFIED' | 'DEVICE_ADDED' | 'DEVICE_REMOVED';
    sessionId?: string;
    deviceId?: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    details?: Record<string, any>;
    createdAt: Date;
}
