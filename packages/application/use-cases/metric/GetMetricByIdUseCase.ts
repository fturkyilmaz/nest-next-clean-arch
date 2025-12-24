import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { MetricRepository } from '@domain/repositories/MetricRepository';
import { ClientMetrics } from '@domain/entities/ClientMetrics.entity';

export class GetMetricByIdQuery implements IQuery {
  constructor(public readonly id: string) { }
}

@QueryHandler(GetMetricByIdQuery)
export class GetMetricByIdUseCase
  implements IQueryHandler<GetMetricByIdQuery> {
  constructor(
    @Inject('MetricRepository')
    private readonly repo: MetricRepository,
  ) { }

  async execute(query: GetMetricByIdQuery): Promise<ClientMetrics | null> {
    return this.repo.findById(query.id);
  }
}
