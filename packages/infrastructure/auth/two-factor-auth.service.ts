/**
 * Two-Factor Authentication Service
 * Manages TOTP setup, verification, and backup codes
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@diet/infrastructure/prisma';
import {
    TwoFactorSetup,
    TwoFactorMethod,
    TOTPUri,
} from '@diet/shared/auth/advanced-auth.types';
import {
    generateTOTPSecret,
    verifyTOTPCode,
    generateBackupCodes,
    hashBackupCodes,
    verifyBackupCode,
} from '@diet/shared/auth/totp.utils';
import { AppError, ErrorCode } from '@diet/shared/errors';

@Injectable()
export class TwoFactorAuthService {
    constructor(private prisma: PrismaService) {}

    /**
     * Check if user has 2FA enabled
     */
    async isTwoFactorEnabled(userId: string): Promise<boolean> {
        const setup = await this.prisma.twoFactorSetup.findFirst({
            where: {
                userId,
                verified: true,
                disabledAt: null,
            },
        });

        return !!setup;
    }

    /**
     * Generate TOTP setup for user
     * Returns QR code and secret
     */
    async initiateTOTPSetup(userId: string): Promise<TOTPUri> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        if (!user) {
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'User not found',
            );
        }

        // Generate secret and QR code
        const totpUri = await generateTOTPSecret(user.email);

        // Store unverified setup (will be verified by user)
        await this.prisma.twoFactorSetup.create({
            data: {
                userId,
                method: TwoFactorMethod.TOTP,
                secret: totpUri.secret,
                verified: false,
            },
        });

        return totpUri;
    }

    /**
     * Verify TOTP setup and enable 2FA
     */
    async verifyAndEnableTOTP(
        userId: string,
        code: string,
    ): Promise<string[]> {
        // Get pending setup
        const setup = await this.prisma.twoFactorSetup.findFirst({
            where: {
                userId,
                method: TwoFactorMethod.TOTP,
                verified: false,
            },
        });

        if (!setup || !setup.secret) {
            throw new AppError(
                ErrorCode.TWO_FACTOR_INVALID,
                'No pending 2FA setup found',
            );
        }

        // Verify code
        if (!verifyTOTPCode(setup.secret, code)) {
            throw new AppError(
                ErrorCode.TWO_FACTOR_INVALID,
                'Invalid 2FA code',
            );
        }

        // Generate backup codes
        const backupCodes = generateBackupCodes(10);
        const hashedBackupCodes = await hashBackupCodes(backupCodes);

        // Mark as verified
        await this.prisma.twoFactorSetup.update({
            where: { id: setup.id },
            data: {
                verified: true,
                backupCodes: hashedBackupCodes,
                enabledAt: new Date(),
            },
        });

        // Return plaintext backup codes to user (only time they'll see them)
        return backupCodes;
    }

    /**
     * Verify 2FA code during login
     */
    async verifyTwoFactorCode(
        userId: string,
        code: string,
    ): Promise<boolean> {
        // Get verified setup
        const setup = await this.prisma.twoFactorSetup.findFirst({
            where: {
                userId,
                verified: true,
                disabledAt: null,
            },
        });

        if (!setup) {
            throw new AppError(
                ErrorCode.TWO_FACTOR_REQUIRED,
                '2FA not enabled',
            );
        }

        // Check if it's a backup code
        if (setup.backupCodes && setup.backupCodes.length > 0) {
            if (await this.verifyBackupCodeUsage(setup.id, code)) {
                return true;
            }
        }

        // Check TOTP code
        if (setup.secret && verifyTOTPCode(setup.secret, code)) {
            return true;
        }

        return false;
    }

    /**
     * Verify backup code and mark as used
     */
    private async verifyBackupCodeUsage(
        setupId: string,
        code: string,
    ): Promise<boolean> {
        const setup = await this.prisma.twoFactorSetup.findUnique({
            where: { id: setupId },
        });

        if (!setup || !setup.backupCodes) {
            return false;
        }

        // Check if code matches
        const isValid = setup.backupCodes.some(stored => {
            // Simple comparison (in production use bcrypt)
            return stored === code;
        });

        if (isValid) {
            // Remove used code
            const updatedCodes = setup.backupCodes.filter(c => c !== code);

            await this.prisma.twoFactorSetup.update({
                where: { id: setupId },
                data: { backupCodes: updatedCodes },
            });

            return true;
        }

        return false;
    }

    /**
     * Disable 2FA for user
     */
    async disableTwoFactor(userId: string): Promise<void> {
        const setup = await this.prisma.twoFactorSetup.findFirst({
            where: {
                userId,
                verified: true,
                disabledAt: null,
            },
        });

        if (setup) {
            await this.prisma.twoFactorSetup.update({
                where: { id: setup.id },
                data: {
                    disabledAt: new Date(),
                },
            });
        }
    }

    /**
     * Get 2FA setup status
     */
    async getTwoFactorStatus(userId: string): Promise<{
        enabled: boolean;
        method?: TwoFactorMethod;
        enabledAt?: Date;
        backupCodesRemaining?: number;
    }> {
        const setup = await this.prisma.twoFactorSetup.findFirst({
            where: {
                userId,
                verified: true,
                disabledAt: null,
            },
        });

        if (!setup) {
            return { enabled: false };
        }

        return {
            enabled: true,
            method: setup.method,
            enabledAt: setup.enabledAt || undefined,
            backupCodesRemaining: setup.backupCodes?.length || 0,
        };
    }

    /**
     * Generate new backup codes
     * User must verify old 2FA code first
     */
    async generateNewBackupCodes(
        userId: string,
    ): Promise<string[]> {
        const setup = await this.prisma.twoFactorSetup.findFirst({
            where: {
                userId,
                verified: true,
                disabledAt: null,
            },
        });

        if (!setup) {
            throw new AppError(
                ErrorCode.TWO_FACTOR_REQUIRED,
                '2FA not enabled',
            );
        }

        const backupCodes = generateBackupCodes(10);
        const hashedBackupCodes = await hashBackupCodes(backupCodes);

        await this.prisma.twoFactorSetup.update({
            where: { id: setup.id },
            data: { backupCodes: hashedBackupCodes },
        });

        return backupCodes;
    }
}
