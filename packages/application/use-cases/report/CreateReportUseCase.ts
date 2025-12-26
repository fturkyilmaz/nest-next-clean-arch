import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IReportRepository } from '@application/interfaces/repositories/IReportRepository';
export class CreateReportCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly type?: string,
    public readonly format?: string,
    public readonly data?: any,
    public readonly clientId?: string,
    public readonly createdBy?: string,
  ) { }
}

@CommandHandler(CreateReportCommand)
export class CreateReportUseCase
  implements ICommandHandler<CreateReportCommand> {
  constructor(
    @Inject('IReportRepository')
    private readonly repo: IReportRepository,
  ) { }

  async execute(command: CreateReportCommand): Promise<any> {
    return this.repo.create({
      title: command.title,
      type: command.type || 'CUSTOM',
      format: command.format || 'PDF',
      data: command.data || {},
      clientId: command.clientId,
      createdBy: command.createdBy,
    });
  }
}
