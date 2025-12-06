import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const correlationId = req.correlationId || 'N/A';

    const startTime = Date.now();

    // Log request
    this.logger.log(
      `→ ${method} ${originalUrl} - ${ip} - ${userAgent} [${correlationId}]`
    );

    // Log response
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const logLevel = statusCode >= 400 ? 'warn' : 'log';

      this.logger[logLevel](
        `← ${method} ${originalUrl} - ${statusCode} - ${duration}ms [${correlationId}]`
      );
    });

    next();
  }
}
