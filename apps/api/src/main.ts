import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from '@infrastructure/filters/GlobalExceptionFilter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      noSniff: true,
      xssFilter: true,
    })
  );

  // Enable CORS with security
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    exposedHeaders: ['X-Correlation-ID'],
    maxAge: 3600,
  });

  // Global exception filter (RFC 7807)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe with security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: error.constraints,
          value: error.value,
        }));
        return {
          statusCode: 422,
          message: 'Validation failed',
          errors: formattedErrors,
        };
      },
    })
  );

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Enhanced Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Diet Management System API')
    .setDescription(`
# Diet Management System API Documentation

## Overview
Production-ready RESTful API for comprehensive diet and nutrition management.

## Architecture
- **Clean Architecture** with DDD principles
- **CQRS Pattern** for command/query separation
- **Event-Driven** architecture with domain events
- **Repository Pattern** for data access abstraction

## Security
- **Helmet** - Security headers (CSP, HSTS, XSS protection)
- **Input Sanitization** - XSS and SQL injection prevention
- **CSRF Protection** - Cross-site request forgery protection
- **Rate Limiting** - 100 requests per minute
- **Encryption** - AES-256-GCM for sensitive data

## Authentication
All endpoints (except /auth/login) require JWT Bearer token authentication.

### Getting Started
1. Login with credentials to get access token
2. Include token in Authorization header: \`Bearer <token>\`
3. Refresh token before expiration using /auth/refresh

## Rate Limiting
- 100 requests per 15 minutes per IP
- Authenticated users: 1000 requests per hour

## Error Responses
All errors follow RFC 7807 Problem Details format:
\`\`\`json
{
  "type": "https://httpstatuses.com/404",
  "title": "Not Found",
  "status": 404,
  "detail": "User with id xyz not found",
  "instance": "/api/v1/users/xyz",
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`
    `)
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://github.com/your-repo',
      'support@dietapp.com'
    )
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
    .addTag('Client Metrics', 'Health metrics tracking (weight, BMI, body composition)')
    .addTag('Diet Plans', 'Diet plan creation and management')
    .addTag('Meal Plans', 'Daily meal planning and scheduling')
    .addTag('Meals', 'Individual meal management with nutritional info')
    .addTag('Food Items', 'Food database and nutritional information')
    .addTag('Health', 'API health check and monitoring')
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
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
    customSiteTitle: 'Diet Management API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Diet Management System API                          ║
  ║   🔒 Security: Helmet + CSRF + Input Sanitization        ║
  ║                                                           ║
  ║   📍 API:     http://localhost:${port}/api/v1                ║
  ║   📚 Docs:    http://localhost:${port}/api/docs              ║
  ║   ❤️  Health:  http://localhost:${port}/api/v1/health        ║
  ║                                                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
  ║   Version: 1.0.0                                          ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();


