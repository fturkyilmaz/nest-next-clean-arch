# Offline-First Mobile Architecture

## Overview

This document describes the complete offline-first architecture implemented for the mobile application. It enables seamless operation without network connectivity, automatic synchronization when connectivity returns, and conflict resolution for concurrent changes.

## Architecture Principles

### 1. **Always Assume Disconnection**
- Local changes are persisted immediately to SQLite
- Network requests are optional, not required
- Users never see "Loading..." screens for local data

### 2. **Optimistic Updates**
- Changes are reflected in UI immediately
- Sync happens asynchronously in background
- Conflicts are resolved with configurable strategies

### 3. **Reliable Replication**
- Changes queued until server confirms receipt
- Automatic retry with exponential backoff
- Sync progress tracked and reported to UI

### 4. **Data Consistency**
- Three-way merge for conflicts
- Last-write-wins fallback for safety
- Server version always authoritative for tie-breaking

## System Components

### 1. Offline Storage Service

**Purpose**: Persist local changes and manage sync queue

**Location**: `apps/mobile/src/lib/offline/offline-storage.service.ts`

**Key Methods**:

```typescript
// Save a local change
await offlineStorageService.saveOfflineChange(
  'MEAL',
  'meal-123',
  { name: 'Lunch', calories: 500 },
  'UPDATE'
);

// Get all pending changes
const pending = await offlineStorageService.getPendingSyncItems();

// Mark as successfully synced
await offlineStorageService.markSynced(queueId, serverId);

// Store conflict for later resolution
await offlineStorageService.storeConflict(conflict);
```

**Database Schema**:

```sql
CREATE TABLE offline_records (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON
  operation TEXT NOT NULL, -- CREATE, UPDATE, DELETE
  status TEXT NOT NULL, -- PENDING, SYNCED, CONFLICT, FAILED
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  lastSyncAttempt INTEGER,
  syncAttempts INTEGER DEFAULT 0,
  errorMessage TEXT,
  serverId TEXT,
  hash TEXT, -- SHA-256 for conflict detection
  INDEX idx_status(status),
  INDEX idx_entity(entityType, entityId),
  INDEX idx_hash(hash)
);

CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  recordId TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  status TEXT NOT NULL, -- PENDING, SYNCED, FAILED
  priority INTEGER DEFAULT 0,
  retryCount INTEGER DEFAULT 0,
  maxRetries INTEGER DEFAULT 5,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  lastAttempt INTEGER,
  nextRetryAt INTEGER,
  INDEX idx_status(status),
  INDEX idx_priority(priority DESC),
  FOREIGN KEY(recordId) REFERENCES offline_records(id)
);

CREATE TABLE conflicts (
  id TEXT PRIMARY KEY,
  recordId TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  localVersion TEXT NOT NULL, -- JSON
  serverVersion TEXT NOT NULL, -- JSON
  conflictType TEXT NOT NULL,
  resolution TEXT,
  mergedData TEXT, -- JSON
  resolvedAt INTEGER,
  FOREIGN KEY(recordId) REFERENCES offline_records(id)
);

CREATE TABLE cached_data (
  key TEXT PRIMARY KEY,
  entityType TEXT,
  data TEXT NOT NULL, -- JSON
  createdAt INTEGER NOT NULL,
  expiresAt INTEGER,
  ttl INTEGER,
  INDEX idx_expires(expiresAt)
);
```

### 2. Offline Sync Service

**Purpose**: Orchestrate synchronization with server

**Location**: `apps/mobile/src/lib/offline/offline-sync.service.ts`

**Sync Algorithm**:

