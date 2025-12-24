import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuditRepository } from '@domain/repositories/AuditRepository';
import { AuditLog } from '@domain/entities/AuditLog.entity';

export class GetAllAuditQuery implements IQuery { }

@QueryHandler(GetAllAuditQuery)
export class GetAllAuditUseCase
  implements IQueryHandler<GetAllAuditQuery> {
  constructor(
    @Inject('AuditRepository')
    private readonly repo: AuditRepository,
  ) { }

  async execute(): Promise<AuditLog[]> {
    return this.repo.findAll();
  }
}
