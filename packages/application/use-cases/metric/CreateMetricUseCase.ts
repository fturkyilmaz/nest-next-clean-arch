import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MetricRepository } from '@domain/repositories/MetricRepository';
import { ClientMetrics } from '@domain/entities/ClientMetrics.entity';

export class CreateMetricCommand implements ICommand {
  constructor(
    public readonly clientId: string,
    public readonly weight: number,
    public readonly height: number,
    public readonly bmi?: number,
    public readonly bodyFat?: number,
    public readonly waist?: number,
    public readonly hip?: number,
    public readonly notes?: string,
  ) { }
}

@CommandHandler(CreateMetricCommand)
export class CreateMetricUseCase
  implements ICommandHandler<CreateMetricCommand> {
  constructor(
    @Inject('MetricRepository')
    private readonly repo: MetricRepository,
  ) { }

  async execute(command: CreateMetricCommand): Promise<ClientMetrics> {
    const metric = ClientMetrics.create({
      id: crypto.randomUUID(),
      clientId: command.clientId,
      weight: command.weight,
      height: command.height,
      bmi: command.bmi,
      bodyFat: command.bodyFat,
      waist: command.waist,
      hip: command.hip,
      notes: command.notes,
      recordedAt: new Date(),
    });

    return this.repo.create(metric);
  }
}
