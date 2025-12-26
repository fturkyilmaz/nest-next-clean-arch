/**
 * Replication API Client
 *
 * Mobile API client for replication endpoints
 */

import { apiClient } from './api-client';
import {
  ReplicationPayload,
  ReplicationResponse,
  ConflictResolution,
} from '@diet/shared';

export class ReplicationApiClient {
  /**
   * Pull changes from server
   */
  static async pullChanges(
    lastSyncToken?: string
  ): Promise<ReplicationResponse> {
    const params = lastSyncToken ? { syncToken: lastSyncToken } : {};

    const response = await apiClient.get('/api/replication/pull', {
      params,
    });

    return response.data;
  }

  /**
   * Push local changes to server
   */
  static async pushChanges(
    payload: ReplicationPayload
  ): Promise<{ createdIds: Record<string, string> }> {
    const response = await apiClient.post('/api/replication/push', payload);

    return response.data;
  }

  /**
   * Detect conflicts
   */
  static async detectConflicts(changes: any[]): Promise<ConflictResolution[]> {
    const response = await apiClient.post('/api/replication/conflicts/detect', {
      changes,
    });

    return response.data.conflicts || [];
  }

  /**
   * Resolve conflict
   */
  static async resolveConflict(
    recordId: string,
    resolution: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE',
    mergedData?: any
  ): Promise<{ success: boolean }> {
    const response = await apiClient.post('/api/replication/conflicts/resolve', {
      recordId,
      resolution,
      mergedData,
    });

    return response.data;
  }

  /**
   * Full sync - pull, push, and handle conflicts
   */
  static async fullSync(payload: {
    syncToken?: string;
    changes: any[];
    deletions: any[];
  }): Promise<ReplicationResponse & { createdIds: Record<string, string> }> {
    const response = await apiClient.post('/api/replication/sync', payload);

    return response.data;
  }
}

export const replicationApi = ReplicationApiClient;
