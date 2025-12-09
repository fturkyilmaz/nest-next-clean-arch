import { Module, Global } from '@nestjs/common';
import { MetricsService } from './MetricsService';
import { MetricsController } from './MetricsController';
import { MetricsInterceptor } from './MetricsInterceptor';

@Global()
@Module({
    controllers: [MetricsController],
    providers: [MetricsService, MetricsInterceptor],
    exports: [MetricsService, MetricsInterceptor],
})
export class MetricsModule { }
