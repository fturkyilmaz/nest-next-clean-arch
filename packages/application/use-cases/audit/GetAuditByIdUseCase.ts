import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuditRepository } from '@domain/repositories/AuditRepository';
import { AuditLog } from '@domain/entities/AuditLog.entity';

export class GetAuditByIdQuery implements IQuery {
  constructor(public readonly id: string) { }
}

@QueryHandler(GetAuditByIdQuery)
export class GetAuditByIdUseCase
  implements IQueryHandler<GetAuditByIdQuery> {
  constructor(
    @Inject('AuditRepository')
    private readonly repo: AuditRepository,
  ) { }

  async execute(query: GetAuditByIdQuery): Promise<AuditLog | null> {
    return this.repo.findById(query.id);
  }
}
