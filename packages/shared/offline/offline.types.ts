/**
 * Offline Storage Types
 *
 * Type definitions for offline-first mobile app with SQLite persistence.
 * Supports syncing, conflict resolution, and offline operations.
 */

export interface OfflineRecord<T = any> {
  id: string;
  entityType: string; // DIET_PLAN, MEAL, METRIC, etc.
  entityId: string;
  data: T;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  status: 'PENDING' | 'SYNCED' | 'CONFLICT' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  lastSyncAttempt?: Date;
  syncAttempts: number;
  errorMessage?: string;
  serverId?: string; // ID from server after sync
  isLocal: boolean; // Created offline vs synced from server
  hash?: string; // For conflict detection
}

export interface SyncQueueItem {
  id: string;
  recordId: string;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  priority: number; // Higher = syncs first
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
  lastAttempt?: Date;
  nextRetryAt?: Date;
}

export interface ConflictResolution {
  recordId: string;
  entityType: string;
  entityId: string;
  localVersion: any;
  serverVersion: any;
  conflictType: 'VERSION_MISMATCH' | 'DELETED_ON_SERVER' | 'CREATED_OFFLINE_DUPLICATE';
  resolution: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE' | 'MANUAL';
  mergedData?: any;
  resolvedAt: Date;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime?: Date;
  nextSyncTime?: Date;
  pendingCount: number;
  failedCount: number;
  conflictCount: number;
  syncProgress: number; // 0-100
  currentSyncingEntity?: string;
}

export interface OfflineDatabase {
  meals: OfflineRecord[];
  foods: OfflineRecord[];
  metrics: OfflineRecord[];
  dietPlans: OfflineRecord[];
  appointments: OfflineRecord[];
  nutritionLogs: OfflineRecord[];
}

export interface CacheMetadata {
  key: string;
  entityType: string;
  entityId?: string;
  data: any;
  createdAt: Date;
  expiresAt?: Date;
  ttl?: number; // Time to live in milliseconds
}

export interface SyncOptions {
  batchSize?: number; // Items to sync at once (default: 10)
  maxConcurrent?: number; // Concurrent syncs (default: 3)
  retryInterval?: number; // ms between retries (default: 5000)
  maxRetries?: number; // Max retry attempts (default: 5)
  conflictResolution?: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE' | 'MANUAL';
  forcePull?: boolean; // Force pull from server
  forcePush?: boolean; // Force push all pending items
}

export interface OfflineState {
  isOnline: boolean;
  lastOnlineTime?: Date;
  lastOfflineTime?: Date;
  pendingSyncItems: SyncQueueItem[];
  failedSyncItems: SyncQueueItem[];
  conflicts: ConflictResolution[];
  cachedData: Map<string, CacheMetadata>;
  syncStatus: SyncStatus;
}

export interface SyncEvent {
  type: 'SYNC_START' | 'SYNC_COMPLETE' | 'SYNC_FAILED' | 'CONFLICT_DETECTED' | 'ITEM_SYNCED';
  entityType?: string;
  entityId?: string;
  itemCount?: number;
  error?: Error;
  timestamp: Date;
}

export interface ReplicationPayload {
  userId: string;
  lastSyncToken?: string;
  changes: Array<{
    id: string;
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    data: any;
    timestamp: Date;
  }>;
  deletions: Array<{
    entityType: string;
    entityId: string;
  }>;
}

export interface ReplicationResponse {
  syncToken: string;
  serverChanges: Array<{
    entityType: string;
    entityId: string;
    data: any;
    serverVersion: number;
    lastModified: Date;
  }>;
  conflicts: Array<{
    entityType: string;
    entityId: string;
    localVersion: any;
    serverVersion: any;
  }>;
  deletedIds: string[];
}
