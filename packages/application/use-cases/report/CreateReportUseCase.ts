import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ReportRepository } from '@domain/repositories/ReportRepository';

export class CreateReportCommand implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(CreateReportCommand)
export class CreateReportUseCase implements ICommandHandler<CreateReportCommand> {
  constructor(private readonly repo: ReportRepository) {}

  async execute(command: CreateReportCommand) {
    return this.repo.create(command.data);
  }
}
