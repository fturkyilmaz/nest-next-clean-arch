import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtService, JwtPayload, TokenResult } from '@application/interfaces/services/IJwtService';

@Injectable()
export class JwtAuthService implements IJwtService {
    private readonly jwtSecret: string;
    private readonly jwtExpiresIn: string;
    private readonly refreshSecret: string;
    private readonly refreshExpiresIn: string;

    constructor(private readonly jwtService: JwtService) {
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    }

    generateTokens(payload: JwtPayload): TokenResult {
        const accessToken = this.jwtService.sign(payload, {
            secret: this.jwtSecret,
            expiresIn: this.jwtExpiresIn,
        });

        const refreshToken = this.jwtService.sign(
            { sub: payload.sub } as any,
            {
                secret: this.refreshSecret,
                expiresIn: this.refreshExpiresIn,
            },
        );

        return {
            accessToken,
            refreshToken,
            expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
        };
    }

    verifyRefreshToken(token: string): { sub: string } {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.refreshSecret,
            });
            if (typeof payload === 'object' && payload !== null && 'sub' in payload) {
                return { sub: payload.sub };
            }
            throw new UnauthorizedException('Invalid refresh token payload');
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    private parseExpiresIn(expiresIn: string): number {
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1), 10);

        if (isNaN(value)) {
            return 3600; // default if parsing fails
        }

        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 24 * 60 * 60;
            default:
                return 3600; // default 1 hour
        }
    }
}
