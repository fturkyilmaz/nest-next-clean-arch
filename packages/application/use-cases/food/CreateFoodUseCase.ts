import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FoodRepository } from '@domain/repositories/FoodRepository';
import { FoodItem, FoodCategory } from '@domain/entities/FoodItem.entity';

export class CreateFoodCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description?: string,
    public readonly category?: FoodCategory,
    public readonly servingSize?: number,
    public readonly servingUnit?: string,
    public readonly calories?: number,
    public readonly protein?: number,
    public readonly carbs?: number,
    public readonly fat?: number,
    public readonly fiber?: number,
    public readonly sugar?: number,
    public readonly sodium?: number,
  ) { }
}

@CommandHandler(CreateFoodCommand)
export class CreateFoodUseCase
  implements ICommandHandler<CreateFoodCommand> {
  constructor(
    @Inject('FoodRepository')
    private readonly repo: FoodRepository,
  ) { }

  async execute(command: CreateFoodCommand): Promise<FoodItem> {
    const food = FoodItem.create({
      id: crypto.randomUUID(),
      name: command.name,
      description: command.description,
      category: command.category,
      servingSize: command.servingSize,
      servingUnit: command.servingUnit,
      calories: command.calories,
      protein: command.protein,
      carbs: command.carbs,
      fat: command.fat,
      fiber: command.fiber,
      sugar: command.sugar,
      sodium: command.sodium,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.repo.create(food);
  }
}
