import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { AuthService, JwtStrategy } from '@infrastructure/auth';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { JwtAuthService } from '@infrastructure/auth/JwtAuthService';
import { PrismaUserRepository } from '@infrastructure/repositories';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-secret'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
    }),
    RepositoryModule,
  ],
  controllers: [AuthController], 
  providers: [
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
    { provide: 'IJwtService', useClass: JwtAuthService },
    AuthService,
    JwtStrategy,
    LoginUseCase,
    RefreshTokenUseCase,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
    'IJwtService',
    JwtModule,
    'IUserRepository',
  ],
})
export class AuthModule {}
