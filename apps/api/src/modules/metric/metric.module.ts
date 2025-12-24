import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MetricController } from './metric.controller';
import { MetricService } from './metric.service';
import { CreateMetricUseCase } from '@application/use-cases/metric/CreateMetricUseCase';
import { GetAllMetricUseCase } from '@application/use-cases/metric/GetAllMetricUseCase';
import { GetMetricByIdUseCase } from '@application/use-cases/metric/GetMetricByIdUseCase';
import { PrismaMetricRepository } from '@infrastructure/repositories/PrismaMetricRepository';

const commandHandlers = [CreateMetricUseCase];
const queryHandlers = [GetAllMetricUseCase, GetMetricByIdUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [MetricController],
  providers: [
    MetricService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: 'MetricRepository', useClass: PrismaMetricRepository },
  ],
  exports: ['MetricRepository', ...commandHandlers, ...queryHandlers],
})
export class MetricModule {}
