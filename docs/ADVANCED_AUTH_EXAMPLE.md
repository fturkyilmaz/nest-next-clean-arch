/**
 * Example: Advanced Authentication Controller
 * Shows implementation of login, token refresh, session management, and 2FA
 */

import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    UseGuards,
    Req,
    Res,
    HttpCode,
    BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { TokenRotationService } from '@diet/infrastructure/auth/token-rotation.service';
import { SessionManagementService } from '@diet/infrastructure/auth/session-management.service';
import { TwoFactorAuthService } from '@diet/infrastructure/auth/two-factor-auth.service';
import { EnhancedJwtAuthGuard } from '@diet/infrastructure/guards';
import {
    LoginSchemaType,
    loginSchema,
    RefreshTokenSchemaType,
    refreshTokenSchema,
    TwoFactorVerificationSchemaType,
    twoFactorVerificationSchema,
    Enable2FASchemaType,
    enable2FASchema,
} from '@diet/shared/auth/auth.schema';
import {
    LoginResponse,
    DeviceInfo,
    DeviceType,
} from '@diet/shared/auth/advanced-auth.types';
import { ValidationError } from '@diet/shared/errors';
import { extractValidationDetails } from '@diet/shared/errors';

@Controller('api/auth')
export class AuthController {
    constructor(
        private tokenRotationService: TokenRotationService,
        private sessionService: SessionManagementService,
        private twoFactorService: TwoFactorAuthService,
        private userService: any, // UserService
    ) {}

    /**
     * Login with email/password
     * Creates session and returns access + refresh tokens
     */
    @Post('login')
    @HttpCode(200)
    async login(
        @Body() body: unknown,
        @Req() req: Request,
    ): Promise<LoginResponse> {
        // Validate input
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            throw new ValidationError(
                extractValidationDetails(result.error),
            );
        }

        const input: LoginSchemaType = result.data;

        // Verify credentials
        const user = await this.userService.findByEmail(input.email);
        if (!user || !(await user.verifyPassword(input.password))) {
            throw new BadRequestException('Invalid credentials');
        }

        // Check if 2FA is enabled
        const hasTwoFactor = await this.twoFactorService.isTwoFactorEnabled(
            user.id,
        );

        // Create device info
        const deviceInfo: DeviceInfo = {
            deviceId: this.sessionService.generateDeviceId(),
            deviceName:
                input.deviceName ||
                this.sessionService.parseUserAgent(req.headers['user-agent'] || '').deviceName,
            deviceType: input.deviceType,
            ipAddress: this.extractIpAddress(req),
            userAgent: req.headers['user-agent'] || '',
        };

        // If 2FA is required, generate temp token
        if (hasTwoFactor) {
            const tempToken = this.generateTempToken(user.id);
            return {
                accessToken: '',
                refreshToken: '',
                expiresIn: 0,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                requiresTwoFactor: true,
                twoFactorToken: tempToken,
            };
        }

        // Generate tokens
        const tempSessionId = 'temp'; // Will be replaced after session creation
        const tokens = await this.tokenRotationService.generateTokenPair(
            user.id,
            tempSessionId,
            deviceInfo.deviceId,
        );

        // Create session
        const session = await this.sessionService.createSession(
            user.id,
            deviceInfo,
            tokens.accessToken,
            tokens.refreshToken,
        );

        // Re-generate tokens with real session ID
        const finalTokens = await this.tokenRotationService.generateTokenPair(
            user.id,
            session.id,
            deviceInfo.deviceId,
        );

        // Store refresh token hash
        await this.tokenRotationService.storeRefreshTokenHash(
            user.id,
            session.id,
            finalTokens.refreshToken,
        );

