import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { MetricRepository } from '@domain/repositories/MetricRepository';

export class CreateMetricCommand implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(CreateMetricCommand)
export class CreateMetricUseCase implements ICommandHandler<CreateMetricCommand> {
  constructor(private readonly repo: MetricRepository) {}

  async execute(command: CreateMetricCommand) {
    return this.repo.create(command.data);
  }
}
