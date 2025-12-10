// apps/api/src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { JwtStrategy, AuthService } from '@infrastructure/auth';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@shared/guards/RolesGuard';

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
    ConfigService,
    JwtStrategy,
    AuthService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule {}