        return {
            accessToken: finalTokens.accessToken,
            refreshToken: finalTokens.refreshToken,
            expiresIn: finalTokens.expiresIn,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            requiresTwoFactor: false,
        };
    }

    /**
     * Verify 2FA code and complete login
     */
    @Post('2fa/verify')
    @HttpCode(200)
    async verifyTwoFactor(
        @Body() body: unknown,
        @Req() req: Request,
    ): Promise<LoginResponse> {
        // Validate input
        const result = twoFactorVerificationSchema.safeParse(body);
        if (!result.success) {
            throw new ValidationError(
                extractValidationDetails(result.error),
            );
        }

        const input: TwoFactorVerificationSchemaType = result.data;

        // Verify 2FA token (extract userId)
        const userId = this.verifyTempToken(input.twoFactorToken);
        if (!userId) {
            throw new BadRequestException('Invalid or expired 2FA token');
        }

        // Verify 2FA code
        const isValid = await this.twoFactorService.verifyTwoFactorCode(
            userId,
            input.code,
        );
        if (!isValid) {
            throw new BadRequestException('Invalid 2FA code');
        }

        // Get user
        const user = await this.userService.findById(userId);

        // Create session and tokens
        const deviceInfo: DeviceInfo = {
            deviceId: this.sessionService.generateDeviceId(),
            deviceName: this.sessionService.parseUserAgent(
                req.headers['user-agent'] || '',
            ).deviceName,
            deviceType: DeviceType.WEB,
            ipAddress: this.extractIpAddress(req),
            userAgent: req.headers['user-agent'] || '',
        };

        const tokens = await this.tokenRotationService.generateTokenPair(
            user.id,
            'temp',
            deviceInfo.deviceId,
        );

        const session = await this.sessionService.createSession(
            user.id,
            deviceInfo,
            tokens.accessToken,
            tokens.refreshToken,
        );

        const finalTokens = await this.tokenRotationService.generateTokenPair(
            user.id,
            session.id,
            deviceInfo.deviceId,
        );

        await this.tokenRotationService.storeRefreshTokenHash(
            user.id,
            session.id,
            finalTokens.refreshToken,
        );

        return {
            accessToken: finalTokens.accessToken,
            refreshToken: finalTokens.refreshToken,
            expiresIn: finalTokens.expiresIn,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            requiresTwoFactor: false,
        };
    }

    /**
     * Refresh access token using refresh token
     */
    @Post('refresh')
    @HttpCode(200)
    async refreshToken(
        @Body() body: unknown,
    ): Promise<{ accessToken: string; expiresIn: number }> {
        const result = refreshTokenSchema.safeParse(body);
        if (!result.success) {
            throw new ValidationError(
                extractValidationDetails(result.error),
            );
        }

        const input: RefreshTokenSchemaType = result.data;

        // Rotate tokens
        const rotationResult =
            await this.tokenRotationService.rotateTokens(
                input.refreshToken,
                '', // Will be extracted from token payload
                '',
            );

        return {
            accessToken: rotationResult.accessToken,
            expiresIn: rotationResult.expiresIn,
        };
    }

    /**
     * Get all active sessions for user
     */
    @Get('sessions')
    @UseGuards(EnhancedJwtAuthGuard)
    async getSessions(@Req() req: Request) {
        const userId = req.user!.sub;
        const sessions = await this.sessionService.getUserSessions(userId);

        // Mark current session
        return sessions.map(session => ({
            ...session,
            isCurrent: session.id === req.user!.sessionId,
        }));
    }

    /**
     * Revoke specific session
     */
    @Delete('sessions/:sessionId')
    @UseGuards(EnhancedJwtAuthGuard)
    @HttpCode(204)
    async revokeSession(
        @Req() req: Request,
    ): Promise<void> {
        const userId = req.user!.sub;
        const sessionId = req.params.sessionId;

        // Verify ownership
        const session = await this.sessionService.getSession(sessionId);
        if (!session || session.userId !== userId) {
            throw new BadRequestException('Session not found');
        }

        await this.sessionService.revokeSession(sessionId);
    }

    /**
     * Logout (revoke current session and all devices)
     */
    @Post('logout')
    @UseGuards(EnhancedJwtAuthGuard)
    @HttpCode(204)
    async logout(@Req() req: Request): Promise<void> {
        const userId = req.user!.sub;
        const sessionId = req.user!.sessionId;

        // Revoke current session
        await this.sessionService.revokeSession(sessionId);
    }

    /**
     * Logout from all devices
     */
    @Post('logout-all')
    @UseGuards(EnhancedJwtAuthGuard)
    @HttpCode(204)
    async logoutAll(@Req() req: Request): Promise<void> {
        const userId = req.user!.sub;
        await this.sessionService.revokeAllSessions(userId);
    }

    /**
     * Initiate 2FA setup
     */
    @Post('2fa/setup')
    @UseGuards(EnhancedJwtAuthGuard)
    async initiateSetup(@Req() req: Request) {
        const userId = req.user!.sub;
        const totpUri = await this.twoFactorService.initiateTOTPSetup(userId);

        return {
            secret: totpUri.secret,
            qrCode: totpUri.qrCode,
            uri: totpUri.uri,
        };
    }

    /**
     * Enable 2FA
     */
    @Post('2fa/enable')
    @UseGuards(EnhancedJwtAuthGuard)
    async enableTwoFactor(
        @Body() body: unknown,
        @Req() req: Request,
    ) {
        const result = enable2FASchema.safeParse(body);
        if (!result.success) {
            throw new ValidationError(
                extractValidationDetails(result.error),
            );
        }

        const input: Enable2FASchemaType = result.data;
        const userId = req.user!.sub;

        const backupCodes = await this.twoFactorService.verifyAndEnableTOTP(
            userId,
            input.code,
        );

        return { backupCodes };
    }

    /**
     * Get 2FA status
     */
    @Get('2fa/status')
    @UseGuards(EnhancedJwtAuthGuard)
    async getTwoFactorStatus(@Req() req: Request) {
        const userId = req.user!.sub;
        return this.twoFactorService.getTwoFactorStatus(userId);
    }

    /**
     * Generate new backup codes
     */
    @Post('2fa/backup-codes')
    @UseGuards(EnhancedJwtAuthGuard)
    async generateBackupCodes(@Req() req: Request) {
        const userId = req.user!.sub;
        const codes = await this.twoFactorService.generateNewBackupCodes(userId);

        return { backupCodes: codes };
    }

    /**
     * Disable 2FA
     */
    @Post('2fa/disable')
    @UseGuards(EnhancedJwtAuthGuard)
    @HttpCode(204)
    async disableTwoFactor(@Req() req: Request): Promise<void> {
        const userId = req.user!.sub;
        await this.twoFactorService.disableTwoFactor(userId);
    }

    // Helper methods
    private extractIpAddress(req: Request): string {
        return (
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            (req.headers['x-real-ip'] as string) ||
            req.socket.remoteAddress ||
            '0.0.0.0'
        );
    }

    private generateTempToken(userId: string): string {
        // Generate short-lived token for 2FA verification
        // Implementation depends on your JWT strategy
        return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
    }

    private verifyTempToken(token?: string): string | null {
        if (!token) return null;
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            const [userId] = decoded.split(':');
            return userId;
        } catch {
            return null;
        }
    }
}
