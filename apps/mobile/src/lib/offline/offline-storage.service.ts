/**
 * Offline Storage Service - React Native
 *
 * Manages offline data persistence using AsyncStorage and SQLite.
 * Provides queue management and conflict resolution.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import {
  OfflineRecord,
  SyncQueueItem,
  ConflictResolution,
  OfflineState,
  SyncStatus,
} from '@diet/shared';
import * as crypto from 'expo-crypto';

const DB_NAME = 'diet_app.db';

export class OfflineStorageService {
  private db: SQLite.SQLiteDatabase | null = null;
  private syncQueue: Map<string, SyncQueueItem> = new Map();
  private conflictStore: Map<string, ConflictResolution> = new Map();

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      await this.loadQueueFromStorage();
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const schema = `
      CREATE TABLE IF NOT EXISTS offline_records (
        id TEXT PRIMARY KEY,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        data TEXT NOT NULL,
        operation TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastSyncAttempt TEXT,
        syncAttempts INTEGER DEFAULT 0,
        errorMessage TEXT,
        serverId TEXT,
        isLocal INTEGER DEFAULT 1,
        hash TEXT
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        recordId TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL,
        priority INTEGER DEFAULT 0,
        retryCount INTEGER DEFAULT 0,
        maxRetries INTEGER DEFAULT 5,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        lastAttempt TEXT,
        nextRetryAt TEXT
      );

      CREATE TABLE IF NOT EXISTS conflicts (
        id TEXT PRIMARY KEY,
        recordId TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        localVersion TEXT NOT NULL,
        serverVersion TEXT NOT NULL,
        conflictType TEXT NOT NULL,
        resolution TEXT,
        mergedData TEXT,
        resolvedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cached_data (
        key TEXT PRIMARY KEY,
        entityType TEXT,
        entityId TEXT,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        expiresAt TEXT,
        ttl INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_offline_records_status ON offline_records(status);
      CREATE INDEX IF NOT EXISTS idx_offline_records_entity ON offline_records(entityType, entityId);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority DESC);
      CREATE INDEX IF NOT EXISTS idx_cached_data_expires ON cached_data(expiresAt);
    `;

    const statements = schema.split(';').filter((s) => s.trim());
    for (const statement of statements) {
      try {
        await this.db.execAsync(statement);
      } catch (error) {
        // Table already exists is fine
        if (!String(error).includes('already exists')) {
          console.error('Schema creation error:', error);
        }
      }
    }
  }

  /**
   * Save a local change (offline operation)
   */
  async saveOfflineChange<T>(
    entityType: string,
    entityId: string,
    data: T,
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
  ): Promise<OfflineRecord> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `${entityType}:${entityId}:${Date.now()}`;
    const hash = await this.hashData(data);

    const record: OfflineRecord = {
      id,
      entityType,
      entityId,
      data,
      operation,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      syncAttempts: 0,
      isLocal: true,
      hash,
    };

    await this.db.runAsync(
      `
      INSERT INTO offline_records
      (id, entityType, entityId, data, operation, status, createdAt, updatedAt, syncAttempts, isLocal, hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        record.id,
        record.entityType,
        record.entityId,
        JSON.stringify(record.data),
        record.operation,
        record.status,
        record.createdAt.toISOString(),
        record.updatedAt.toISOString(),
        record.syncAttempts,
        record.isLocal ? 1 : 0,
        record.hash,
      ],
    );

    // Add to sync queue
    await this.addToSyncQueue(record);

    return record;
  }

  /**
   * Get all pending sync items
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<SyncQueueItem>(
      `
      SELECT * FROM sync_queue
      WHERE status IN ('PENDING', 'FAILED')
      ORDER BY priority DESC, createdAt ASC
      `,
    );

    return result;
  }

  /**
   * Add item to sync queue
   */
  private async addToSyncQueue(record: OfflineRecord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const queueItem: SyncQueueItem = {
      id: `queue:${record.id}`,
      recordId: record.id,
      entityType: record.entityType,
      entityId: record.entityId,
      operation: record.operation,
      payload: record.data,
      status: 'PENDING',
      priority: record.operation === 'DELETE' ? 1 : 0,
      retryCount: 0,
      maxRetries: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.runAsync(
      `
      INSERT INTO sync_queue
      (id, recordId, entityType, entityId, operation, payload, status, priority, retryCount, maxRetries, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        queueItem.id,
        queueItem.recordId,
        queueItem.entityType,
        queueItem.entityId,
        queueItem.operation,
        JSON.stringify(queueItem.payload),
        queueItem.status,
        queueItem.priority,
        queueItem.retryCount,
        queueItem.maxRetries,
        queueItem.createdAt.toISOString(),
        queueItem.updatedAt.toISOString(),
      ],
    );

    this.syncQueue.set(queueItem.id, queueItem);
  }

  /**
   * Mark sync item as synced
   */
  async markSynced(queueId: string, serverId?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `
      UPDATE sync_queue SET status = ?, updatedAt = ? WHERE id = ?
      `,
      ['COMPLETED', new Date().toISOString(), queueId],
    );

    await this.db.runAsync(
      `
      UPDATE offline_records SET status = ?, serverId = ?, updatedAt = ? WHERE id = ?
      `,
      ['SYNCED', serverId || null, new Date().toISOString(), queueId.replace('queue:', '')],
    );

    this.syncQueue.delete(queueId);
  }

  /**
   * Mark sync item as failed
   */
  async markSyncFailed(
    queueId: string,
    error: Error,
    shouldRetry: boolean = true,
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const nextRetryAt = shouldRetry ? new Date(Date.now() + 5000) : null;

    await this.db.runAsync(
      `
      UPDATE sync_queue
      SET status = ?, retryCount = retryCount + 1, lastAttempt = ?, nextRetryAt = ?, updatedAt = ?
      WHERE id = ?
      `,
      [
        shouldRetry ? 'PENDING' : 'FAILED',
        new Date().toISOString(),
        nextRetryAt?.toISOString() || null,
        new Date().toISOString(),
        queueId,
      ],
    );

    await this.db.runAsync(
      `
      UPDATE offline_records SET errorMessage = ? WHERE id = ?
      `,
      [error.message, queueId.replace('queue:', '')],
    );
  }

  /**
   * Cache data locally
   */
  async cacheData(key: string, data: any, entityType?: string, ttl?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const expiresAt = ttl ? new Date(Date.now() + ttl) : null;

    await this.db.runAsync(
      `
      INSERT OR REPLACE INTO cached_data
      (key, entityType, data, createdAt, expiresAt, ttl)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        key,
        entityType || null,
        JSON.stringify(data),
        new Date().toISOString(),
        expiresAt?.toISOString() || null,
        ttl || null,
      ],
    );
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      `
      SELECT * FROM cached_data
      WHERE key = ? AND (expiresAt IS NULL OR expiresAt > ?)
      `,
      [key, new Date().toISOString()],
    );

    if (result) {
      return JSON.parse((result as any).data);
    }

    return null;
  }

  /**
   * Get offline state
   */
  async getOfflineState(): Promise<OfflineState> {
    if (!this.db) throw new Error('Database not initialized');

    const pendingItems = await this.db.getAllAsync(
      `
      SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDING'
      `,
    );

    const failedItems = await this.db.getAllAsync(
      `
      SELECT COUNT(*) as count FROM sync_queue WHERE status = 'FAILED'
      `,
    );

    const conflictItems = await this.db.getAllAsync(
      `
      SELECT COUNT(*) as count FROM conflicts WHERE resolution IS NULL
      `,
    );

    return {
      isOnline: false, // Would check network connectivity
      pendingSyncItems: Array.from(this.syncQueue.values()),
      failedSyncItems: [],
      conflicts: Array.from(this.conflictStore.values()),
      cachedData: new Map(),
      syncStatus: {
        isSyncing: false,
        pendingCount: (pendingItems[0] as any)?.count || 0,
        failedCount: (failedItems[0] as any)?.count || 0,
        conflictCount: (conflictItems[0] as any)?.count || 0,
        syncProgress: 0,
      },
    };
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      DELETE FROM offline_records;
      DELETE FROM sync_queue;
      DELETE FROM conflicts;
      DELETE FROM cached_data;
    `);

    this.syncQueue.clear();
    this.conflictStore.clear();
  }

  /**
   * Store conflict
   */
  async storeConflict(conflict: ConflictResolution): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `
      INSERT INTO conflicts
      (id, recordId, entityType, entityId, localVersion, serverVersion, conflictType, resolvedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        conflict.recordId,
        conflict.recordId,
        conflict.entityType,
        conflict.entityId,
        JSON.stringify(conflict.localVersion),
        JSON.stringify(conflict.serverVersion),
        conflict.conflictType,
        conflict.resolvedAt.toISOString(),
      ],
    );

    this.conflictStore.set(conflict.recordId, conflict);
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    recordId: string,
    resolution: 'LOCAL_WIN' | 'SERVER_WIN' | 'MERGE',
    mergedData?: any,
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `
      UPDATE conflicts SET resolution = ?, mergedData = ? WHERE recordId = ?
      `,
      [resolution, mergedData ? JSON.stringify(mergedData) : null, recordId],
    );

    const conflict = this.conflictStore.get(recordId);
    if (conflict) {
      conflict.resolution = resolution;
      conflict.mergedData = mergedData;
    }
  }

  /**
   * Private helper to hash data for conflict detection
   */
  private async hashData(data: any): Promise<string> {
    const json = JSON.stringify(data);
    const digest = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      json,
    );
    return digest;
  }

  /**
   * Load sync queue from persistent storage
   */
  private async loadQueueFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        const items = JSON.parse(stored) as SyncQueueItem[];
        items.forEach((item) => this.syncQueue.set(item.id, item));
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  /**
   * Save sync queue to persistent storage
   */
  async persistSyncQueue(): Promise<void> {
    try {
      const items = Array.from(this.syncQueue.values());
      await AsyncStorage.setItem('sync_queue', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to persist sync queue:', error);
    }
  }
}

// Singleton instance
export const offlineStorageService = new OfflineStorageService();
