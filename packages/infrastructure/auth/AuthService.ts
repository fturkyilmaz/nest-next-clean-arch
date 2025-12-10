import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '@application/interfaces/IUserRepository';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './JwtStrategy';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  async login(email: string, password: string): Promise<LoginResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive()) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.getPassword().getValue());

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.getId(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
    };

    const accessToken = this.jwtService.sign(payload as any, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn as any,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.getId() } as any,
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn as any,
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
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
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });

      // Find user
      const user = await this.userRepository.findById(payload.sub);

      if (!user || !user.isActive()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        sub: user.getId(),
        email: user.getEmail().getValue(),
        role: user.getRole(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
      };

      const accessToken = this.jwtService.sign(newPayload as any, {
        secret: this.jwtSecret,
        expiresIn: this.jwtExpiresIn as any,
      });

      const newRefreshToken = this.jwtService.sign(
        { sub: user.getId() } as any,
        {
          secret: this.refreshSecret,
          expiresIn: this.refreshExpiresIn as any,
        }
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.isActive()) {
      return null;
    }

    return {
      userId: user.getId(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    // Convert "1h", "7d" etc to seconds
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

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
