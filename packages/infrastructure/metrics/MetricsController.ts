import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { MetricsService } from './MetricsService';

/**
 * Metrics Controller
 * Exposes /metrics endpoint for Prometheus scraping
 */
@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get()
    @ApiExcludeEndpoint() // Hide from Swagger (internal endpoint)
    @Header('Cache-Control', 'no-cache')
    async getMetrics(): Promise<string> {
        const metrics = await this.metricsService.getMetrics();
        return metrics;
    }
}
