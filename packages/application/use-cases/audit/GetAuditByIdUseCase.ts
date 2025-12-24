import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuditRepository } from '@domain/repositories/AuditRepository';

export class GetAuditByIdQuery implements IQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetAuditByIdQuery)
export class GetAuditByIdUseCase implements IQueryHandler<GetAuditByIdQuery> {
  constructor(private readonly repo: AuditRepository) {}

  async execute(query: GetAuditByIdQuery): Promise<any | null> {
    return this.repo.findById(query.id);
  }
}
