import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { MealRepository } from '@domain/repositories/MealRepository';

export class CreateMealCommand implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(CreateMealCommand)
export class CreateMealUseCase implements ICommandHandler<CreateMealCommand> {
  constructor(private readonly repo: MealRepository) {}

  async execute(command: CreateMealCommand) {
    return this.repo.create(command.data);
  }
}
