import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IReportRepository } from '@application/interfaces/repositories/IReportRepository';

export class GetReportByIdQuery implements IQuery {
  constructor(public readonly id: string) { }
}

@QueryHandler(GetReportByIdQuery)
export class GetReportByIdUseCase
  implements IQueryHandler<GetReportByIdQuery> {
  constructor(
    @Inject('IReportRepository')
    private readonly repo: IReportRepository,
  ) { }

  async execute(query: GetReportByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
