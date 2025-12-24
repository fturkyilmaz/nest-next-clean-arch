import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReportRepository } from '@domain/repositories/ReportRepository';
import { Report } from '@domain/entities/Report.entity';

export class GetReportByIdQuery implements IQuery {
  constructor(public readonly id: string) { }
}

@QueryHandler(GetReportByIdQuery)
export class GetReportByIdUseCase
  implements IQueryHandler<GetReportByIdQuery> {
  constructor(
    @Inject('ReportRepository')
    private readonly repo: ReportRepository,
  ) { }

  async execute(query: GetReportByIdQuery): Promise<Report | null> {
    return this.repo.findById(query.id);
  }
}
