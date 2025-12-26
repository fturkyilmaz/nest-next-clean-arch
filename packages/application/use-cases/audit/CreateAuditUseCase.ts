import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuditRepository } from '@domain/repositories/AuditRepository';
import { AuditLog } from '@domain/entities/AuditLog.entity';

export class CreateAuditCommand implements ICommand {
  constructor(
    public readonly userId: string | null,
    public readonly action: string,
    public readonly entity: string,
    public readonly entityId: string,
    public readonly changes?: string,
    public readonly metadata?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) { }
}

@CommandHandler(CreateAuditCommand)
export class CreateAuditUseCase
  implements ICommandHandler<CreateAuditCommand> {
  constructor(
    @Inject('AuditRepository')
    private readonly repo: AuditRepository,
  ) { }

  async execute(command: CreateAuditCommand): Promise<AuditLog> {
    const audit = AuditLog.create({
      id: crypto.randomUUID(),
      userId: command.userId,
      action: command.action,
      entity: command.entity,
      entityId: command.entityId,
      changes: command.changes,
      metadata: command.metadata,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      createdAt: new Date(),
    });

    return this.repo.create(audit);
  }
}
