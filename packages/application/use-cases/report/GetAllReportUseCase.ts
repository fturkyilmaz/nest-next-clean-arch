import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ReportRepository } from '@domain/repositories/ReportRepository';

export class GetAllReportQuery implements IQuery {}

@QueryHandler(GetAllReportQuery)
export class GetAllReportUseCase implements IQueryHandler<GetAllReportQuery> {
  constructor(private readonly repo: ReportRepository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
