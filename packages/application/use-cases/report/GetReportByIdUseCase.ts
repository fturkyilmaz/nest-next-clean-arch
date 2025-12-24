import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ReportRepository } from '@domain/repositories/ReportRepository';

export class GetReportByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetReportByIdQuery)
export class GetReportByIdUseCase implements IQueryHandler<GetReportByIdQuery> {
  constructor(private readonly repo: ReportRepository) {}

  async execute(query: GetReportByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
