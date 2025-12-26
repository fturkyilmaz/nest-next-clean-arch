import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MealRepository } from '@domain/repositories/MealRepository';
import { TimeOfDay, Meal } from '@domain/entities/Meal.entity';

export class CreateMealCommand implements ICommand {
  constructor(
    public readonly mealPlanId: string,
    public readonly name: string,
    public readonly timeOfDay: TimeOfDay,
    public readonly description?: string,
    public readonly instructions?: string,
    public readonly calories?: number,
    public readonly protein?: number,
    public readonly carbs?: number,
    public readonly fat?: number,
    public readonly fiber?: number,
  ) { }
}

@CommandHandler(CreateMealCommand)
export class CreateMealUseCase
  implements ICommandHandler<CreateMealCommand> {
  constructor(
    @Inject('MealRepository')
    private readonly repo: MealRepository,
  ) { }

  async execute(command: CreateMealCommand): Promise<Meal> {
    const meal = Meal.create({
      mealPlanId: command.mealPlanId,
      name: command.name,
      timeOfDay: command.timeOfDay,
      description: command.description,
      instructions: command.instructions,
      calories: command.calories,
      protein: command.protein,
      carbs: command.carbs,
      fat: command.fat,
      fiber: command.fiber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.repo.create(meal);
  }
}
