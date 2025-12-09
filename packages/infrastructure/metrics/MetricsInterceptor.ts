import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './MetricsService';

/**
 * HTTP Metrics Interceptor
 * Automatically records HTTP request metrics
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metricsService: MetricsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const method = request.method;
        const path = request.route?.path || request.path;
        const startTime = Date.now();

        // Increment active requests
        this.metricsService.httpActiveRequests.inc({ method });

        return next.handle().pipe(
            tap({
                next: () => {
                    const duration = Date.now() - startTime;
                    const status = response.statusCode;
                    this.metricsService.recordHttpRequest(method, path, status, duration);
                    this.metricsService.httpActiveRequests.dec({ method });
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    const status = error.status || 500;
                    this.metricsService.recordHttpRequest(method, path, status, duration);
                    this.metricsService.httpActiveRequests.dec({ method });
                },
            }),
        );
    }
}