```typescript
// 1. Check network connectivity
if (!isOnline) return; // Skip sync

// 2. Pull server changes (with sync token)
const serverChanges = await pullServerChanges(lastSyncToken);

// 3. Push local changes in batches
for (const batch of createBatches(pendingItems, 10)) {
  const response = await pushLocalChanges(batch);
  updateSyncStatus(response.successful, response.failed);
}

// 4. Detect conflicts
const conflicts = await detectConflicts(clientChanges);

// 5. Resolve conflicts
for (const conflict of conflicts) {
  const resolution = applyResolutionStrategy(conflict);
  await resolveConflict(conflict, resolution);
}

// 6. Invalidate cache and update UI
await queryClient.invalidateQueries();
emit('SYNC_COMPLETE', { syncedCount, failedCount });
```

**Sync Events**:

```typescript
offlineSyncService.onSyncEvent((event) => {
  if (event.type === 'SYNC_START') {
    console.log('Sync beginning...');
  }
  if (event.type === 'SYNC_COMPLETE') {
    console.log(`Synced ${event.syncedCount} items`);
  }
  if (event.type === 'CONFLICT_DETECTED') {
    console.log('Conflict found:', event.conflict);
  }
  if (event.type === 'SYNC_FAILED') {
    console.error('Sync failed:', event.error);
  }
});
```

### 3. Offline Context Provider

**Purpose**: React integration and auto-sync management

**Location**: `apps/mobile/src/lib/offline/offline.context.tsx`

**Usage**:

```typescript
// Wrap entire app
<OfflineProvider autoSync={true} syncInterval={30000}>
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
</OfflineProvider>
```

**Available Hooks**:

```typescript
// 1. useOffline() - Access offline context
const {
  isOnline,
  syncStatus,
  triggerSync,
  hasOfflineChanges,
  toggleOfflineMode,
} = useOffline();

// 2. useOfflineQuery() - Fetch with offline fallback
const { data, isLoading, error, isOnline } = useOfflineQuery(
  ['meals', userId],
  () => apiClient.get(`/api/meals?userId=${userId}`),
  {
    cacheTTL: 3600000, // 1 hour
    fallbackData: [],
  }
);

// 3. useOfflineMutation() - Mutation with offline queueing
const { mutate, isPending, error } = useOfflineMutation(
  (meal) => apiClient.post('/api/meals', meal),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['meals']);
    },
  }
);
```

### 4. Offline Indicator Components

**Purpose**: Visual feedback about offline status and sync progress

**Location**: `apps/mobile/src/components/offline/OfflineIndicator.tsx`

**Components**:

```typescript
// Simple badge showing offline status
<OfflineIndicator position="top" variant="badge" />

// Banner with detailed offline message
<OfflineIndicator position="top" variant="banner" />

// Sync status with progress
<SyncStatus showDetails={true} />

// Conflict resolution dialog
<ConflictDialog
  visible={showConflict}
  conflict={currentConflict}
  onResolve={(resolution) => {
    // LOCAL_WIN | SERVER_WIN | MERGE
  }}
  onCancel={() => setShowConflict(false)}
/>
```

## Conflict Resolution Strategies

### 1. **SERVER_WIN** (Default, Safest)

**When**: Always safe, especially for critical data
**Behavior**: Discard local changes, use server version
**Use Case**: When server is source of truth

```typescript
// Configuration
const syncOptions = {
  conflictResolution: 'SERVER_WIN',
};

// Example: User changes meal offline, then online changes from web
// Result: Offline mobile change discarded, server version used
```

### 2. **LOCAL_WIN** (Aggressive)

**When**: Mobile user is primary editor
**Behavior**: Keep local changes, override server version
**Use Case**: Device-specific or temporary data

```typescript
// Configuration
const syncOptions = {
  conflictResolution: 'LOCAL_WIN',
};

// Example: User updates local notes offline, server has older version
// Result: Mobile version kept, server updated to match
```

### 3. **MERGE** (Smart)

**When**: Combining non-conflicting changes
**Behavior**: Three-way merge combining both versions
**Algorithm**: Keeps local timestamps, merges fields intelligently
**Use Case**: Complex objects with multiple fields

```typescript
// Configuration
const syncOptions = {
  conflictResolution: 'MERGE',
};

// Example: User updates 'name' offline, server updated 'calories'
// Result: Both changes combined in final version
```

