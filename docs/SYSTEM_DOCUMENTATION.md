Diet management system documentation for NestJS and PostgreSQL
You’re building something substantial. Here’s a production-ready, team-onboarding-friendly documentation you can drop into your repo and build from. It maps your 20-phase plan to concrete tasks, commands, and structures—without Azure, with NestJS + PostgreSQL, Prisma, Redis, Docker, CI, testing, and observability.

Project overview
Stack: NestJS 10+, TypeScript, Prisma ORM, PostgreSQL, Redis, Docker, GitHub Actions

Architecture: Clean Architecture + DDD + CQRS

Auth: JWT access + refresh tokens, RBAC with claims

Observability: Pino, Prometheus, OpenTelemetry, Grafana

Testing: Jest unit/integration, Testcontainers, Supertest

Docs: Swagger/OpenAPI, ADRs, ERD, deployment guide

Repository structure
Kod
/src
  /app                      # Presentation + composition root
    /controllers
    /guards
    /interceptors
    /filters
    /middleware
    /dto
  /domain                   # DDD domain
    /users
    /clients
    /diet-plans
    /meal-plans
    /meals
    /food-items
    /appointments
    /audit
    /common                 # value objects, base types, domain services
  /application              # Use cases (CQRS), ports
    /commands
    /queries
    /handlers
    /events
  /infrastructure           # Adapters & persistence
    /persistence
      /prisma
        schema.prisma
        /migrations
    /repositories
    /cache
    /logging
    /metrics
    /tracing
/config
  default.yaml
  development.yaml
  test.yaml
  production.yaml
/scripts
/tests
  /unit
  /integration
  /e2e
/docs
  README.md
  ARCHITECTURE.md
  ADR/
  ERD.md
/docker
  Dockerfile
  docker-compose.yaml
Environment configuration
Required variables:

DATABASE_URL: postgresql://user:password@host:port/dbname

REDIS_URL: redis://user:password@host:port

JWT_ACCESS_SECRET: strong random

JWT_REFRESH_SECRET: strong random

JWT_ACCESS_EXPIRES_IN: 15m

JWT_REFRESH_EXPIRES_IN: 7d

NODE_ENV: development | test | production

PORT: 3000

OTEL_EXPORTER_OTLP_ENDPOINT: optional OpenTelemetry collector endpoint

env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diet_db
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
Data model and Prisma schema
Normalization: Users, Clients, DietPlans (versioned), MealPlans, Meals, FoodItems, NutritionalInfo, Appointments, AuditLog

Indexes: FK indexes, search indexes on email/name, composite indexes on (dietitianId, clientId), version indexes on DietPlans

Constraints: Unique email, FK constraints, check constraints for roles, calories >= 0

prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         Role
  createdAt    DateTime @default(now())
  clients      Client[] @relation("DietitianClients")
  dietPlans    DietPlan[] @relation("DietitianDietPlans")
}

model Client {
  id           String   @id @default(cuid())
  dietitianId  String
  dietitian    User     @relation("DietitianClients", fields: [dietitianId], references: [id])
  name         String
  profileJson  Json?
  createdAt    DateTime @default(now())
  dietPlans    DietPlan[] @relation("ClientDietPlans")

  @@index([dietitianId])
  @@index([name])
}

model DietPlan {
  id          String   @id @default(cuid())
  clientId    String
  dietitianId String
  version     Int      @default(1)
  title       String
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  client      Client   @relation("ClientDietPlans", fields: [clientId], references: [id])
  dietitian   User     @relation("DietitianDietPlans", fields: [dietitianId], references: [id])
  mealPlans   MealPlan[] @relation("DietPlanMealPlans")

  @@index([clientId, version])
  @@index([dietitianId])
}

model MealPlan {
  id         String   @id @default(cuid())
  dietPlanId String
  dayOfWeek  Int      // 0-6
  meals      Meal[]
  dietPlan   DietPlan @relation("DietPlanMealPlans", fields: [dietPlanId], references: [id])

  @@index([dietPlanId, dayOfWeek])
}

model Meal {
  id         String   @id @default(cuid())
  mealPlanId String
  name       String
  timeOfDay  String   // breakfast/lunch/dinner/snack
  calories   Int      @default(0)
  items      MealItem[]
  mealPlan   MealPlan @relation(fields: [mealPlanId], references: [id])

  @@check(calories >= 0)
  @@index([mealPlanId, timeOfDay])
}

model MealItem {
  id        String   @id @default(cuid())
  mealId    String
  foodItemId String
  quantity  Float    @default(1.0)
  unit      String
  meal      Meal     @relation(fields: [mealId], references: [id])
  foodItem  FoodItem @relation(fields: [foodItemId], references: [id])

  @@index([mealId])
  @@index([foodItemId])
}

