import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MealController } from './meal.controller';
import { MealService } from './meal.service';
import { CreateMealUseCase } from '@application/use-cases/meal/CreateMealUseCase';
import { GetAllMealUseCase } from '@application/use-cases/meal/GetAllMealUseCase';
import { GetMealByIdUseCase } from '@application/use-cases/meal/GetMealByIdUseCase';
import { PrismaMealRepository } from '@infrastructure/repositories/PrismaMealRepository';

const commandHandlers = [CreateMealUseCase];
const queryHandlers = [GetAllMealUseCase, GetMealByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [MealController],
  providers: [
    MealService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: 'MealRepository', useClass: PrismaMealRepository },
  ],
  exports: ['MealRepository', ...commandHandlers, ...queryHandlers],
})
export class MealModule {}
