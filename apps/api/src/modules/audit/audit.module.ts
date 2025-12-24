import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { CreateAuditUseCase } from '@application/use-cases/audit/CreateAuditUseCase';
import { GetAllAuditUseCase } from '@application/use-cases/audit/GetAllAuditUseCase';
import { GetAuditByIdUseCase } from '@application/use-cases/audit/GetAuditByIdUseCase';
import { PrismaAuditRepository } from '@infrastructure/repositories/PrismaAuditRepository';

const commandHandlers = [CreateAuditUseCase];
const queryHandlers = [GetAllAuditUseCase, GetAuditByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [AuditController],
  providers: [
    AuditService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: 'AuditRepository', useClass: PrismaAuditRepository },
  ],
  exports: ['AuditRepository', ...commandHandlers, ...queryHandlers],
})
export class AuditModule {}
