import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MetricRepository } from '@domain/repositories/MetricRepository';

export class GetMetricByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetMetricByIdQuery)
export class GetMetricByIdUseCase implements IQueryHandler<GetMetricByIdQuery> {
  constructor(private readonly repo: MetricRepository) {}

  async execute(query: GetMetricByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