model FoodItem {
  id         String   @id @default(cuid())
  name       String   @unique
  category   String?
  nutrition  NutritionalInfo?
  createdAt  DateTime @default(now())

  @@index([name])
}

model NutritionalInfo {
  id           String @id @default(cuid())
  foodItemId   String @unique
  calories     Int
  proteinGr    Float
  fatGr        Float
  carbsGr      Float
  sodiumMg     Int?
  sugarGr      Float?
  fiberGr      Float?
  foodItem     FoodItem @relation(fields: [foodItemId], references: [id])
}

model Appointment {
  id          String   @id @default(cuid())
  clientId    String
  dietitianId String
  startsAt    DateTime
  endsAt      DateTime
  notes       String?
  client      Client   @relation(fields: [clientId], references: [id])
  dietitian   User     @relation(fields: [dietitianId], references: [id])

  @@index([dietitianId, startsAt])
  @@index([clientId, startsAt])
}

model AuditLog {
  id          String   @id @default(cuid())
  actorUserId String?
  entityType  String
  entityId    String
  action      String
  diffJson    Json?
  createdAt   DateTime @default(now())
  actor       User?    @relation(fields: [actorUserId], references: [id])

  @@index([entityType, entityId])
  @@index([createdAt])
}

enum Role {
  admin
  dietitian
}
Mermaid ERD
mermaid
erDiagram
  USER {
    string id PK
    string email
    string passwordHash
    string role
    datetime createdAt
  }
  CLIENT {
    string id PK
    string dietitianId FK
    string name
    json profileJson
    datetime createdAt
  }
  DIETPLAN {
    string id PK
    string clientId FK
    string dietitianId FK
    int version
    string title
    string notes
    datetime createdAt
    datetime updatedAt
  }
  MEALPLAN {
    string id PK
    string dietPlanId FK
    int dayOfWeek
  }
  MEAL {
    string id PK
    string mealPlanId FK
    string name
    string timeOfDay
    int calories
  }
  MEALITEM {
    string id PK
    string mealId FK
    string foodItemId FK
    float quantity
    string unit
  }
  FOODITEM {
    string id PK
    string name
    string category
  }
  NUTRITIONALINFO {
    string id PK
    string foodItemId FK
    int calories
    float proteinGr
    float fatGr
    float carbsGr
    int sodiumMg
    float sugarGr
    float fiberGr
  }
  APPOINTMENT {
    string id PK
    string clientId FK
    string dietitianId FK
    datetime startsAt
    datetime endsAt
    string notes
  }
  AUDITLOG {
    string id PK
    string actorUserId FK
    string entityType
    string entityId
    string action
    json diffJson
    datetime createdAt
  }

  USER ||--o{ CLIENT : has
  USER ||--o{ DIETPLAN : creates
  CLIENT ||--o{ DIETPLAN : has
  DIETPLAN ||--o{ MEALPLAN : has
  MEALPLAN ||--o{ MEAL : has
  MEAL ||--o{ MEALITEM : has
  FOODITEM ||--o| NUTRITIONALINFO : has
  MEALITEM }o--|| FOODITEM : uses
  APPOINTMENT }o--|| CLIENT : for
  APPOINTMENT }o--|| USER : by
  AUDITLOG }o--|| USER : actor
Commands
Install and bootstrap:

Setup: pnpm install

Prisma: pnpm prisma migrate dev --name init

Generate: pnpm prisma generate

Seed: pnpm ts-node scripts/seed.ts

Run:

Dev: pnpm start:dev

Test: pnpm test

Integration: pnpm test:integration

E2E: pnpm test:e2e

Lint: pnpm lint

Format: pnpm format

Authentication and authorization
JWT access/refresh: Nest Passport-JWT strategies; access 15m, refresh 7d

RBAC: Roles guard for admin/dietitian; custom policy guard for ownership checks

Claims: userId, role, dietitianId set in JWT claims

Password hashing: bcrypt with salt rounds; store passwordHash only

CQRS layout
Commands: CreateUser, UpdateUser, DeleteUser; CreateClient, AssignDietPlan, UpdateDietPlanVersion, CreateMealPlan, etc.

Queries: GetUserById, ListUsers, SearchClients, GetDietPlanWithMeals

Events: DietPlanVersioned, AppointmentScheduled, ClientProfileUpdated

Swagger and API versioning
Swagger: /docs with OpenAPI; include auth flow, error catalog, request/response examples

Versioning: URL-based (/api/v1/...), reserve v2 for future changes

Error handling and validation
Global exception filter: RFC 7807 ProblemDetails with type/title/status/detail/instance

Validation: class-validator + class-transformer on DTOs

Logging: structured Pino logger; correlation ID in context

Middleware and cross-cutting
Rate limit: Nest rate-limiter or express-rate-limit

Request logging: Pino HTTP with redaction

Correlation ID: middleware adds X-Correlation-Id

Health checks: /health liveness/readiness

CORS: strict origins, methods, headers

Timeouts: add request timeout interceptor

Caching strategy
Redis client: ioredis or @redis/client

Cache interceptor: read-through cache for queries (e.g., GetDietPlanWithMeals)

Invalidation: on command handlers, evict keys by entityId

Warming: preload dietitian dashboards

Observability and monitoring
Logging: Pino structured logs; request/response, errors, domain events

Metrics: Prometheus metrics endpoint (/metrics); counters for API calls, histograms for latency

Tracing: OpenTelemetry SDK + OTLP exporter; trace CQRS handlers and Prisma queries

Dashboards: Grafana panels for throughput, error rate, p95 latency, DB connections

Testing strategy
Unit: domain entities, value objects, services, handlers

Integration: Testcontainers for PostgreSQL; repository tests, transaction scenarios

API contract: Supertest; auth flows, RBAC, validation

Coverage: target >70% (enforced in CI)

Docker and local dev
yaml
# docker/docker-compose.yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: diet_db
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d diet_db"]
      interval: 5s
      timeout: 3s
      retries: 20
  redis:
    image: redis:7
    ports:
      - "6379:6379"
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    env_file:
      - ../.env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "3000:3000"
dockerfile
# docker/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile
EXPOSE 3000
CMD ["node", "dist/main.js"]
CI/CD with GitHub actions
yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: diet_db
        ports: ["5432:5432"]
        options: >-
          --health-cmd="pg_isready -U postgres -d diet_db"
          --health-interval=5s --health-timeout=3s --health-retries=20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/diet_db
      - run: pnpm test -- --coverage
      - run: pnpm build

  docker:
    runs-on: ubuntu-latest
    needs: build-test
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
ADR template
Title: Short decision name

Status: Accepted/Proposed/Deprecated

Context: Why this decision, constraints, requirements

Decision: What we chose

Consequences: Trade-offs, risks, follow-ups

Examples to record:

Prisma vs TypeORM

CQRS handler boundaries

Redis cache strategy

DietPlan versioning model

Prometheus metrics taxonomy

API endpoints (v1)
Auth:

POST /api/v1/auth/login: returns access + refresh

POST /api/v1/auth/refresh

POST /api/v1/auth/logout

Users:

GET /api/v1/users (admin)

GET /api/v1/users/:id (admin/dietitian self)

POST /api/v1/users (admin)

PATCH /api/v1/users/:id (admin)

DELETE /api/v1/users/:id (admin)

Clients:

GET /api/v1/clients (dietitian owns; admin all)

POST /api/v1/clients (dietitian/admin)

GET /api/v1/clients/:id

PATCH /api/v1/clients/:id

DELETE /api/v1/clients/:id

Diet plans:

GET /api/v1/clients/:id/diet-plans

POST /api/v1/clients/:id/diet-plans (creates v1 or bumps version)

GET /api/v1/diet-plans/:id

PATCH /api/v1/diet-plans/:id

POST /api/v1/diet-plans/:id/version (bump version)

Meal plans and meals:

POST /api/v1/diet-plans/:id/meal-plans

POST /api/v1/meal-plans/:id/meals

PATCH /api/v1/meals/:id

DELETE /api/v1/meals/:id

Food items:

GET /api/v1/foods

POST /api/v1/foods

PATCH /api/v1/foods/:id

GET /api/v1/foods/:id/nutrition

Appointments:

POST /api/v1/appointments

GET /api/v1/appointments?dietitianId=...&from=...&to=...

Health:

GET /health

GET /metrics (Prometheus)

Error response standard (RFC 7807)
Content-Type: application/problem+json

Fields:

type: URI to doc page

title: brief summary

status: HTTP status code

detail: human-readable explanation

instance: request path

errors: field-level validation details (optional)

Performance optimization
DB: indexes, connection pooling, bulk inserts for seeds, avoid N+1 via joins or nested selects

App: cache hot queries, paginate lists, batch CQRS handlers for mass updates

Tracing: find slow hops via spans on Prisma and Redis

Next steps
Phase 1–3 implementation order:

DB schema + migrations + seed

Auth module with JWT + refresh + RBAC

CQRS skeleton + basic User/Client features

Kickoff commands:

pnpm prisma migrate dev --name init

pnpm prisma generate

pnpm start:dev

If you want, I’ll generate initial Nest modules (auth, users, clients), DTOs, CQRS handlers, and a seed script aligned with this doc—ready to paste into your repo.