### 4. **MANUAL** (User Input)

**When**: Critical decisions needed
**Behavior**: Show conflict dialog, let user choose
**Use Case**: Important data where users must decide

```typescript
// Application handles manually
if (conflict.type === 'CRITICAL') {
  // Show ConflictDialog component
  // User selects LOCAL_WIN, SERVER_WIN, or MERGE
  // Application applies decision
}
```

## Implementation Patterns

### Pattern 1: Simple Offline Query

```typescript
function MealsList() {
  const { data: meals, isLoading } = useOfflineQuery(
    ['meals', userId],
    async () => {
      const response = await apiClient.get(`/api/meals?userId=${userId}`);
      return response.data;
    },
    { cacheTTL: 3600000 } // Cache 1 hour
  );

  if (isLoading) return <Spinner />;

  return (
    <ScrollView>
      {meals?.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </ScrollView>
  );
}
```

### Pattern 2: Offline Mutation with Optimistic Update

```typescript
function MealForm() {
  const { mutate: createMeal, isPending } = useOfflineMutation(
    async (meal) => {
      const response = await apiClient.post('/api/meals', meal);
      return response.data;
    },
    {
      onSuccess: (newMeal) => {
        // Data already in cache from optimistic update
        toast.show('Meal created');
      },
    }
  );

  const handleSubmit = (formData) => {
    createMeal(formData);
  };

  return <MealFormComponent onSubmit={handleSubmit} isLoading={isPending} />;
}
```

### Pattern 3: Sync Status Display

```typescript
function AppHeader() {
  const { isOnline, syncStatus, triggerSync } = useOffline();

  return (
    <Header>
      {!isOnline && <OfflineIndicator variant="badge" />}
      
      {syncStatus.isSyncing && (
        <SyncStatus showDetails={true} />
      )}

      {syncStatus.pendingCount > 0 && !syncStatus.isSyncing && (
        <Pressable onPress={() => triggerSync()}>
          <Text>{syncStatus.pendingCount} pending</Text>
        </Pressable>
      )}
    </Header>
  );
}
```

### Pattern 4: Offline Mode Detection

```typescript
function ImportantAction() {
  const { isOnline } = useOffline();

  const handleAction = async () => {
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'This action requires internet. Try again when online.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Proceed with action
  };

  return <Button onPress={handleAction} title="Process Payment" />;
}
```

## Backend API Endpoints

### 1. Pull Changes

**Endpoint**: `GET /api/replication/pull?syncToken=<timestamp>`

**Response**:

```json
{
  "syncToken": "1704067200000",
  "serverChanges": [
    {
      "entityType": "MEAL",
      "entityId": "meal-123",
      "data": { "name": "Lunch", "calories": 500 },
      "serverVersion": 1,
      "lastModified": "2024-01-01T12:00:00Z"
    }
  ],
  "conflicts": [],
  "deletedIds": ["meal-456"]
}
```

### 2. Push Changes

**Endpoint**: `POST /api/replication/push`

**Request**:

```json
{
  "changes": [
    {
      "id": "local-123",
      "entityType": "MEAL",
      "entityId": "meal-123",
      "operation": "UPDATE",
      "data": { "name": "Lunch Updated" }
    }
  ],
  "deletions": [
    {
      "entityType": "MEAL",
      "entityId": "meal-456"
    }
  ]
}
```

**Response**:

```json
{
  "createdIds": {
    "local-123": "meal-789"
  }
}
```

### 3. Detect Conflicts

**Endpoint**: `POST /api/replication/conflicts/detect`

**Response**:

```json
{
  "conflicts": [
    {
      "recordId": "MEAL:meal-123",
      "entityType": "MEAL",
      "entityId": "meal-123",
      "localVersion": { "name": "Lunch" },
      "serverVersion": { "name": "Breakfast" },
      "conflictType": "VERSION_MISMATCH"
    }
  ]
}
```

## Performance Optimization

### 1. Batch Processing

