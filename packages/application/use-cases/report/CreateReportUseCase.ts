import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReportRepository } from '@domain/repositories/ReportRepository';
import { Report } from '@domain/entities/Report.entity';

export class CreateReportCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly description?: string,
    public readonly clientId?: string,
    public readonly dietitianId?: string,
    public readonly generatedAt?: Date,
  ) { }
}

@CommandHandler(CreateReportCommand)
export class CreateReportUseCase
  implements ICommandHandler<CreateReportCommand> {
  constructor(
    @Inject('ReportRepository')
    private readonly repo: ReportRepository,
  ) { }

  async execute(command: CreateReportCommand): Promise<Report> {
    const report = Report.create({
      id: crypto.randomUUID(),
      title: command.title,
      description: command.description,
      clientId: command.clientId,
      dietitianId: command.dietitianId,
      generatedAt: command.generatedAt ?? new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.repo.create(report);
  }
}
