import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FoodRepository } from '@domain/repositories/FoodRepository';
import { FoodItem, FoodCategory } from '@domain/entities/FoodItem.entity';
import { CreateFoodDto } from '@application/dto/food/CreateFoodDto';
import { randomUUID } from 'crypto';

export class CreateFoodCommand implements ICommand {
  constructor(public readonly dto: CreateFoodDto) { }
}

@CommandHandler(CreateFoodCommand)
export class CreateFoodUseCase implements ICommandHandler<CreateFoodCommand> {
  constructor(
    @Inject('FoodRepository')
    private readonly repo: FoodRepository,
  ) { }

  async execute(command: CreateFoodCommand): Promise<FoodItem> {
    const { dto } = command;

    const food = FoodItem.create({
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      category: dto.category,
      servingSize: dto.servingSize,
      servingUnit: dto.servingUnit,
      calories: dto.calories,
      protein: dto.protein,
      carbs: dto.carbs,
      fat: dto.fat,
      fiber: dto.fiber,
      sugar: dto.sugar,
      sodium: dto.sodium,
    });

    return this.repo.create(food);
  }
}
