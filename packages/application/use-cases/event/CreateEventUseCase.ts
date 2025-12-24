import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { EventRepository } from '@domain/repositories/EventRepository';

export class CreateEventCommand implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(CreateEventCommand)
export class CreateEventUseCase implements ICommandHandler<CreateEventCommand> {
  constructor(private readonly repo: EventRepository) {}

  async execute(command: CreateEventCommand) {
    return this.repo.create(command.data);
  }
}
