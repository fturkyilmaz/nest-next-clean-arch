/**
 * Offline Sync Service - React Native
 *
 * Manages synchronization of offline changes with backend.
 * Handles retries, conflict resolution, and batch syncing.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import {
  SyncQueueItem,
  ConflictResolution,
  SyncStatus,
  SyncEvent,
  ReplicationPayload,
  ReplicationResponse,
  SyncOptions,
} from '@diet/shared';
import { offlineStorageService } from './offline-storage.service';
import { apiClient } from '@/lib/api-client';

export class OfflineSyncService {
  private syncInProgress = false;
  private syncListeners: Set<(event: SyncEvent) => void> = new Set();
  private syncStatus: SyncStatus = {
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    conflictCount: 0,
    syncProgress: 0,
  };

  private options: Required<SyncOptions> = {
    batchSize: 10,
    maxConcurrent: 3,
    retryInterval: 5000,
    maxRetries: 5,
    conflictResolution: 'SERVER_WIN',
    forcePull: false,
    forcePush: false,
  };

  constructor(options?: SyncOptions) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Start synchronization
   */
  async sync(): Promise<void> {
    // Check network connectivity
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      this.emitSyncEvent({
        type: 'SYNC_FAILED',
        error: new Error('No network connection'),
        timestamp: new Date(),
      });
      return;
    }

    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.syncStatus.isSyncing = true;

    try {
      this.emitSyncEvent({
        type: 'SYNC_START',
        timestamp: new Date(),
      });

      // Pull server changes first
      if (this.options.forcePull) {
        await this.pullServerChanges();
      }

      // Push local changes
      await this.pushLocalChanges();

      // Handle conflicts
      await this.handleConflicts();

      this.syncStatus.isSyncing = false;
      this.syncStatus.lastSyncTime = new Date();

      this.emitSyncEvent({
        type: 'SYNC_COMPLETE',
        timestamp: new Date(),
      });
    } catch (error) {
      this.syncStatus.isSyncing = false;

      this.emitSyncEvent({
        type: 'SYNC_FAILED',
        error: error instanceof Error ? error : new Error('Sync failed'),
        timestamp: new Date(),
      });
    } finally {
      this.syncInProgress = false;
      await offlineStorageService.persistSyncQueue();
    }
  }

  /**
   * Pull changes from server
   */
  private async pullServerChanges(): Promise<void> {
    try {
      const response = await apiClient.get('/api/replication/pull', {
        params: {
          lastSyncToken: await this.getLastSyncToken(),
        },
      });

      const replicationResponse: ReplicationResponse = response.data;

      // Store server changes locally
      for (const change of replicationResponse.serverChanges) {
        await offlineStorageService.cacheData(
          `${change.entityType}:${change.entityId}`,
          change.data,
          change.entityType,
          3600000, // 1 hour TTL
        );
      }

      // Save sync token
      await this.saveLastSyncToken(replicationResponse.syncToken);
    } catch (error) {
      console.error('Failed to pull server changes:', error);
    }
  }

  /**
   * Push local changes to server
   */
  private async pushLocalChanges(): Promise<void> {
    const pendingItems = await offlineStorageService.getPendingSyncItems();

    if (pendingItems.length === 0) {
      this.syncStatus.pendingCount = 0;
      return;
    }

    this.syncStatus.pendingCount = pendingItems.length;
    const batches = this.createBatches(pendingItems, this.options.batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const payload: ReplicationPayload = {
          userId: '', // Would get from auth context
          changes: batch
            .filter((item) => item.operation !== 'DELETE')
            .map((item) => ({
              id: item.id,
              entityType: item.entityType,
              entityId: item.entityId,
              operation: item.operation,
              data: item.payload,
              timestamp: item.createdAt,
            })),
          deletions: batch
            .filter((item) => item.operation === 'DELETE')
            .map((item) => ({
              entityType: item.entityType,
              entityId: item.entityId,
            })),
        };

        const response = await apiClient.post('/api/replication/push', payload);

        // Mark items as synced
        for (const item of batch) {
          await offlineStorageService.markSynced(
            item.id,
            response.data.createdIds?.[item.id],
          );
        }

        this.syncStatus.syncProgress = Math.round(
          ((i + 1) / batches.length) * 100,
        );
      } catch (error) {
        // Retry failed items
        for (const item of batch) {
          if (item.retryCount < item.maxRetries) {
            await offlineStorageService.markSyncFailed(
              item.id,
              error instanceof Error ? error : new Error('Sync failed'),
              true,
            );
          } else {
            await offlineStorageService.markSyncFailed(
              item.id,
              error instanceof Error ? error : new Error('Sync failed'),
              false,
            );
          }
        }
      }
    }
  }

  /**
   * Handle conflicts
   */
  private async handleConflicts(): Promise<void> {
    // Fetch conflicts from server
    try {
      const response = await apiClient.get('/api/replication/conflicts');
      const conflicts = response.data as ConflictResolution[];

      for (const conflict of conflicts) {
        await this.resolveConflict(conflict);
      }

      this.syncStatus.conflictCount = conflicts.length;
    } catch (error) {
      console.error('Failed to handle conflicts:', error);
    }
  }

  /**
   * Resolve a single conflict
   */
  private async resolveConflict(conflict: ConflictResolution): Promise<void> {
    let resolution: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE';
    let mergedData: any;

    switch (this.options.conflictResolution) {
      case 'LOCAL_WIN':
        resolution = 'LOCAL_WIN';
        break;
      case 'SERVER_WIN':
        resolution = 'SERVER_WIN';
        mergedData = conflict.serverVersion;
        break;
      case 'MERGE':
        resolution = 'MERGE';
        mergedData = this.mergeVersions(
          conflict.localVersion,
          conflict.serverVersion,
        );
        break;
      default:
        // For manual resolution, user would handle
        resolution = 'MANUAL';
    }

    await offlineStorageService.resolveConflict(
      conflict.recordId,
      resolution,
      mergedData,
    );

    // Notify server of resolution
    await apiClient.post(`/api/replication/conflicts/${conflict.recordId}/resolve`, {
      resolution,
      mergedData,
    });
  }

  /**
   * Merge conflicting versions
   */
  private mergeVersions(local: any, server: any): any {
    // Simple merge: server wins for most fields, but keep local timestamps
    return {
      ...server,
      updatedAt: local.updatedAt,
    };
  }

  /**
   * Create batches from array
   */
  private createBatches<T>(array: T[], size: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  /**
   * Subscribe to sync events
   */
  onSyncEvent(listener: (event: SyncEvent) => void): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Emit sync event
   */
  private emitSyncEvent(event: SyncEvent): void {
    this.syncListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get last sync token
   */
  private async getLastSyncToken(): Promise<string | undefined> {
    try {
      const token = await AsyncStorage.getItem('last_sync_token');
      return token || undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Save last sync token
   */
  private async saveLastSyncToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('last_sync_token', token);
    } catch (error) {
      console.error('Failed to save sync token:', error);
    }
  }
}

/**
 * React Hook for offline sync
 */
export function useOfflineSync(options?: SyncOptions) {
  const [syncService] = useState(() => new OfflineSyncService(options));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncService.getSyncStatus());
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = syncService.onSyncEvent((event) => {
      setSyncStatus(syncService.getSyncStatus());

      if (event.type === 'SYNC_COMPLETE') {
        // Invalidate all queries after successful sync
        queryClient.invalidateQueries();
      }
    });

    return unsubscribe;
  }, [syncService, queryClient]);

  return {
    sync: () => syncService.sync(),
    syncStatus,
    isSyncing: syncStatus.isSyncing,
    pendingCount: syncStatus.pendingCount,
    failedCount: syncStatus.failedCount,
    conflictCount: syncStatus.conflictCount,
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
