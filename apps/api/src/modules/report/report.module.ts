import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RepositoryModule } from '@infrastructure/repositories/RepositoryModule';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { CreateReportUseCase } from '@application/use-cases/report/CreateReportUseCase';
import { GetAllReportUseCase } from '@application/use-cases/report/GetAllReportUseCase';
import { GetReportByIdUseCase } from '@application/use-cases/report/GetReportByIdUseCase';

const commandHandlers = [CreateReportUseCase];
const queryHandlers = [GetAllReportUseCase, GetReportByIdUseCase];

@Module({
  imports: [CqrsModule, RepositoryModule],
  controllers: [ReportController],
  providers: [
    ReportService,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [...commandHandlers, ...queryHandlers],
})
export class ReportModule {}
