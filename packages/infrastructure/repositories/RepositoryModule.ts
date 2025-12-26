import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/DatabaseModule';
import { RedisCacheModule } from '@infrastructure/cache/RedisCacheModule';
import { CacheService } from '@infrastructure/cache/cache.service';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaClientRepository } from './PrismaClientRepository';
import { PrismaDietPlanRepository } from './PrismaDietPlanRepository';
import { PrismaFoodItemRepository } from './PrismaFoodItemRepository';
import { PrismaAppointmentRepository } from './PrismaAppointmentRepository';
import { PrismaMealRepository } from './PrismaMealRepository';
import { PrismaMetricRepository } from './PrismaMetricRepository';
import { PrismaAuditRepository } from './PrismaAuditRepository';
import { PrismaEventRepository } from './PrismaEventRepository';
import { PrismaReportRepository } from './PrismaReportRepository';

@Module({
  imports: [DatabaseModule, RedisCacheModule],
  providers: [
    CacheService,
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
    { provide: 'IClientRepository', useClass: PrismaClientRepository },
    { provide: 'IDietPlanRepository', useClass: PrismaDietPlanRepository },
    { provide: 'IFoodItemRepository', useClass: PrismaFoodItemRepository },

    // New bindings
    { provide: 'IAppointmentRepository', useClass: PrismaAppointmentRepository },
    { provide: 'IMealRepository', useClass: PrismaMealRepository },
    { provide: 'IMetricRepository', useClass: PrismaMetricRepository },
    { provide: 'IAuditRepository', useClass: PrismaAuditRepository },
    { provide: 'IEventRepository', useClass: PrismaEventRepository },
    { provide: 'IReportRepository', useClass: PrismaReportRepository },
  ],
  exports: [
    CacheService,
    'IUserRepository',
    'IClientRepository',
    'IDietPlanRepository',
    'IFoodItemRepository',
    'IAppointmentRepository',
    'IMealRepository',
    'IMetricRepository',
    'IAuditRepository',
    'IEventRepository',
    'IReportRepository',
  ],
})
export class RepositoryModule { }
