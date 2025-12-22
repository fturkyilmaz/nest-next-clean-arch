import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly iat?: number;
  readonly exp?: number;
}

export interface CurrentUserData {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable must be defined');
    }
  }

  async validate(payload: JwtPayload): Promise<CurrentUserData> {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}
