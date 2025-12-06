import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/DatabaseModule';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaClientRepository } from './PrismaClientRepository';
import { PrismaDietPlanRepository } from './PrismaDietPlanRepository';
import { PrismaFoodItemRepository } from './PrismaFoodItemRepository';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IClientRepository',
      useClass: PrismaClientRepository,
    },
    {
      provide: 'IDietPlanRepository',
      useClass: PrismaDietPlanRepository,
    },
    {
      provide: 'IFoodItemRepository',
      useClass: PrismaFoodItemRepository,
    },
  ],
  exports: [
    'IUserRepository',
    'IClientRepository',
    'IDietPlanRepository',
    'IFoodItemRepository',
  ],
})
export class RepositoryModule {}
