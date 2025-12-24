import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EventRepository } from '@domain/repositories/EventRepository';
import { EventLog } from '@domain/entities/EventLog.entity';

export class CreateEventCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description?: string,
    public readonly startDate: Date,
    public readonly endDate?: Date,
    public readonly location?: string,
    public readonly clientId?: string,
    public readonly dietitianId?: string,
  ) { }
}

@CommandHandler(CreateEventCommand)
export class CreateEventUseCase
  implements ICommandHandler<CreateEventCommand> {
  constructor(
    @Inject('EventRepository')
    private readonly repo: EventRepository,
  ) { }

  async execute(command: CreateEventCommand): Promise<EventLog> {
    const event = EventLog.create({
      id: crypto.randomUUID(),
      name: command.name,
      description: command.description,
      startDate: command.startDate,
      endDate: command.endDate,
      location: command.location,
      clientId: command.clientId,
      dietitianId: command.dietitianId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.repo.create(event);
  }
}
