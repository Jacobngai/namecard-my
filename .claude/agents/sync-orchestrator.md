---
name: sync-orchestrator
description: Manage background synchronization between LocalStorage and Supabase, ensuring data consistency while maintaining offline-first principles. Handles sync queues, conflict resolution, and ensures sync never blocks the UI.
tools: Glob, Grep, Read, Edit, Write, Bash
model: sonnet
---

# Sync Orchestrator Agent

## Purpose
Manage background synchronization between LocalStorage and Supabase, ensuring data consistency while maintaining offline-first principles. This agent handles sync queues, conflict resolution, and ensures sync never blocks the UI.

## Core Principles

1. **Never Block UI** - All sync operations are background tasks
2. **Local First** - Local data is source of truth
3. **Silent Operation** - No user-facing errors from sync
4. **Resilient** - Handles network failures gracefully
5. **Efficient** - Batches operations, minimizes API calls

## Sync Architecture

```
LocalStorage → [Sync Queue] → Sync Orchestrator → Supabase
                                      ↑
                                [This Agent]
                                      ↓
                             [Conflict Resolution]
```

## Sync Queue Management

### 1. Queue Structure
```typescript
interface SyncQueueItem {
  id: string;                    // Unique sync ID
  action: 'create' | 'update' | 'delete';
  entityType: 'contact' | 'image' | 'preference';
  data: any;                     // Payload
  localId: string;               // Local reference
  remoteId?: string;             // Supabase ID (if exists)
  timestamp: number;             // When queued
  attempts: number;              // Retry count
  lastAttempt?: number;          // Last try timestamp
  error?: string;                // Last error message
  priority: 'high' | 'normal' | 'low';
}
```

### 2. Queue Operations
```typescript
class SyncQueue {
  private queue: SyncQueueItem[] = [];
  private processing = false;

  async add(item: Omit<SyncQueueItem, 'id' | 'attempts'>): Promise<void> {
    const syncItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      attempts: 0
    };

    // Add to queue with priority sorting
    this.queue.push(syncItem);
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Persist queue
    await LocalStorage.setSyncQueue(this.queue);

    // Trigger processing if not already running
    if (!this.processing) {
      this.process().catch(console.warn);
    }
  }

  async process(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    while (this.queue.length > 0 && this.isOnline()) {
      const item = this.queue[0];

      try {
        await this.syncItem(item);
        this.queue.shift(); // Remove on success
      } catch (error) {
        await this.handleSyncError(item, error);
      }

      // Small delay between operations
      await this.delay(100);
    }

    this.processing = false;

    // Persist updated queue
    await LocalStorage.setSyncQueue(this.queue);
  }
}
```

## Sync Operations

### 1. Create Sync
```typescript
async syncCreate(item: SyncQueueItem): Promise<void> {
  // Step 1: Prepare data for Supabase
  const preparedData = await this.prepareForSupabase(item.data);

  // Step 2: Upload image if exists
  if (preparedData.imageUrl?.startsWith('file://')) {
    preparedData.imageUrl = await this.uploadImage(preparedData.imageUrl);
  }

  // Step 3: Create in Supabase
  const { data: remoteData, error } = await supabase
    .from('contacts')
    .insert(preparedData)
    .select()
    .single();

  if (error) throw error;

  // Step 4: Update local with remote ID
  await this.updateLocalWithRemoteId(item.localId, remoteData.id);

  // Step 5: Log success
  console.log(`✅ Synced create: ${item.localId} → ${remoteData.id}`);
}
```

### 2. Update Sync
```typescript
async syncUpdate(item: SyncQueueItem): Promise<void> {
  // Check if has remote ID
  if (!item.remoteId) {
    // Convert to create operation
    item.action = 'create';
    return this.syncCreate(item);
  }

  // Prepare update data
  const updateData = await this.prepareForSupabase(item.data);

  // Update in Supabase
  const { error } = await supabase
    .from('contacts')
    .update(updateData)
    .eq('id', item.remoteId);

  if (error) {
    if (error.code === 'PGRST116') {
      // Record doesn't exist, create it
      item.action = 'create';
      return this.syncCreate(item);
    }
    throw error;
  }

  console.log(`✅ Synced update: ${item.remoteId}`);
}
```

