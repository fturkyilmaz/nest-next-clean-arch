
# nest-next-clean-arch

Enterprise-level monorepo project built with **NestJS**, **Next.js**, and **React Native**, 
structured with **Clean Architecture** principles.

## 🚀 Tech Stack
- **Frontend (Web):** Next.js, React, TanStack Query, Redux, Tailwind CSS, Radix UI
- **Frontend (Mobile):** React Native, Secure Storage, Biometric Auth
- **Backend:** NestJS, JWT, LDAP, ADFS/OAuth2.0, Prisma ORM, PostgreSQL/SQL Server
- **DevOps:** pnpm workspaces, Docker, Azure DevOps CI/CD
- **Cross-cutting:** Observability (OpenTelemetry, Prometheus, Grafana), Security Hardening, Testing Strategy

## 📂 Monorepo Structure
```
apps/
  web/       # Next.js frontend
  api/       # NestJS backend
  mobile/    # React Native app
packages/
  ui/        # Shared UI components
  core-domain/
  core-contracts/
  core-utils/
  data-access/
  app-services/
```

## 🛠️ Kurulum

### 1. Repo’yu klonla
```bash
git clone https://github.com/fturkyilmaz/nest-next-clean-arch.git
cd nest-next-clean-arch
```

### 2. Bağımlılıkları yükle
```bash
corepack enable
pnpm install
```

### 3. Ortak paketleri build et
```bash
pnpm -r build
```

### 4. Prisma migrate çalıştır
```bash
cd packages/data-access
pnpm prisma migrate dev
pnpm prisma generate
```

### 5. Backend’i çalıştır
```bash
cd apps/api
pnpm start:dev
```

### 6. Frontend’i çalıştır
```bash
cd apps/web
pnpm dev
```

### 7. Mobile (React Native)
```bash
cd apps/mobile
pnpm start
```
> Expo kullanıyorsan `expo start` komutu ile QR kod üzerinden cihazda test edebilirsin.

---

## 🧪 Testing
```bash
pnpm -r test
```

- Unit tests (domain use cases)
- Integration tests (adapters + controllers)
- E2E tests (Playwright/Cypress, Detox for mobile)
- Contract tests (API compatibility)

---

## ⚙️ CI/CD
- Docker multi-stage builds
- Azure DevOps pipelines
- Quality gates (lint, type-check, coverage)
- Blue-Green deployment


Bu haliyle README.md hem **kurulum adımlarını** hem de **teknoloji stack’ini** kapsıyor.  

👉 İstersen sana bir de **Docker Compose örneği** ekleyeyim, böylece PostgreSQL/SQL Server + API + Web + Mobile birlikte ayağa kalkabilir.
