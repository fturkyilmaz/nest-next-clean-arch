/**
 * TOTP (Time-based One-Time Password) Utilities
 * For generating and verifying time-based 2FA codes
 */

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { TOTPUri } from './advanced-auth.types';

/**
 * Generate new TOTP secret
 * Returns Base32-encoded secret and QR code URI
 */
export async function generateTOTPSecret(
    userEmail: string,
    appName = 'Diet Plan AI',
): Promise<TOTPUri> {
    // Generate secret using speakeasy
    const secret = speakeasy.generateSecret({
        name: `${appName} (${userEmail})`,
        length: 32,
    });

    if (!secret.otpauth_url) {
        throw new Error('Failed to generate TOTP URI');
    }

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return {
        uri: secret.otpauth_url,
        secret: secret.base32,
        qrCode,
    };
}

/**
 * Verify TOTP code
 * Checks if provided code is valid for the secret
 * Allows for time drift (±1 step)
 */
export function verifyTOTPCode(
    secret: string,
    code: string,
    window = 1, // Allow ±1 time window (30-second steps)
): boolean {
    try {
        const isValid = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: code,
            window,
        });

        return isValid;
    } catch (error) {
        return false;
    }
}

/**
 * Generate backup codes for TOTP
 * User can use these if they lose access to authenticator app
 */
export function generateBackupCodes(count = 10): string[] {
    const codes: string[] = [];
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < count; i++) {
        let code = '';
        for (let j = 0; j < 8; j++) {
            code += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        // Format as XXXX-XXXX for readability
        codes.push(`${code.substring(0, 4)}-${code.substring(4)}`);
    }

    return codes;
}

/**
 * Verify backup code
 * One-time use codes
 */
export function verifyBackupCode(code: string, backupCodes: string[]): boolean {
    return backupCodes.some(
        backup => backup.replace('-', '') === code.replace('-', ''),
    );
}

/**
 * Hash backup codes before storing
 * Don't store plaintext backup codes
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
    // In production, use bcrypt or similar
    // This is a simplified example
    const crypto = await import('crypto');
    return codes.map(code =>
        crypto
            .createHash('sha256')
            .update(code)
            .digest('hex'),
    );
}

/**
 * Format TOTP secret for display
 * Group in pairs for readability
 */
export function formatTOTPSecret(secret: string): string {
    return secret.match(/.{1,2}/g)?.join(' ') || secret;
}

/**
 * Get current TOTP code for secret
 * Useful for testing and debugging
 */
export function getCurrentTOTPCode(secret: string): string {
    const token = speakeasy.totp({
        secret,
        encoding: 'base32',
    });
    return String(token);
}
