import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@infrastructure/filters/GlobalExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:', 'http:'],
        },
      } : false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
    })
  );

  // CORS
  app.enableCors({
    origin: (process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000']).map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    exposedHeaders: ['X-Correlation-ID'],
    maxAge: 3600,
  });

  // Global exception filter (RFC 7807 uyumlu tasarım)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: error.constraints,
          value: (error as any).value,
        }));
        return {
          statusCode: 422,
          message: 'Validation failed',
          errors: formattedErrors,
        } as any; // custom object thrown — GlobalExceptionFilter ile normalize edebilirsin
      },
    })
  );

  // API prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger config (bearer auth, sunucular, tag’lar)
  const config = new DocumentBuilder()
    .setTitle('Diet Management System API')
    .setDescription(`
# Diet Management System API Documentation

Clean Architecture + DDD + CQRS prensipleriyle inşa edildi. Üretim güvenliği için Helmet, oran sınırlama, doğrulama ve problem-details hata yapısı uygulanmıştır.

Authentication: JWT Bearer.
- Authorization header: \`Bearer <token>\`
- /auth/login haricindeki tüm endpoint’ler token ister.
`)
    .setVersion('1.0.0')
    .setContact('API Support', 'https://github.com/your-repo', 'support@dietapp.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Authentication', 'User authentication and token management')
    .addTag('Users', 'User account management (Admin only)')
    .addTag('Clients', 'Client profile and health management')
    .addTag('Client Metrics', 'Health metrics tracking')
    .addTag('Diet Plans', 'Diet plan creation and management')
    .addTag('Health', 'API health check')
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://api-staging.dietapp.com', 'Staging')
    .addServer('https://api.dietapp.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: { activate: true, theme: 'monokai' },
    },
    customSiteTitle: 'Diet Management API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);

  // Startup banner
  const baseUrl = `http://localhost:${port}`;
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Diet Management System API                           ║
  ║   🔒 Security: Helmet + Validation + Rate Limiting        ║
  ║                                                           ║
  ║   📍 API:     ${baseUrl}/${apiPrefix}                         ║
  ║   📚 Docs:    ${baseUrl}/api/docs                          ║
  ║   ❤️  Health: ${baseUrl}/${apiPrefix}/health               ║
  ║                                                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                       ║
  ║   Version: 1.0.0                                          ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
