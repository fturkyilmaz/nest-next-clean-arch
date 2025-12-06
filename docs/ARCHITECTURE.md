🏗️ Architecture - Diet Management System

🎯 Overview

This document describes the architecture of the Diet Management System, implemented with NestJS for backend, Next.js for web frontend, React Native for mobile frontend, and PostgreSQL as the database. The system follows Clean Architecture principles, CQRS pattern, and Domain-Driven Design.

📂 Monorepo Structure

/diet-app/
│
├── apps/
│   ├── web/                # Next.js (Dietitian portal)
│   ├── mobile/             # React Native (Client app)
│   └── api/                # Nest.js (Backend API)
│
├── packages/
│   ├── domain/             # Domain Layer (Entities, Value Objects, Policies)
│   ├── application/        # Application Layer (UseCases, DTOs, Interfaces)
│   ├── infrastructure/     # Infrastructure (PostgreSQL, Auth, Messaging)
│   ├── ui/                 # Shared UI components (Radix, Tailwind, RN UI)
│   └── config/             # Shared configs (eslint, tsconfig, tailwind, etc.)
│
├── tools/
│   ├── devops/             # CI/CD scripts (GitHub Actions, Dockerfiles)
│   └── scripts/            # Utility scripts (migration, seeding)
│
├── pnpm-workspace.yaml
├── package.json
└── README.md

🧩 Layers

Domain Layer

Entities: User (Admin, Dietitian), Client, DietPlan, Meal

Value Objects: Email, NutritionalInfo, Schedule

Policies: RBAC (Admin vs Dietitian vs Client)

Application Layer

UseCases: CreateDietPlan, AssignClientToDietitian, UpdateMealSchedule

DTOs: DietPlanDTO, ClientDTO

Interfaces: IDietPlanRepository, IClientRepository

Infrastructure Layer

Database: PostgreSQL via Prisma ORM

Repositories: Prisma implementations of repositories

Auth: JWT strategy (NestJS Passport), RBAC guards

Messaging (optional): Event bus (future Azure Service Bus)

Persistence: Local PostgreSQL, migrations via Prisma

Presentation Layer

Web (Next.js): Dietitian portal → manage clients, diet plans

Mobile (React Native): Client app → view diet plan, meals, notifications

API (Nest.js): REST endpoints, OpenAPI docs, health checks

🔑 Key Design Decisions

Clean Architecture: Separation of concerns across domain, application, infrastructure, and presentation.

CQRS: Commands for mutations (e.g., CreateDietPlan), Queries for reads (e.g., GetClientDietPlans).

DDD: Rich domain models encapsulating business rules.

Repository Pattern: Abstract interfaces in application layer, Prisma implementations in infrastructure.

RBAC: Role-based guards for Admin, Dietitian, Client.

📊 Data Model (PostgreSQL)

Tables

Users: id, role, email, passwordHash

Clients: id, dietitianId, healthMetrics

DietPlans: id, clientId, dietitianId, createdAt

Meals: id, dietPlanId, name, calories, schedule

Relationships

One Dietitian → Many Clients

One Client → Many DietPlans

One DietPlan → Many Meals

⚙️ Infrastructure & DevOps

Local Development: Docker Compose with PostgreSQL

ORM: Prisma migrations and seed scripts

CI/CD: GitHub Actions for build, test, lint, Docker image build

Deployment: Initially local, later Azure App Service / Kubernetes

🔍 Observability

Logging: Pino logger

Metrics: Prometheus endpoint (future Azure Monitor)

Tracing: OpenTelemetry integration

🧪 Testing Strategy

Unit Tests: Jest for domain and use cases

Integration Tests: Prisma + PostgreSQL test container

E2E Tests: Supertest for API endpoints

Contract Tests: Pact for API compatibility

🚀 Roadmap

Sprint 1: Monorepo setup + NestJS skeleton + PostgreSQL integration

Sprint 2: Auth (JWT, RBAC) + User/Dietitian/Client entities

Sprint 3: DietPlan CRUD + Next.js dietitian portal UI

Sprint 4: React Native client app + meal schedule view

Sprint 5: CI/CD pipeline + observability