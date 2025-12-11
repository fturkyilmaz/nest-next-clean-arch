import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { AuthService, JwtStrategy } from '@infrastructure/auth';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { JwtAuthService } from '@infrastructure/auth/JwtAuthService';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') || 'dev-secret',
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') || '1h' },
      }),
      inject: [ConfigService],
    }),
    CqrsModule,
    RepositoryModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthService,
    LoginUseCase,
    RefreshTokenUseCase,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
    JwtAuthService,
    JwtModule,
  ],
})
export class AuthModule { }
