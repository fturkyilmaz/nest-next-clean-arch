import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { JwtPayload, TokenResult, IJwtService } from '@application/interfaces/services/IJwtService';
import { IUserRepository } from '@application/interfaces/IUserRepository';

export interface LoginResult extends TokenResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface RefreshTokenResult extends TokenResult { }

export interface ValidatedUser {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IJwtService') private readonly jwtAuthService: IJwtService,
    private readonly configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET', 'fallback-secret');
    this.jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'fallback-refresh');
    this.refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  async login(email: string, password: string): Promise<LoginResult> {
    // IUserRepository interface'inde findByEmail tanımlı
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.isActive()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.getPassword().getValue());
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.getId(), username: user.getEmail().getValue() };
    const { accessToken, refreshToken, expiresIn } = this.jwtAuthService.generateTokens(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.getId(),
        email: user.getEmail().getValue(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        role: user.getRole(),
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      const { sub } = this.jwtAuthService.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(sub);

      if (!user || !user.isActive()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = { sub: user.getId(), username: user.getEmail().getValue() };
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = this.jwtAuthService.generateTokens(newPayload);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<ValidatedUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive()) return null;

    return {
      userId: user.getId(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600; // default 1 hour
    }
  }
}
