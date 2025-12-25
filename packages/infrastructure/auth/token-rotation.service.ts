/**
 * Token Rotation Service
 * Manages token lifecycle, rotation, and revocation
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@diet/infrastructure/prisma';
import {
    TokenPair,
    TokenPayload,
    UserSession,
    TokenRotationResult,
} from '@diet/shared/auth/advanced-auth.types';
import { AppError, ErrorCode } from '@diet/shared/errors';
import crypto from 'crypto';

/**
 * Token configuration
 */
export interface TokenConfig {
    accessTokenTtl: number;     // Seconds (e.g., 900 = 15 minutes)
    refreshTokenTtl: number;    // Seconds (e.g., 2592000 = 30 days)
    tokenIssuer: string;
    tokenAudience: string;
}

@Injectable()
export class TokenRotationService {
    private readonly config: TokenConfig = {
        accessTokenTtl: 900,        // 15 minutes
        refreshTokenTtl: 2592000,   // 30 days
        tokenIssuer: 'diet-plan-ai',
        tokenAudience: 'diet-plan-ai-users',
    };

    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) {}

    /**
     * Generate new token pair
     */
    async generateTokenPair(
        userId: string,
        sessionId: string,
        deviceId: string,
    ): Promise<TokenPair> {
        const now = Math.floor(Date.now() / 1000);
        const accessTokenExp = now + this.config.accessTokenTtl;
        const refreshTokenExp = now + this.config.refreshTokenTtl;

        const payload: TokenPayload = {
            sub: userId,
            email: '', // Will be filled from user data
            sessionId,
            deviceId,
            iat: now,
            exp: accessTokenExp,
        };

        // Get user email
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

        payload.email = user.email;

        // Sign tokens
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.config.accessTokenTtl,
        });

        const refreshTokenPayload = {
            sub: userId,
            sessionId,
            deviceId,
            type: 'refresh',
            iat: now,
            exp: refreshTokenExp,
        };

        const refreshToken = this.jwtService.sign(refreshTokenPayload, {
            expiresIn: this.config.refreshTokenTtl,
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: this.config.accessTokenTtl,
        };
    }

    /**
     * Rotate tokens (issue new pair when refresh token is used)
     * Old refresh token is invalidated
     */
    async rotateTokens(
        oldRefreshToken: string,
        sessionId: string,
        deviceId: string,
    ): Promise<TokenRotationResult> {
        try {
            // Verify old refresh token
            const payload = this.jwtService.verify(oldRefreshToken);

            // Check if refresh token is revoked
            const refreshTokenExists = await this.prisma.refreshToken.findUnique({
                where: { id: payload.jti || sessionId },
            });

            if (!refreshTokenExists || refreshTokenExists.status === 'REVOKED') {
                throw new AppError(
                    ErrorCode.TOKEN_INVALID,
                    'Refresh token has been revoked',
                );
            }

            // Mark old token as used
            await this.prisma.refreshToken.update({
                where: { id: refreshTokenExists.id },
                data: { status: 'USED' },
            });

            // Generate new token pair
            const newTokens = await this.generateTokenPair(
                payload.sub,
                sessionId,
                deviceId,
            );

            // Store new refresh token hash
            await this.storeRefreshTokenHash(
                payload.sub,
                sessionId,
                newTokens.refreshToken,
            );

            return newTokens;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                ErrorCode.TOKEN_INVALID,
                'Failed to rotate tokens',
            );
        }
    }

    /**
     * Store refresh token hash in database
     * Never store plaintext tokens
     */
    async storeRefreshTokenHash(
        userId: string,
        sessionId: string,
        refreshToken: string,
    ): Promise<void> {
        const tokenHash = this.hashToken(refreshToken);

        await this.prisma.refreshToken.create({
            data: {
                userId,
                sessionId,
                tokenHash,
                status: 'ACTIVE',
                expiresAt: new Date(Date.now() + this.config.refreshTokenTtl * 1000),
            },
        });
    }

    /**
     * Verify token signature and expiration
     */
    verifyToken(token: string): TokenPayload {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AppError(
                    ErrorCode.TOKEN_EXPIRED,
                    'Token has expired',
                );
            }
            throw new AppError(
                ErrorCode.TOKEN_INVALID,
                'Invalid token',
            );
        }
    }

    /**
     * Revoke all tokens for a user
     * Used when user logs out or password is changed
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        // Revoke all refresh tokens
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { status: 'REVOKED' },
        });

        // Revoke all sessions
        await this.prisma.userSession.updateMany({
            where: { userId },
            data: { status: 'REVOKED' },
        });
    }

    /**
     * Revoke specific session tokens
     */
    async revokeSessionTokens(sessionId: string): Promise<void> {
        // Revoke all refresh tokens for session
        await this.prisma.refreshToken.updateMany({
            where: { sessionId },
            data: { status: 'REVOKED' },
        });

        // Revoke session
        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: { status: 'REVOKED' },
        });
    }

    /**
     * Clean up expired tokens periodically
     * Run as background job
     */
    async cleanupExpiredTokens(): Promise<number> {
        const result = await this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        return result.count;
    }

    /**
     * Hash token for storage
     * Uses SHA-256 for quick comparison
     */
    private hashToken(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    /**
     * Verify token hash
     */
    verifyTokenHash(token: string, hash: string): boolean {
        const tokenHash = this.hashToken(token);
        return crypto.timingSafeEqual(
            Buffer.from(tokenHash),
            Buffer.from(hash),
        );
    }
}
