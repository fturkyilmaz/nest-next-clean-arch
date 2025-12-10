import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';

// Feature modules
import { HealthModule } from './modules/health/health.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DietPlanModule } from './modules/dietplan/dietplan.module';
import { ClientModule } from './modules/client/client.module';

// Infrastructure modules
import { DatabaseModule } from '@infrastructure/database/DatabaseModule';
import { RedisCacheModule } from '@infrastructure/cache/RedisCacheModule';

// Middleware
import { CorrelationIdMiddleware } from '@infrastructure/middleware/CorrelationIdMiddleware';
import { RequestLoggingMiddleware } from '@infrastructure/middleware/RequestLoggingMiddleware';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // 60 seconds
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests
      },
    ]),

    // CQRS
    CqrsModule.forRoot(),

    // Infrastructure
    DatabaseModule,
    RedisCacheModule,

    // Feature modules
    HealthModule,
    AuthModule,
    UserModule,
    ClientModule,
    DietPlanModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}