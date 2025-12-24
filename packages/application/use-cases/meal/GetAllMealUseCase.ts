import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MealRepository } from '@domain/repositories/MealRepository';
import { Meal } from '@domain/entities/Meal.entity';

export class GetAllMealQuery implements IQuery { }

@QueryHandler(GetAllMealQuery)
export class GetAllMealUseCase
  implements IQueryHandler<GetAllMealQuery> {
  constructor(
    @Inject('MealRepository')
    private readonly repo: MealRepository,
  ) { }

  async execute(): Promise<Meal[]> {
    return this.repo.findAll();
  }
}
