import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AppointmentRepository } from '@domain/repositories/AppointmentRepository';

export class CreateAppointmentCommand implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(CreateAppointmentCommand)
export class CreateAppointmentUseCase implements ICommandHandler<CreateAppointmentCommand> {
  constructor(private readonly repo: AppointmentRepository) {}

  async execute(command: CreateAppointmentCommand) {
    return this.repo.create(command.data);
  }
}
