/**
 * Audit & Soft Delete Module
 *
 * Provides audit logging and soft delete services for the application.
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RequestContextService } from '../middleware/request-context.service';
import { AuditService } from './audit.service';
import { SoftDeleteService } from './soft-delete.service';

@Module({
  providers: [AuditService, SoftDeleteService, PrismaService, RequestContextService],
  exports: [AuditService, SoftDeleteService],
})
export class AuditModule {}
