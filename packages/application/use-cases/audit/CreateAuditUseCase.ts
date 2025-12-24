import { ICommand, ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AuditRepository } from '@domain/repositories/AuditRepository';

export class CreateAuditCommand implements ICommand {
  constructor(public readonly data: any) {}
}

@CommandHandler(CreateAuditCommand)
export class CreateAuditUseCase implements ICommandHandler<CreateAuditCommand> {
  constructor(private readonly repo: AuditRepository) {}

  async execute(command: CreateAuditCommand) {
    return this.repo.create(command.data);
  }
}
