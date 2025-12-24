import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AuditRepository } from '@domain/repositories/AuditRepository';

export class GetAllAuditQuery implements IQuery {}

@QueryHandler(GetAllAuditQuery)
export class GetAllAuditUseCase implements IQueryHandler<GetAllAuditQuery> {
  constructor(private readonly repo: AuditRepository) {}

  async execute(): Promise<any[]> {
    return this.repo.findAll();
  }
}
