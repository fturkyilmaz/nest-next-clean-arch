import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RecordClientMetricsCommand } from './RecordClientMetricsCommand';
import { ClientMetrics } from '@domain/entities/ClientMetrics.entity';
import { Weight } from '@domain/value-objects/Weight.vo';
import { Height } from '@domain/value-objects/Height.vo';
import { Inject } from '@nestjs/common';

// We'll need to create this interface
export interface IClientMetricsRepository {
  create(metrics: ClientMetrics): Promise<ClientMetrics>;
}

@CommandHandler(RecordClientMetricsCommand)
export class RecordClientMetricsCommandHandler
  implements ICommandHandler<RecordClientMetricsCommand>
{
  constructor(
    @Inject('IClientMetricsRepository')
    private readonly metricsRepository: IClientMetricsRepository
  ) {}

  async execute(command: RecordClientMetricsCommand): Promise<ClientMetrics> {
    const weight = Weight.fromKilograms(command.weight);
    const height = Height.fromCentimeters(command.height);

    const metrics = ClientMetrics.create({
      clientId: command.clientId,
      weight,
      height,
      bodyFat: command.bodyFat,
      waist: command.waist,
      hip: command.hip,
      recordedAt: command.recordedAt || new Date(),
      notes: command.notes,
    });

    return await this.metricsRepository.create(metrics);
  }
}
