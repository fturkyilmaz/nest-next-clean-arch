import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AppointmentRepository } from '@domain/repositories/AppointmentRepository';
import { Appointment } from '@domain/entities/Appointment.entity';

// Command
export class CreateAppointmentCommand implements ICommand {
  constructor(
    public readonly dietitianId: string,
    public readonly clientId: string,
    public readonly date: Date,
  ) {}
}

// CommandHandler (UseCase)
@CommandHandler(CreateAppointmentCommand)
export class CreateAppointmentUseCase
  implements ICommandHandler<CreateAppointmentCommand>
{
  constructor(
    @Inject('AppointmentRepository')
    private readonly repo: AppointmentRepository,
  ) {}

  async execute(command: CreateAppointmentCommand): Promise<Appointment> {
    const appointment = Appointment.create({
      dietitianId: command.dietitianId,
      clientId: command.clientId,
      date: command.date,
    });

    return this.repo.create(appointment);
  }
}
