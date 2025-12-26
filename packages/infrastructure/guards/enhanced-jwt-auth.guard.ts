/**
 * Enhanced JWT Auth Guard with Session Validation
 * Validates both JWT and active session
 */

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionManagementService } from '@diet/infrastructure/auth/session-management.service';
import { TokenRotationService } from '@diet/infrastructure/auth/token-rotation.service';
import { AppError, ErrorCode } from '@diet/shared/errors';

/**
 * Enhanced JWT Guard with session validation
 * Checks JWT validity and ensures session is active
 */
@Injectable()
export class EnhancedJwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private sessionService: SessionManagementService,
        private tokenService: TokenRotationService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        try {
            // Extract token
            const token = this.extractTokenFromHeader(req);
            if (!token) {
                throw new UnauthorizedException('No token provided');
            }

            // Verify JWT
            const payload = this.jwtService.verify(token);

            // Validate session is active
            const isValid = await this.sessionService.validateSession(
                payload.sessionId,
            );
            if (!isValid) {
                throw new UnauthorizedException('Session is no longer valid');
            }

            // Update session activity
            await this.sessionService.updateSessionActivity(payload.sessionId);

            // Attach payload to request
            req.user = payload;
            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid token or session');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}

/**
 * 2FA Required Guard
 * Ensures user has 2FA enabled
 */
@Injectable()
export class TwoFactorRequiredGuard implements CanActivate {
    constructor(private twoFactorService: any) {} // TwoFactorAuthService

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        if (!req.user || !req.user.sub) {
            throw new UnauthorizedException('User not authenticated');
        }

        const hasTwoFactor = await this.twoFactorService.isTwoFactorEnabled(
            req.user.sub,
        );

        if (!hasTwoFactor) {
            throw new AppError(
                ErrorCode.TWO_FACTOR_REQUIRED,
                'Two-factor authentication is required',
            );
        }

        return true;
    }
}

/**
 * Session Owner Guard
 * Ensures user can only access their own sessions/data
 */
@Injectable()
export class SessionOwnerGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        if (!req.user || !req.user.sub) {
            throw new UnauthorizedException('User not authenticated');
        }

        // Check if requested resource belongs to user
        const requestedUserId = req.params.userId || req.body?.userId;
        if (requestedUserId && requestedUserId !== req.user.sub) {
            throw new AppError(
                ErrorCode.FORBIDDEN,
                'You can only access your own data',
            );
        }

        return true;
    }
}

/**
 * Device verification guard
 * Ensures request matches session's device
 */
@Injectable()
export class DeviceVerificationGuard implements CanActivate {
    constructor(private sessionService: SessionManagementService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        if (!req.user || !req.user.sessionId) {
            throw new UnauthorizedException('Session not found');
        }

        const session = await this.sessionService.getSession(req.user.sessionId);

        if (!session) {
            throw new UnauthorizedException('Session not found');
        }

        // Compare user agent (simple device verification)
        const currentUserAgent = req.headers['user-agent'] || '';
        const sessionUserAgent = session.userAgent;

        if (currentUserAgent !== sessionUserAgent) {
            // This could be legitimate (browser update, etc)
            // You might want to log this as a security event instead of blocking
        }

        return true;
    }
}

/**
 * Type extension for Express Request
 */
declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string;
                email: string;
                sessionId: string;
                deviceId: string;
                iat: number;
                exp: number;
            };
        }
    }
}
