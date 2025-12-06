# Prompt for VS Code Copilot

You are assisting in building a **Diet Management System** backend using **NestJS 10+** and **PostgreSQL**.  
The project must follow **Clean Architecture**, **CQRS pattern**, and **Domain-Driven Design (DDD)** principles.  
Authentication is **JWT-based** with **role-based access control (RBAC)**.  

## Requirements

### Entities & Relations
- **User**
  - id, email, password, role, createdAt
  - relations: has many Clients, has many DietPlans
- **Client**
  - id, name, dietitianId
  - relations: belongs to User (dietitian), has many DietPlans
- **DietPlan**
  - id, clientId, dietitianId, createdAt
  - relations: belongs to Client, belongs to User (dietitian), has many Meals
- **Meal**
  - id, dietPlanId, name, calories, timeOfDay
  - relations: belongs to DietPlan
- **Role (enum)**: admin, dietitian, client

### Features
- RESTful API with Swagger/OpenAPI docs
- JWT authentication + RBAC
- API versioning
- Health check endpoint
- Rate limiting middleware
- Error handling middleware (RFC 7807 problem details)

### Data Layer
- PostgreSQL with Prisma ORM
- Migration & seeding strategy
- Optimized query patterns
- Audit trail table for changes

### Architecture
- CQRS with command/query separation
- Repository pattern
- Event-driven architecture (Nest EventEmitter)
- Config management via `.env` + Nest ConfigModule
- Redis caching (optional)

### DevOps
- Docker multi-stage build
- GitHub Actions workflow (build, test, deploy)
- Environment-based deployment (dev, staging, prod)

### Observability
- Structured logging (pino/winston)
- Metrics (Prometheus + Grafana)
- Distributed tracing (OpenTelemetry)

### Testing
- Unit tests (Jest)
- Integration tests (Testcontainers with PostgreSQL)
- API contract tests (Supertest)
- >70% coverage

---

## Task for Copilot
Generate NestJS modules, controllers, services, and DTOs for **User, Client, DietPlan, Meal** entities with proper relations.  
Implement **CQRS handlers** for CRUD operations.  
Add **JWT authentication** with role-based guards.  
Provide **Prisma schema** and migrations for PostgreSQL.  
Ensure code is **clean, maintainable, and production-ready**.
