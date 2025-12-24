import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MetricRepository } from '@domain/repositories/MetricRepository';
import { ClientMetrics } from '@domain/entities/ClientMetrics.entity';

export class GetAllMetricQuery implements IQuery { }

@QueryHandler(GetAllMetricQuery)
export class GetAllMetricUseCase
  implements IQueryHandler<GetAllMetricQuery> {
  constructor(
    @Inject('MetricRepository')
    private readonly repo: MetricRepository,
  ) { }

  async execute(): Promise<ClientMetrics[]> {
    return this.repo.findAll();
  }
}
