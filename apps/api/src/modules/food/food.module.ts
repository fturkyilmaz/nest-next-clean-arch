import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { CreateFoodUseCase } from '@application/use-cases/food/CreateFoodUseCase';
import { GetAllFoodUseCase } from '@application/use-cases/food/GetAllFoodUseCase';
import { GetFoodByIdUseCase } from '@application/use-cases/food/GetFoodByIdUseCase';
import { PrismaFoodRepository } from '@infrastructure/repositories/PrismaFoodRepository';

const commandHandlers = [CreateFoodUseCase];
const queryHandlers = [GetAllFoodUseCase, GetFoodByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [FoodController],
  providers: [
    FoodService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: 'FoodRepository', useClass: PrismaFoodRepository },
  ],
  exports: ['FoodRepository', ...commandHandlers, ...queryHandlers],
})
export class FoodModule {}
