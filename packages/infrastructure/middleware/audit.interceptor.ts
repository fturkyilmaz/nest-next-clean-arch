/**
 * Audit Logging Interceptor
 *
 * Automatically logs audit trails for controller methods decorated with @Audit.
 * Captures request/response data and tracks changes.
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '@diet/shared';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Check if method should be audited
    const auditMeta = this.reflector.get('audit', context.getHandler());
    if (!auditMeta) {
      return next.handle();
    }

    const { entityType, action, options } = auditMeta;
    const startTime = Date.now();
    let responseData: any = null;
    let errorOccurred = false;

    return next.handle().pipe(
      tap((data) => {
        responseData = data;
      }),
      catchError((error) => {
        errorOccurred = true;
        throw error;
      }),
      tap(async () => {
        if (!errorOccurred) {
          try {
            const metadata = {
              source: this.getSource(request),
              correlationId: request.headers['x-correlation-id'] as string,
              duration: Date.now() - startTime,
            };

            // Extract entity ID from request (various patterns)
            const entityId = this.extractEntityId(request, action, responseData);

            if (entityId) {
              const oldValues = action === AuditAction.UPDATE ? this.extractOldValues(request) : undefined;
              const newValues = this.extractNewValues(request, responseData, action);

              await this.auditService.logAudit(entityType, entityId, action, oldValues, newValues, metadata);
            }
          } catch (error) {
            // Log audit error but don't fail the request
            console.error('Audit logging error:', error);
          }
        }
      }),
    );
  }

  private getSource(request: Request): 'WEB' | 'MOBILE' | 'API' | 'ADMIN_PANEL' | 'AUTOMATION' {
    const userAgent = (request.headers['user-agent'] || '').toLowerCase();
    const xSource = request.headers['x-source'];

    if (xSource === 'MOBILE' || userAgent.includes('mobile')) return 'MOBILE';
    if (xSource === 'WEB' || userAgent.includes('chrome') || userAgent.includes('firefox')) return 'WEB';
    if (xSource === 'ADMIN_PANEL') return 'ADMIN_PANEL';
    if (xSource === 'AUTOMATION') return 'AUTOMATION';

    return 'API';
  }

  private extractEntityId(request: Request, action: AuditAction, responseData: any): string | null {
    // Try to get from URL params
    if (request.params?.id) return request.params.id;

    // Try to get from body
    if (request.body?.id) return request.body.id;

    // Try to get from response
    if (responseData?.id) return responseData.id;
    if (responseData?.data?.id) return responseData.data.id;

    // For create actions, ID should be in response
    if (action === AuditAction.CREATE && responseData?.id) {
      return responseData.id;
    }

    return null;
  }

  private extractOldValues(request: Request): Record<string, unknown> | undefined {
    // For updates, try to get old values from custom header or body
    const xOldValues = request.headers['x-old-values'];
    if (xOldValues) {
      try {
        return JSON.parse(Array.isArray(xOldValues) ? xOldValues[0] : xOldValues);
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return undefined;
  }

  private extractNewValues(request: Request, responseData: any, action: AuditAction): Record<string, unknown> {
    // For creates and updates, get from request body
    if ([AuditAction.CREATE, AuditAction.UPDATE].includes(action) && request.body) {
      return request.body;
    }

    // Fall back to response data
    if (responseData?.data) {
      return responseData.data;
    }

    return responseData || {};
  }
}
