/**
 * Replication Controller - Backend
 *
 * API endpoints for offline-first mobile sync
 */

import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@diet/infrastructure';
import { CurrentUser } from '@diet/infrastructure';
import { ReplicationService } from './replication.service';
import { ReplicationPayload, ReplicationResponse } from '@diet/shared';

@ApiTags('Replication')
@Controller('api/replication')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReplicationController {
  constructor(private replicationService: ReplicationService) {}

  /**
   * Pull server changes
   *
   * Retrieves all changes on the server since last sync
   */
  @Get('pull')
  @ApiOperation({
    summary: 'Pull server changes',
    description:
      'Fetches all changes on the server since the client last synced. Includes created, updated, and deleted records.',
  })
  @ApiResponse({
    status: 200,
    description: 'Server changes retrieved successfully',
    type: ReplicationResponse,
  })
  async pullChanges(
    @CurrentUser() user: any,
    @Query('syncToken') syncToken?: string,
  ): Promise<ReplicationResponse> {
    return this.replicationService.pullChanges(user.id, syncToken);
  }

  /**
   * Push local changes
   *
   * Saves all local changes to the server
   */
  @Post('push')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Push local changes',
    description:
      'Sends all local changes (creates, updates, deletes) to the server. Returns mapping of temporary IDs to server IDs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Changes pushed successfully',
  })
  async pushChanges(
    @CurrentUser() user: any,
    @Body() payload: ReplicationPayload,
  ): Promise<{ createdIds: Record<string, string> }> {
    return this.replicationService.pushChanges(user.id, payload);
  }

  /**
   * Detect conflicts
   *
   * Identifies conflicts between client and server versions
   */
  @Post('conflicts/detect')
  @ApiOperation({
    summary: 'Detect conflicts',
    description:
      'Checks if any client changes conflict with server state. Returns list of conflicts with both versions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conflicts detected',
  })
  async detectConflicts(
    @CurrentUser() user: any,
    @Body() payload: { changes: any[] },
  ): Promise<{ conflicts: any[] }> {
    const conflicts = await this.replicationService.detectConflicts(
      user.id,
      payload.changes,
    );

    return { conflicts };
  }

  /**
   * Resolve conflict
   *
   * Marks conflict as resolved with chosen strategy
   */
  @Post('conflicts/resolve')
  @ApiOperation({
    summary: 'Resolve conflict',
    description: 'Records conflict resolution for audit trail and future reference.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conflict resolved',
  })
  async resolveConflict(
    @CurrentUser() user: any,
    @Body()
    payload: {
      recordId: string;
      resolution: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE';
      mergedData?: any;
    },
  ): Promise<{ success: boolean }> {
    await this.replicationService.resolveConflict(
      payload.recordId,
      payload.resolution,
      payload.mergedData,
    );

    return { success: true };
  }

  /**
   * Full sync endpoint
   *
   * Single endpoint for complete sync cycle (pull + push)
   */
  @Post('sync')
  @ApiOperation({
    summary: 'Full sync cycle',
    description:
      'Performs complete sync: pulls server changes, pushes local changes, detects and resolves conflicts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync completed',
  })
  async fullSync(
    @CurrentUser() user: any,
    @Body()
    payload: {
      syncToken?: string;
      changes: any[];
      deletions: any[];
    },
  ): Promise<ReplicationResponse & { createdIds: Record<string, string> }> {
    // Pull server changes
    const serverChanges = await this.replicationService.pullChanges(
      user.id,
      payload.syncToken,
    );

    // Push local changes
    const { createdIds } = await this.replicationService.pushChanges(user.id, {
      changes: payload.changes,
      deletions: payload.deletions,
    });

    // Detect conflicts
    const conflicts = await this.replicationService.detectConflicts(
      user.id,
      payload.changes,
    );

    return {
      ...serverChanges,
      conflicts,
      createdIds,
    };
  }
}