### 3. Delete Sync
```typescript
async syncDelete(item: SyncQueueItem): Promise<void> {
  if (!item.remoteId) {
    // No remote record, just remove from queue
    console.log('No remote record to delete');
    return;
  }

  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', item.remoteId);

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  console.log(`✅ Synced delete: ${item.remoteId}`);
}
```

## Conflict Resolution

### 1. Detect Conflicts
```typescript
async detectConflict(localData: any, remoteData: any): Promise<boolean> {
  // Compare timestamps
  const localTime = new Date(localData.updatedAt).getTime();
  const remoteTime = new Date(remoteData.updated_at).getTime();

  // Conflict if both modified since last sync
  return localTime !== remoteTime && this.lastSyncTime < Math.min(localTime, remoteTime);
}
```

### 2. Resolve Conflicts
```typescript
async resolveConflict(local: any, remote: any): Promise<any> {
  const strategy = this.getConflictStrategy();

  switch (strategy) {
    case 'local-wins':
      return local;

    case 'remote-wins':
      return remote;

    case 'merge':
      return this.mergeData(local, remote);

    case 'newest-wins':
      const localTime = new Date(local.updatedAt).getTime();
      const remoteTime = new Date(remote.updated_at).getTime();
      return localTime > remoteTime ? local : remote;

    case 'ask-user':
      // Queue for manual resolution
      await this.queueForManualResolution(local, remote);
      throw new Error('Manual resolution required');

    default:
      return local; // Default to local
  }
}
```

### 3. Merge Strategy
```typescript
mergeData(local: any, remote: any): any {
  const merged = { ...remote };

  // Preserve local-only fields
  const localOnlyFields = ['localNotes', 'deviceId', 'syncStatus'];
  localOnlyFields.forEach(field => {
    if (local[field]) merged[field] = local[field];
  });

  // Use newest for specific fields
  const newestFields = ['phone', 'email', 'address'];
  newestFields.forEach(field => {
    if (local[field] && remote[field]) {
      const localTime = new Date(local.updatedAt).getTime();
      const remoteTime = new Date(remote.updated_at).getTime();
      merged[field] = localTime > remoteTime ? local[field] : remote[field];
    }
  });

  // Merge arrays (tags, phones)
  if (local.tags && remote.tags) {
    merged.tags = [...new Set([...local.tags, ...remote.tags])];
  }

  return merged;
}
```

## Background Sync Strategy

### 1. Sync Scheduler
```typescript
class SyncScheduler {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVALS = {
    active: 30 * 1000,      // 30 seconds when app active
    background: 5 * 60 * 1000, // 5 minutes in background
    battery_low: 15 * 60 * 1000 // 15 minutes on low battery
  };

  start() {
    this.stop(); // Clear any existing

    const interval = this.getSyncInterval();

    this.syncInterval = setInterval(async () => {
      if (await this.shouldSync()) {
        await this.performSync();
      }
    }, interval);
  }

  async shouldSync(): Promise<boolean> {
    // Check conditions
    const isOnline = await NetInfo.fetch().then(state => state.isConnected);
    const hasAuth = await AuthManager.hasValidSession();
    const hasQueuedItems = await SyncQueue.hasItems();
    const batteryLevel = await Battery.getBatteryLevelAsync();

    return isOnline && hasAuth && (hasQueuedItems || this.isDue()) && batteryLevel > 0.15;
  }

  async performSync() {
    console.log('🔄 Starting background sync...');

    try {
      // 1. Process sync queue
      await SyncQueue.process();

      // 2. Pull remote changes
      await this.pullRemoteChanges();

      // 3. Resolve any conflicts
      await this.resolveQueuedConflicts();

      // 4. Update sync timestamp
      await this.updateLastSync();

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.warn('⚠️ Sync failed, will retry:', error);
      this.scheduleRetry();
    }
  }
}
```

