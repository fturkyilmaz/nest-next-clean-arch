/**
 * Session Management Service
 * Manages user sessions, devices, and session tracking
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@diet/infrastructure/prisma';
import {
    UserSession,
    SessionInfo,
    DeviceInfo,
    SessionStatus,
} from '@diet/shared/auth/advanced-auth.types';
import { AppError, ErrorCode } from '@diet/shared/errors';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class SessionManagementService {
    private readonly maxSessionsPerUser = 5; // Limit active sessions
    private readonly sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days

    constructor(private prisma: PrismaService) {}

    /**
     * Create new user session
     */
    async createSession(
        userId: string,
        deviceInfo: DeviceInfo,
        accessToken: string,
        refreshToken: string,
    ): Promise<UserSession> {
        // Check max sessions limit
        const activeSessions = await this.prisma.userSession.count({
            where: {
                userId,
                status: SessionStatus.ACTIVE,
            },
        });

        if (activeSessions >= this.maxSessionsPerUser) {
            // Revoke oldest session
            const oldestSession = await this.prisma.userSession.findFirst({
                where: {
                    userId,
                    status: SessionStatus.ACTIVE,
                },
                orderBy: { lastActivityAt: 'asc' },
            });

            if (oldestSession) {
                await this.revokeSession(oldestSession.id);
            }
        }

        // Create new session
        const session = await this.prisma.userSession.create({
            data: {
                userId,
                deviceId: deviceInfo.deviceId,
                deviceName: deviceInfo.deviceName,
                deviceType: deviceInfo.deviceType,
                ipAddress: deviceInfo.ipAddress,
                userAgent: deviceInfo.userAgent,
                accessTokenHash: this.hashToken(accessToken),
                refreshTokenHash: this.hashToken(refreshToken),
                status: SessionStatus.ACTIVE,
                expiresAt: new Date(Date.now() + this.sessionTtl),
                lastActivityAt: new Date(),
            },
        });

        return session;
    }

    /**
     * Update session activity timestamp
     */
    async updateSessionActivity(sessionId: string): Promise<void> {
        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: { lastActivityAt: new Date() },
        });
    }

    /**
     * Get user's active sessions
     */
    async getUserSessions(userId: string): Promise<SessionInfo[]> {
        const sessions = await this.prisma.userSession.findMany({
            where: {
                userId,
                status: SessionStatus.ACTIVE,
            },
            orderBy: { lastActivityAt: 'desc' },
        });

        return sessions.map(session => ({
            id: session.id,
            deviceName: session.deviceName,
            deviceType: session.deviceType,
            ipAddress: session.ipAddress,
            lastActivityAt: session.lastActivityAt,
            expiresAt: session.expiresAt,
            isCurrent: false, // Will be set in controller
            createdAt: session.createdAt,
        }));
    }

    /**
     * Revoke specific session
     */
    async revokeSession(sessionId: string): Promise<void> {
        await this.prisma.userSession.update({
            where: { id: sessionId },
            data: { status: SessionStatus.REVOKED },
        });

        // Revoke associated tokens
        await this.prisma.refreshToken.updateMany({
            where: { sessionId },
            data: { status: 'REVOKED' },
        });
    }

    /**
     * Revoke all user sessions (logout all devices)
     */
    async revokeAllSessions(userId: string): Promise<void> {
        await this.prisma.userSession.updateMany({
            where: { userId },
            data: { status: SessionStatus.REVOKED },
        });

        // Revoke all refresh tokens
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { status: 'REVOKED' },
        });
    }

    /**
     * Check if session is valid
     */
    async validateSession(sessionId: string): Promise<boolean> {
        const session = await this.prisma.userSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return false;
        }

        if (session.status !== SessionStatus.ACTIVE) {
            return false;
        }

        if (session.expiresAt < new Date()) {
            await this.revokeSession(sessionId);
            return false;
        }

        return true;
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId: string): Promise<UserSession | null> {
        return this.prisma.userSession.findUnique({
            where: { id: sessionId },
        });
    }

    /**
     * Get session by access token hash
     */
    async getSessionByAccessTokenHash(tokenHash: string): Promise<UserSession | null> {
        return this.prisma.userSession.findFirst({
            where: { accessTokenHash: tokenHash },
        });
    }

    /**
     * Clean up expired sessions
     * Run as background job
     */
    async cleanupExpiredSessions(): Promise<number> {
        const result = await this.prisma.userSession.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        return result.count;
    }

    /**
     * Generate unique device ID
     * Based on device fingerprint
     */
    generateDeviceId(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Parse user agent to extract device info
     */
    parseUserAgent(userAgent: string): { deviceName: string; browser: string; os: string } {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        const browser = result.browser.name || 'Unknown';
        const os = result.os.name || 'Unknown';
        const deviceName = `${browser} on ${os}`;

        return { deviceName, browser, os };
    }

    /**
     * Hash token for storage
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
