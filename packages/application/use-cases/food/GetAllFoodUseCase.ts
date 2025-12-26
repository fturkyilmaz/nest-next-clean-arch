import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FoodRepository } from '@domain/repositories/FoodRepository';
import { FoodItem } from '@domain/entities/FoodItem.entity';

export class GetAllFoodQuery implements IQuery { }

@QueryHandler(GetAllFoodQuery)
export class GetAllFoodUseCase
  implements IQueryHandler<GetAllFoodQuery> {
  constructor(
    @Inject('FoodRepository')
    private readonly repo: FoodRepository,
  ) { }

  async execute(): Promise<FoodItem[]> {
    return this.repo.findAll();
  }
}
