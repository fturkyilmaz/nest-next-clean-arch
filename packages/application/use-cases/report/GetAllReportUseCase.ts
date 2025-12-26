import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IReportRepository } from '@application/interfaces/repositories/IReportRepository';

export class GetAllReportQuery implements IQuery { }

@QueryHandler(GetAllReportQuery)
export class GetAllReportUseCase
  implements IQueryHandler<GetAllReportQuery> {
  constructor(
    @Inject('IReportRepository')
    private readonly repo: IReportRepository,
  ) { }

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
