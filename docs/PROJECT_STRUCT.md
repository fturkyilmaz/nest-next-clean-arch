# 🏗️ Clean Architecture Project Structure

## 📂 Monorepo (pnpm workspace)

/diet-app/
│
├── apps/
│   ├── web/                # Next.js (Presentation Layer - Dietitian portal)
│   ├── mobile/             # React Native (Presentation Layer - Client app)
│   └── api/                # Nest.js (Infrastructure + Application Layer)
│
├── packages/
│   ├── domain/             # Domain Layer (Entities, Value Objects, Policies)
│   │   ├── entities/       # User, Client, DietPlan, Meal
│   │   ├── value-objects/  # Email, NutritionalInfo, Schedule
│   │   └── policies/       # Business rules (RBAC, constraints)
│   ├── application/        # Application Layer (UseCases, DTOs, Interfaces)
│   │   ├── use-cases/      # CreateDietPlan, AssignClient, UpdateMeal
│   │   ├── dto/            # DietPlanDTO, ClientDTO
│   │   └── interfaces/     # Repository interfaces
│   ├── infrastructure/     # Infrastructure Layer
│   │   ├── repositories/   # Prisma implementations
│   │   ├── auth/           # JWT, OAuth2, LDAP adapters
│   │   └── messaging/      # Event bus (future Azure Service Bus)
│   ├── ui/                 # Shared UI components (Radix, Tailwind, RN UI)
│   └── config/             # Shared configs (eslint, tsconfig, tailwind)
│
├── tools/
│   ├── devops/             # CI/CD pipelines (GitHub Actions, Azure DevOps)
│   └── scripts/            # Migration, seeding scripts
│
├── pnpm-workspace.yaml
├── package.json
└── README.md

---

## 🎯 Katmanların İlan ile Eşleştirilmesi

- **Presentation Layer (apps/web, apps/mobile):**  
  - Next.js + React Native → UI katmanı  
  - TanStack Query → async data management  
  - Tailwind + Radix → reusable, accessible UI  
  - Redux → state orchestration  

- **Application Layer (packages/application):**  
  - CQRS → Command/Query ayrımı  
  - DTO + UseCase → Nest.js servisleriyle konuşan aracı katman  
  - Validation → Zod/FluentValidation  

- **Domain Layer (packages/domain):**  
  - Entities & Value Objects → User, Client, DietPlan, Meal  
  - Business Rules → JWT doğrulama, RBAC policies  
  - Policies → Örn. “Bir kullanıcı aynı anda sadece bir aktif diyet planına sahip olabilir”  

- **Infrastructure Layer (apps/api, packages/infrastructure):**  
  - Nest.js → backend servisleri  
  - Prisma ORM + PostgreSQL → repository implementasyonları  
  - Auth providers → JWT, OAuth2, LDAP  
  - CI/CD → Docker + Azure DevOps pipeline  

---

## 🚀 Roadmap
1. Sprint 1: Monorepo setup + PostgreSQL integration  
2. Sprint 2: Auth (JWT, RBAC) + User/Dietitian/Client entities  
3. Sprint 3: DietPlan CRUD + Next.js dietitian portal  
4. Sprint 4: React Native client app + meal schedule view  
5. Sprint 5: CI/CD pipeline + observability  

