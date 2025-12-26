import {
  Injectable,
  UnauthorizedException,
  Inject,
  ConflictException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

import {
  JwtPayload,
  TokenResult,
  IJwtService,
} from "@application/interfaces/services/IJwtService";
import { IUserRepository } from "@application/interfaces/repositories/common/IUserRepository";
import { RegisterDto, RegisterResponseDto } from "@application/dto/AuthDto";
import { Email, Password } from "@domain/value-objects";
import { User, UserRole } from "@domain/entities/User.entity";
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
    @Inject("IUserRepository") private readonly userRepository: IUserRepository,
    @Inject("IJwtService") private readonly jwtAuthService: IJwtService,
    private readonly configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>(
      "JWT_SECRET",
      "fallback-secret"
    );
    this.jwtExpiresIn = this.configService.get<string>("JWT_EXPIRES_IN", "1h");
    this.refreshSecret = this.configService.get<string>(
      "JWT_REFRESH_SECRET",
      "fallback-refresh"
    );
    this.refreshExpiresIn = this.configService.get<string>(
      "JWT_REFRESH_EXPIRES_IN",
      "7d"
    );
  }

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const userEntity = User.create({
      id: crypto.randomUUID(),
      email: Email.create(dto.email).getValue(),
      password: Password.fromHash(hashedPassword),
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role as UserRole,
      isActive: true,
    });

    const user = await this.userRepository.create(userEntity);

    const payload: JwtPayload = {
      sub: user.getId(),
      email: user.getEmail().getValue(),
      username: user.getEmail().getValue(),
      role: user.getRole(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
    };

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

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);

    if (!user?.isActive()) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.getPassword().getValue()
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload: JwtPayload = {
      sub: user.getId(),
      email: user.getEmail().getValue(),
      username: user.getEmail().getValue(),
      role: user.getRole(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
    };

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

      if (!user?.isActive()) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const payload: JwtPayload = {
        sub: user.getId(),
        email: user.getEmail().getValue(),
        username: user.getEmail().getValue(),
        role: user.getRole(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
      };
      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = this.jwtAuthService.generateTokens(payload);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException("Refresh token expired");
      }
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async validateUser(userId: string): Promise<ValidatedUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user?.isActive()) return null;

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
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 3600; // default 1 hour
    }
  }
}
