import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt'; // Added JwtService here
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { AuthService, JwtStrategy } from '@infrastructure/auth';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { JwtAuthService } from '@infrastructure/auth/JwtAuthService';
import { PrismaUserRepository } from '@infrastructure/repositories';
import { IJwtService } from '@application/interfaces/services/IJwtService';
import { IUserRepository } from '@application/interfaces/IUserRepository';

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
    JwtModule, // 🔑 export edilmeli
    'IUserRepository',
  ],
})
export class AuthModule { }
