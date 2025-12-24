import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { FoodRepository } from '@domain/repositories/FoodRepository';

export class CreateFoodCommand implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(CreateFoodCommand)
export class CreateFoodUseCase implements ICommandHandler<CreateFoodCommand> {
  constructor(private readonly repo: FoodRepository) {}

  async execute(command: CreateFoodCommand) {
    return this.repo.create(command.data);
  }
}
