import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetClientMetricsHistoryQuery } from './GetClientMetricsHistoryQuery';
import { ClientMetrics } from '@domain/entities/ClientMetrics.entity';
import { Inject } from '@nestjs/common';
import { IClientMetricsRepository } from '@application/interfaces/IClientMetricsRepository';

export @QueryHandler(GetClientMetricsHistoryQuery) class GetClientMetricsHistoryQueryHandler
  implements IQueryHandler<GetClientMetricsHistoryQuery> {
  constructor(
    @Inject('IClientMetricsRepository')
    private readonly metricsRepository: IClientMetricsRepository
  ) { }

  async execute(query: GetClientMetricsHistoryQuery): Promise<ClientMetrics[]> {
    return await this.metricsRepository.findByClientId(
      query.clientId,
      query.skip,
      query.take
    );
  }
}