```typescript
// Default: 10 items per batch, 3 concurrent
const syncOptions = {
  batchSize: 10,
  maxConcurrent: 3,
};

// Adjust for different network conditions
// Slow network: smaller batches (5-10)
// Fast network: larger batches (20-50)
```

### 2. Retry Strategy

```typescript
// Exponential backoff: 1s, 2s, 4s, 8s, 16s
const syncOptions = {
  maxRetries: 5,
  retryInterval: 1000, // 1 second
  // Next retry: 1s, 2s, 4s, 8s, 16s (5 attempts total)
};
```

### 3. Cache Management

```typescript
// Automatic cache expiration
await offlineStorageService.cacheData(
  'meals-user-123',
  mealsData,
  'MEAL',
  3600000 // 1 hour TTL
);

// Query falls back to cache if offline
const { data } = useOfflineQuery(
  ['meals'],
  fetchMeals,
  { cacheTTL: 3600000 }
);
```

## Testing Offline Functionality

### 1. Simulating Offline Mode

```typescript
const { toggleOfflineMode } = useOffline();

// In development
<Button onPress={() => toggleOfflineMode(true)} title="Go Offline" />
```

### 2. Testing Sync

```typescript
// Manually trigger sync
const { triggerSync, syncStatus } = useOffline();

await triggerSync();
console.log(syncStatus); // { isSyncing, pendingCount, ... }
```

### 3. Simulating Conflicts

```typescript
// Via UI
const [conflict, setConflict] = useState<ConflictResolution | null>(null);

// Show dialog when detected
<ConflictDialog
  visible={!!conflict}
  conflict={conflict}
  onResolve={(resolution) => {
    // Apply resolution
    setConflict(null);
  }}
/>
```

## Error Handling

### 1. Sync Failures

```typescript
offlineSyncService.onSyncEvent((event) => {
  if (event.type === 'SYNC_FAILED') {
    // Show error banner
    showError(event.error.message);
    
    // Automatically retry after delay
    setTimeout(() => triggerSync(), 5000);
  }
});
```

### 2. Storage Quota

```typescript
try {
  await offlineStorageService.saveOfflineChange(...);
} catch (error) {
  if (error.code === 'QuotaExceeded') {
    // Clear old cached data
    await offlineStorageService.clearOfflineData();
    
    // Notify user
    showWarning('Storage full. Clearing cache.');
  }
}
```

### 3. Network Timeout

```typescript
// Configure timeouts in sync options
const syncOptions = {
  requestTimeout: 30000, // 30 seconds
  maxRetries: 5,
};

// Handle timeout
offlineSyncService.onSyncEvent((event) => {
  if (event.error?.code === 'TIMEOUT') {
    // Show message: "Slow connection. Will retry..."
  }
});
```

## Compliance & Audit

### Data Retention

```typescript
// Soft delete with timestamp
await offlineStorageService.markOfflineRecordDeleted(recordId);

// Audit trail preserved
const deleteAudit = await auditLog.findByEntity('MEAL', mealId);
// { action: 'DELETE', timestamp, userId, reason }
```

### GDPR Compliance

```typescript
// Right to be forgotten
async function deleteUserData(userId: string) {
  // Delete offline records
  await offlineStorageService.deleteUserData(userId);
  
  // Server handles permanent deletion
  await apiClient.post('/api/users/delete', { userId });
  
  // Audit trail maintained with redaction
  await auditLog.redact(userId);
}
```

## Monitoring & Debugging

### Enable Logging

```typescript
// In development
const offlineSync = new OfflineSyncService({
  debug: true, // Logs all sync events
  logNetwork: true, // Logs network requests
});

// Console output
// [OfflineSync] SYNC_START
// [OfflineSync] Pulling changes...
// [OfflineSync] Pushing 5 items in batch 1/2...
// [OfflineSync] CONFLICT_DETECTED: MEAL:meal-123
// [OfflineSync] SYNC_COMPLETE: 23 synced, 2 conflicts
```

### Sync Status Dashboard

