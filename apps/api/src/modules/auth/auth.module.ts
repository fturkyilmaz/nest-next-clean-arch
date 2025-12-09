import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { JwtStrategy, AuthService } from '@infrastructure/auth';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule, // Ensure ConfigService is available
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1h') as any,
        },
      }),
      inject: [ConfigService],
    }),
    CqrsModule,
    RepositoryModule,
  ],
  controllers: [AuthController],
  providers: [ConfigService, JwtStrategy, AuthService],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule { }
