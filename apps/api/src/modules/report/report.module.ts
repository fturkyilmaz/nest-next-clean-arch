import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { CreateReportUseCase } from '@application/use-cases/report/CreateReportUseCase';
import { GetAllReportUseCase } from '@application/use-cases/report/GetAllReportUseCase';
import { GetReportByIdUseCase } from '@application/use-cases/report/GetReportByIdUseCase';
import { PrismaReportRepository } from '@infrastructure/repositories/PrismaReportRepository';

const commandHandlers = [CreateReportUseCase];
const queryHandlers = [GetAllReportUseCase, GetReportByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [ReportController],
  providers: [
    ReportService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: 'ReportRepository', useClass: PrismaReportRepository },
  ],
  exports: ['ReportRepository', ...commandHandlers, ...queryHandlers],
})
export class ReportModule {}