```typescript
function SyncDebugScreen() {
  const { syncStatus } = useOffline();
  const [metrics, setMetrics] = useState<SyncMetrics>();

  return (
    <ScrollView>
      <Text>Current Status:</Text>
      <Text>Online: {syncStatus.isSyncing ? 'Yes' : 'No'}</Text>
      <Text>Pending: {syncStatus.pendingCount}</Text>
      <Text>Failed: {syncStatus.failedCount}</Text>
      <Text>Progress: {syncStatus.syncProgress}%</Text>
      
      <Text>Metrics:</Text>
      <Text>Total Synced: {metrics?.totalSynced}</Text>
      <Text>Last Sync: {metrics?.lastSyncTime}</Text>
      <Text>Avg Sync Time: {metrics?.avgSyncTime}ms</Text>
    </ScrollView>
  );
}
```

## Troubleshooting

### Issue: Changes not syncing

1. Check `useOffline()` hook - is `isOnline` true?
2. Verify network connectivity
3. Check for failed items: `syncStatus.failedCount`
4. Check sync queue size: `syncStatus.pendingCount`
5. Review error messages in sync events

### Issue: Stale data after sync

1. Ensure React Query invalidation: `queryClient.invalidateQueries()`
2. Check cache TTL - may need to clear manual cache
3. Verify server is returning latest data
4. Check for conflicts preventing sync

### Issue: Excessive battery/data usage

1. Reduce sync frequency: `syncInterval: 60000` (60 seconds)
2. Reduce batch size: `batchSize: 5` (smaller batches)
3. Enable selective sync: only critical entities
4. Use compression for large payloads

## Best Practices

1. **Always use `useOfflineQuery` for reads** - Automatic fallback to cache
2. **Always use `useOfflineMutation` for writes** - Automatic queueing offline
3. **Show sync status** - Users should know what's pending/syncing
4. **Handle conflicts explicitly** - Don't silently discard data
5. **Test offline thoroughly** - Use offline mode during dev
6. **Monitor sync metrics** - Track success rates, timing
7. **Implement retry strategy** - Exponential backoff prevents server overload
8. **Clear old cache** - Prevent storage quota issues
9. **Validate locally** - Don't wait for server validation
10. **Document conflict strategy** - Make resolution choice explicit

## Migration from Online-Only

### Step 1: Add OfflineProvider

```typescript
// App.tsx
<OfflineProvider autoSync={true} syncInterval={30000}>
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
</OfflineProvider>
```

### Step 2: Replace queries with useOfflineQuery

```typescript
// Before
const { data } = useQuery(['meals'], () => fetchMeals());

// After
const { data } = useOfflineQuery(
  ['meals'],
  () => fetchMeals(),
  { cacheTTL: 3600000 }
);
```

### Step 3: Replace mutations with useOfflineMutation

```typescript
// Before
const { mutate } = useMutation((meal) => createMeal(meal));

// After
const { mutate } = useOfflineMutation(
  (meal) => createMeal(meal),
  { onSuccess: () => queryClient.invalidateQueries(['meals']) }
);
```

### Step 4: Add offline indicators

```typescript
<OfflineIndicator position="top" variant="badge" />
<SyncStatus showDetails={true} />
```

### Step 5: Test thoroughly

- Disable network and perform operations
- Re-enable network and verify sync
- Introduce conflicts and test resolution
- Monitor sync metrics in console

## Future Enhancements

1. **Selective Sync** - User chooses what to keep offline
2. **Bandwidth-Aware Batching** - Adjust batch size based on speed
3. **Compression** - Reduce payload size for large objects
4. **Encryption** - Encrypt sensitive data at rest
5. **Background Sync** - Continue syncing after app closed
6. **Differential Sync** - Only sync changed fields
7. **P2P Sync** - Sync between devices on local network
8. **Time Travel** - View history of changes
9. **Undo/Redo** - Revert synced changes
10. **AI Conflict Resolution** - Smart merge suggestions
