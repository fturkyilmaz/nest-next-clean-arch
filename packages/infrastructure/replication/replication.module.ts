/**
 * Replication Module
 *
 * Provides offline data replication endpoints
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReplicationService } from './replication.service';
import { ReplicationController } from './replication.controller';

@Module({
  providers: [ReplicationService, PrismaService],
  controllers: [ReplicationController],
  exports: [ReplicationService],
})
export class ReplicationModule {}