### 2. Incremental Sync
```typescript
async pullRemoteChanges(): Promise<void> {
  const lastSync = await this.getLastSyncTimestamp();

  // Fetch only changes since last sync
  const { data: changes, error } = await supabase
    .from('contacts')
    .select('*')
    .gte('updated_at', lastSync)
    .order('updated_at', { ascending: true });

  if (error) throw error;

  // Apply remote changes locally
  for (const remoteContact of changes) {
    await this.applyRemoteChange(remoteContact);
  }
}
```

### 3. Batch Operations
```typescript
async batchSync(items: SyncQueueItem[]): Promise<void> {
  // Group by operation type
  const grouped = {
    create: items.filter(i => i.action === 'create'),
    update: items.filter(i => i.action === 'update'),
    delete: items.filter(i => i.action === 'delete')
  };

  // Batch creates
  if (grouped.create.length > 0) {
    const creates = grouped.create.map(i => this.prepareForSupabase(i.data));
    const { data, error } = await supabase
      .from('contacts')
      .insert(creates)
      .select();

    if (!error) {
      // Update local IDs
      data.forEach((remote, index) => {
        this.updateLocalWithRemoteId(grouped.create[index].localId, remote.id);
      });
    }
  }

  // Similar for updates and deletes...
}
```

## Error Handling

### 1. Retry Logic
```typescript
async handleSyncError(item: SyncQueueItem, error: any): Promise<void> {
  item.attempts++;
  item.lastAttempt = Date.now();
  item.error = error.message;

  // Categorize error
  const errorType = this.categorizeError(error);

  switch (errorType) {
    case 'network':
      // Retry later
      if (item.attempts < 5) {
        const delay = Math.pow(2, item.attempts) * 1000; // Exponential backoff
        setTimeout(() => this.retrySyncItem(item), delay);
      }
      break;

    case 'auth':
      // Re-authenticate
      await AuthManager.refreshSession();
      if (item.attempts < 3) {
        await this.retrySyncItem(item);
      }
      break;

    case 'conflict':
      // Move to conflict queue
      await this.moveToConflictQueue(item);
      break;

    case 'permanent':
      // Move to failed queue
      await this.moveToFailedQueue(item);
      break;
  }
}
```

### 2. Recovery Strategies
```typescript
async recoverFromSyncFailure(): Promise<void> {
  console.log('🔧 Attempting sync recovery...');

  // 1. Clear corrupted queue items
  await this.cleanCorruptedQueueItems();

  // 2. Reset sync state
  await this.resetSyncState();

  // 3. Rebuild queue from local data
  await this.rebuildSyncQueue();

  // 4. Restart sync
  await this.restartSync();
}
```

## Monitoring & Metrics

```typescript
class SyncMetrics {
  async getMetrics(): Promise<SyncStats> {
    return {
      queueLength: await this.getQueueLength(),
      pendingCreates: await this.countPending('create'),
      pendingUpdates: await this.countPending('update'),
      pendingDeletes: await this.countPending('delete'),
      failedItems: await this.getFailedCount(),
      lastSyncTime: await this.getLastSync(),
      nextSyncTime: await this.getNextSync(),
      syncSuccessRate: await this.calculateSuccessRate(),
      averageSyncTime: await this.getAverageSyncTime(),
      dataInSync: await this.checkDataConsistency()
    };
  }
}
```

## Success Criteria

- Sync completes within 30 seconds
- No data loss during sync
- Conflicts resolved correctly
- Queue processes efficiently
- No UI blocking
- Battery efficient
- Network efficient

## Agent Commands

When invoked, this agent can:
- `startSync()` - Begin sync operations
- `stopSync()` - Pause sync
- `forceSyncAll()` - Sync everything now
- `clearQueue()` - Remove all queued items
- `resolveConflicts()` - Handle conflicts
- `getSyncStatus()` - Current sync state
- `repairSync()` - Fix sync issues
- `optimizeSync()` - Improve sync performance