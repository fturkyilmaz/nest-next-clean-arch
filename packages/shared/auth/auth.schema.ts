import { z } from 'zod';
import { TwoFactorMethod, DeviceType } from './advanced-auth.types';

/**
 * Advanced Authentication Zod Schemas
 */

// Login request
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password required'),
    deviceName: z.string().optional(),
    deviceType: z.nativeEnum(DeviceType).default(DeviceType.WEB),
    rememberDevice: z.boolean().default(false),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

// Refresh token request
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token required'),
});

export type RefreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;

// 2FA code verification
export const twoFactorVerificationSchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits'),
    method: z.nativeEnum(TwoFactorMethod).default(TwoFactorMethod.TOTP),
    twoFactorToken: z.string().optional(),
});

export type TwoFactorVerificationSchemaType = z.infer<typeof twoFactorVerificationSchema>;

// 2FA backup code
export const backupCodeSchema = z.object({
    code: z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid backup code format'),
});

export type BackupCodeSchemaType = z.infer<typeof backupCodeSchema>;

// Initiate 2FA setup
export const initiate2FASchema = z.object({
    method: z.nativeEnum(TwoFactorMethod).default(TwoFactorMethod.TOTP),
});

export type Initiate2FASchemaType = z.infer<typeof initiate2FASchema>;

// Enable 2FA
export const enable2FASchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits'),
});

export type Enable2FASchemaType = z.infer<typeof enable2FASchema>;

// Disable 2FA
export const disable2FASchema = z.object({
    password: z.string().min(1, 'Password required'),
    code: z.string().length(6, 'Code must be 6 digits').optional(),
});

export type Disable2FASchemaType = z.infer<typeof disable2FASchema>;

// Session management
export const revokeSessionSchema = z.object({
    sessionId: z.string().cuid('Invalid session ID'),
});

export type RevokeSessionSchemaType = z.infer<typeof revokeSessionSchema>;

// Get sessions list
export const getSessionsSchema = z.object({
    includeExpired: z.boolean().default(false),
});

export type GetSessionsSchemaType = z.infer<typeof getSessionsSchema>;

// Device info
export const deviceInfoSchema = z.object({
    deviceId: z.string(),
    deviceName: z.string(),
    deviceType: z.nativeEnum(DeviceType),
    ipAddress: z.string().ip(),
    userAgent: z.string(),
});

export type DeviceInfoSchemaType = z.infer<typeof deviceInfoSchema>;
