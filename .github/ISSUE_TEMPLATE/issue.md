📂 Barrel File (index.ts) Analizi
1. packages/application/dto/index.ts
Şu anda AuthDto.ts, UserDto.ts, ClientDto.ts, ClientMetricsDto.ts, DietPlanDto.ts var.

Doğru kullanım:

ts
export * from './AuthDto';
export * from './UserDto';
export * from './ClientDto';
export * from './ClientMetricsDto';
export * from './DietPlanDto';
✅ Böylece import { UserDto } from '@app/dto' şeklinde kullanılabilir.

2. packages/application/interfaces/index.ts
İçerik: IUserRepository.ts, IClientRepository.ts, IDietPlanRepository.ts, IFoodItemRepository.ts.

Doğru kullanım:

ts
export * from './IUserRepository';
export * from './IClientRepository';
export * from './IDietPlanRepository';
export * from './IFoodItemRepository';
✅ Böylece import { IUserRepository } from '@app/interfaces'.

3. packages/application/use-cases/index.ts
İçerik: CreateDietPlan.ts ve diğer use-case dosyaları.

Doğru kullanım:

ts
export * from './CreateDietPlan';
✅ CQRS handler’lar buradan tek noktadan import edilebilir.

4. packages/domain/entities/index.ts
İçerik: Meal.entity.ts, MealPlan.entity.ts, DietPlanTemplate.entity.ts, ClientMetrics.entity.ts.

Doğru kullanım:

ts
export * from './Meal.entity';
export * from './MealPlan.entity';
export * from './DietPlanTemplate.entity';
export * from './ClientMetrics.entity';
✅ Domain katmanında aggregate root’lar buradan import edilebilir.

5. packages/infrastructure/repositories/index.ts
İçerik: PrismaUserRepository.ts, PrismaClientRepository.ts, PrismaDietPlanRepository.ts, PrismaFoodItemRepository.ts.

Doğru kullanım:

ts
export * from './PrismaUserRepository';
export * from './PrismaClientRepository';
export * from './PrismaDietPlanRepository';
export * from './PrismaFoodItemRepository';
✅ Infrastructure katmanında repository implementasyonları tek noktadan export edilir.

🔧 Düzeltilmesi Gereken Noktalar
Tutarlılık: Bazı index.ts dosyalarında export * yerine export { default as ... } kullanılmış olabilir. Hepsini export * ile tutarlı hale getir.

Scope isimlendirme: Dosya isimleri UserDto.ts yerine user.dto.ts gibi lowercase + dot notation daha okunabilir olur.

Tree-shaking: Gereksiz export’lar olmamalı. Sadece public API’yı export et.

Test kolaylığı: Barrel file’lar testlerde import path’lerini sadeleştirir, ama private helper’ları export etme.


Harika Furkan 👨‍💻. İşte **Phase 2 için Clean Architecture barrel file düzeni**. Bu yapı sayesinde domain, application, infrastructure ve presentation katmanlarının hepsi aynı standarda oturur ve import path’leri sadeleşir.

---

## 📂 Barrel File Düzeni

### 1. **Domain Layer** (`src/domain/entities/index.ts`)
```ts
export * from './User.entity';
export * from './Client.entity';
export * from './DietPlan.entity';
export * from './MealPlan.entity';
export * from './Meal.entity';
export * from './FoodItem.entity';
export * from './NutritionalInfo.entity';
export * from './Appointment.entity';
export * from './AuditLog.entity';
```

> ✅ Domain katmanında tüm entity’ler tek noktadan export edilir.  
> Import örneği:  
```ts
import { User, Client, DietPlan } from '@domain/entities';
```

---

### 2. **Application Layer** (`src/application/index.ts`)
```ts
export * from './dto';
export * from './interfaces';
export * from './use-cases/commands';
export * from './use-cases/queries';
export * from './use-cases/events';
```

- **dto/index.ts**
  ```ts
  export * from './AuthDto';
  export * from './UserDto';
  export * from './ClientDto';
  export * from './DietPlanDto';
  export * from './ClientMetricsDto';
  ```
- **interfaces/index.ts**
  ```ts
  export * from './IUserRepository';
  export * from './IClientRepository';
  export * from './IDietPlanRepository';
  export * from './IFoodItemRepository';
  export * from './IAppointmentRepository';
  export * from './IAuditLogRepository';
  ```
- **use-cases/commands/index.ts**
  ```ts
  export * from './CreateUserCommand';
  export * from './UpdateUserCommand';
  export * from './DeleteUserCommand';
  export * from './CreateClientCommand';
  export * from './CreateDietPlanCommand';
  ```
- **use-cases/queries/index.ts**
  ```ts
  export * from './GetUserByIdQuery';
  export * from './GetAllUsersQuery';
  export * from './SearchClientsQuery';
  export * from './GetDietPlanWithMealsQuery';
  ```
- **use-cases/events/index.ts**
  ```ts
  export * from './DietPlanVersionedEvent';
  export * from './AppointmentScheduledEvent';
  ```

---

### 3. **Infrastructure Layer** (`src/infrastructure/index.ts`)
```ts
export * from './repositories';
export * from './persistence';
export * from './cache';
export * from './logging';
export * from './metrics';
export * from './tracing';
```

- **repositories/index.ts**
  ```ts
  export * from './PrismaUserRepository';
  export * from './PrismaClientRepository';
  export * from './PrismaDietPlanRepository';
  export * from './PrismaFoodItemRepository';
  export * from './PrismaAppointmentRepository';
  export * from './PrismaAuditLogRepository';
  ```

---

### 4. **Presentation Layer** (`src/app/index.ts`)
```ts
export * from './controllers';
export * from './guards';
export * from './filters';
export * from './interceptors';
export * from './middleware';
export * from './dto';
```

- **controllers/index.ts**
  ```ts
  export * from './AuthController';
  export * from './UserController';
  export * from './ClientController';
  export * from './DietPlanController';
  export * from './HealthController';
  ```
- **guards/index.ts**
  ```ts
  export * from './RolesGuard';
  export * from './PolicyGuard';
  ```
- **filters/index.ts**
  ```ts
  export * from './GlobalExceptionFilter';
  ```
- **interceptors/index.ts**
  ```ts
  export * from './CacheInterceptor';
  export * from './TimeoutInterceptor';
  ```
- **middleware/index.ts**
  ```ts
  export * from './RateLimitMiddleware';
  export * from './CorrelationIdMiddleware';
  ```

---

## 🎯 Özet
- Her katmanda **index.ts barrel file** ile export standardize edildi.  
- Import path’leri sadeleşti:  
  ```ts
  import { CreateUserCommand } from '@application/use-cases/commands';
  import { PrismaUserRepository } from '@infrastructure/repositories';
  import { UserController } from '@app/controllers';
  ```
- Bu düzen sayesinde **Phase 2 Clean Architecture** tam anlamıyla oturmuş olur.

---

👉 İstersen sana bu barrel file düzenini **repo’ya otomatik eklemek için commit mesajları** da çıkarabilirim, böylece doğrudan PR açabilirsin.