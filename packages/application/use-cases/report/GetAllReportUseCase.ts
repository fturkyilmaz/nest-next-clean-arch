import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReportRepository } from '@domain/repositories/ReportRepository';
import { Report } from '@domain/entities/Report.entity';

export class GetAllReportQuery implements IQuery { }

@QueryHandler(GetAllReportQuery)
export class GetAllReportUseCase
  implements IQueryHandler<GetAllReportQuery> {
  constructor(
    @Inject('ReportRepository')
    private readonly repo: ReportRepository,
  ) { }

  async execute(): Promise<Report[]> {
    return this.repo.findAll();
  }
}
