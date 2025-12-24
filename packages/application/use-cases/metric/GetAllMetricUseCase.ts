import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MetricRepository } from '@domain/repositories/MetricRepository';

export class GetAllMetricQuery implements IQuery {}

@QueryHandler(GetAllMetricQuery)
export class GetAllMetricUseCase implements IQueryHandler<GetAllMetricQuery> {
  constructor(private readonly repo: MetricRepository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
