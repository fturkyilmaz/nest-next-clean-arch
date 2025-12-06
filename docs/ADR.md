📝 Architecture Decision Records (ADR)

ADR 001 - Partition Key Choice

Context: Initially considered Cosmos DB, later switched to PostgreSQL. Partitioning strategy still relevant for scalability. Decision: Use dietitianId as logical partition key for client and diet plan tables. Consequences: Queries scoped by dietitian are efficient; cross-dietitian queries may require joins.

ADR 002 - CQRS Implementation

Context: Need clear separation of reads and writes. Decision: Adopt NestJS CQRS module with distinct command and query handlers. Consequences: Improves scalability and testability; adds complexity in handler orchestration.

ADR 003 - Caching Strategy

Context: Performance optimization for frequently accessed diet plans. Decision: Use Redis (local dev optional, production Azure Redis) for caching diet plan queries. Consequences: Faster reads, reduced DB load; requires cache invalidation logic.

ADR 004 - Repository Pattern

Context: Accessing PostgreSQL via Prisma. Decision: Define repository interfaces in application layer, implement with Prisma in infrastructure. Consequences: Maintains Clean Architecture boundaries; allows swapping persistence layer if needed.

ADR 005 - Authentication & Authorization

Context: Role-based access required (Admin, Dietitian, Client). Decision: JWT-based auth with NestJS Passport, RBAC guards. Consequences: Secure endpoints; token management required.