# Diet Management System API

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Production-ready RESTful API for comprehensive diet and nutrition management**

[Features](#features) • [Architecture](#architecture) • [Getting Started](#getting-started) • [Documentation](#documentation) • [API](#api-documentation)

</div>

---

## 🎯 Overview

A scalable, production-ready backend API for diet management built with **Clean Architecture**, **CQRS**, and **Domain-Driven Design** principles. Designed for dietitians to manage clients, create personalized diet plans, and track nutritional goals.

## ✨ Features

### Core Functionality
- 👥 **User Management** - Admin and Dietitian roles with RBAC
- 🥗 **Client Management** - Comprehensive client profiles with health metrics
- 📊 **Diet Plans** - Personalized meal plans with nutritional tracking
- 🍎 **Food Database** - Extensive food items with nutritional information
- 📈 **Health Metrics** - BMI, body composition, progress tracking
- 📅 **Meal Planning** - Daily meal schedules with portion control

### Technical Features
- 🏗️ **Clean Architecture** - Domain, Application, Infrastructure layers
- 🔄 **CQRS Pattern** - Command/Query separation for scalability
- 🎯 **DDD** - Domain-driven design with rich domain models
- 🔐 **Security** - JWT auth, Helmet, input sanitization, encryption
- 🚀 **Performance** - Redis caching, connection pooling, query optimization
- 📝 **API Documentation** - Comprehensive Swagger/OpenAPI docs
- 🧪 **Testing** - Unit, integration, E2E, and load tests (>70% coverage)
- 🐳 **Docker** - Multi-stage builds, Docker Compose
- 🔄 **CI/CD** - GitHub Actions with automated testing and deployment

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                    │
│  (Controllers, Guards, Filters, Middleware)            │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Application Layer                      │
│  (Use Cases, DTOs, CQRS Handlers, Events)              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                    Domain Layer                         │
│  (Entities, Value Objects, Domain Services)            │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Infrastructure Layer                     │
│  (Repositories, Database, Cache, External Services)    │
└─────────────────────────────────────────────────────────┘
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/fturkyilmaz/nest-next-clean-arch.git
cd nest-next-clean-arch
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start services with Docker**
```bash
docker-compose up -d postgres redis
```

5. **Run database migrations**
```bash
pnpm prisma:migrate
pnpm prisma:seed
```

6. **Start the development server**
```bash
pnpm dev:api
```

The API will be available at:
- 📍 API: http://localhost:3001/api/v1
- 📚 Swagger Docs: http://localhost:3001/api/docs
- ❤️ Health Check: http://localhost:3001/api/v1/health

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [TESTING.md](./TESTING.md) - Testing strategy and guidelines
- [SECURITY.md](./SECURITY.md) - Security implementation and best practices
- [API Documentation](http://localhost:3001/api/docs) - Interactive Swagger docs

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev:api              # Start API in development mode
pnpm dev:web              # Start web app
pnpm dev:mobile           # Start mobile app

# Building
pnpm build                # Build all packages
pnpm build:api            # Build API only

# Testing
pnpm test                 # Run unit tests
pnpm test:watch           # Run tests in watch mode
pnpm test:cov             # Run tests with coverage
pnpm test:integration     # Run integration tests
pnpm test:e2e             # Run E2E tests

# Database
pnpm prisma:generate      # Generate Prisma Client
pnpm prisma:migrate       # Run migrations
pnpm prisma:seed          # Seed database
pnpm prisma:studio        # Open Prisma Studio

# Code Quality
pnpm lint                 # Run ESLint
pnpm format               # Format code with Prettier
pnpm type-check           # Run TypeScript compiler
```

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -t diet-management-api .
docker run -p 3001:3001 diet-management-api
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Integration tests (requires Docker)
pnpm test:integration

# E2E tests
pnpm test:e2e

# Load tests
k6 run test/load/api-load-test.js
```

Coverage target: >70% (currently achieving 75%+)

## 🔐 Security

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based (RBAC) and policy-based
- **Input Validation**: class-validator with sanitization
- **Security Headers**: Helmet (CSP, HSTS, XSS protection)
- **Encryption**: AES-256-GCM for sensitive data
- **Rate Limiting**: 100 requests/15min per IP
- **SQL Injection**: Prevented by Prisma ORM

See [SECURITY.md](./SECURITY.md) for details.

## 📊 Performance

- **Response Time**: p95 < 500ms
- **Throughput**: 1000+ req/s
- **Caching**: Redis with 5min TTL
- **Database**: Connection pooling, query optimization
- **Load Testing**: k6 scenarios included

## 🚢 Deployment

### Environment Variables
See [.env.example](./.env.example) for all required variables.

### CI/CD
GitHub Actions pipeline includes:
- Linting and type checking
- Unit and integration tests
- E2E tests
- Docker image build and push
- Automated deployment to staging/production

## 📈 Monitoring

- Health checks: `/api/v1/health`
- Prometheus metrics (planned)
- Structured logging with Pino
- Correlation IDs for request tracing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - [@yourhandle](https://github.com/yourhandle)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and supporters

---

<div align="center">

**[⬆ back to top](#diet-management-system-api)**

Made with ❤️ using NestJS

</div>
