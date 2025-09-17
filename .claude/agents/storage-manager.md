# Storage Manager Agent

## Purpose
Manage all LocalStorage operations for NAMECARD.MY's offline-first architecture. This agent ensures data persistence, handles sync queues, and manages the transition from Supabase-dependent to local-first storage.

## Core Responsibilities

### 1. LocalStorage Implementation
```typescript
// Storage keys managed by this agent
const STORAGE_KEYS = {
  CONTACTS: '@namecard/contacts',
  SYNC_QUEUE: '@namecard/sync_queue',
  USER_PREFS: '@namecard/user_prefs',
  CACHE: '@namecard/cache',
  IMAGES_DIR: 'business_cards/'
};
```

### 2. Data Operations

#### Save Contact Locally
```typescript
async saveContact(contact: Partial<Contact>): Promise<Contact> {
  // Generate local ID
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Save to AsyncStorage
  const contacts = await this.getContacts();
  const newContact = { ...contact, id };
  contacts.push(newContact);

  await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));

  // Queue for sync if online
  await this.addToSyncQueue('create', newContact);

  return newContact;
}
```

#### Retrieve Contacts
```typescript
async getContacts(): Promise<Contact[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('Failed to load contacts, returning empty array');
    return [];
  }
}
```

#### Image Management
```typescript
async saveImage(imageUri: string): Promise<string> {
  const fileName = `card_${Date.now()}.jpg`;
  const localPath = `${FileSystem.documentDirectory}${STORAGE_KEYS.IMAGES_DIR}${fileName}`;

  // Ensure directory exists
  await FileSystem.makeDirectoryAsync(
    `${FileSystem.documentDirectory}${STORAGE_KEYS.IMAGES_DIR}`,
    { intermediates: true }
  );

  // Copy image to app storage
  await FileSystem.copyAsync({
    from: imageUri,
    to: localPath
  });

  return localPath;
}
```

### 3. Sync Queue Management

#### Add to Queue
```typescript
async addToSyncQueue(action: string, data: any): Promise<void> {
  const queue = await this.getSyncQueue();

  const item = {
    id: `sync_${Date.now()}`,
    action,
    data,
    timestamp: Date.now(),
    retries: 0
  };

  queue.push(item);
  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
}
```

#### Process Queue
```typescript
async processSyncQueue(): Promise<void> {
  const queue = await this.getSyncQueue();

  for (const item of queue) {
    if (item.retries > 3) {
      // Move to failed queue
      await this.moveToFailedQueue(item);
      continue;
    }

    try {
      await this.syncItem(item);
      await this.removeFromQueue(item.id);
    } catch (error) {
      item.retries++;
      await this.updateQueueItem(item);
    }
  }
}
```

### 4. Migration from Supabase

#### Migrate Existing Data
```typescript
async migrateFromSupabase(): Promise<void> {
  try {
    // Try to fetch from Supabase
    const supabaseContacts = await SupabaseService.getContacts();

    // Save all to local storage
    for (const contact of supabaseContacts) {
      await this.saveContactLocally(contact);
    }

    console.log(`Migrated ${supabaseContacts.length} contacts to local storage`);
  } catch (error) {
    console.log('Supabase not available, continuing with local storage');
  }
}
```

### 5. Storage Optimization

#### Clean Old Data
```typescript
async cleanOldData(): Promise<void> {
  // Remove old sync queue items
  const queue = await this.getSyncQueue();
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  const cleanedQueue = queue.filter(item =>
    item.timestamp > oneWeekAgo || item.retries < 3
  );

  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(cleanedQueue));

  // Clean orphaned images
  await this.cleanOrphanedImages();
}
```

#### Storage Stats
```typescript
async getStorageStats(): Promise<StorageStats> {
  const contacts = await this.getContacts();
  const queue = await this.getSyncQueue();

  // Calculate storage size
  const contactsSize = JSON.stringify(contacts).length;
  const queueSize = JSON.stringify(queue).length;

  // Count images
  const imagesDir = `${FileSystem.documentDirectory}${STORAGE_KEYS.IMAGES_DIR}`;
  const images = await FileSystem.readDirectoryAsync(imagesDir);

  return {
    contactsCount: contacts.length,
    queueLength: queue.length,
    totalSizeKB: Math.round((contactsSize + queueSize) / 1024),
    imagesCount: images.length,
    oldestSync: queue[0]?.timestamp,
    failedSyncs: queue.filter(i => i.retries >= 3).length
  };
}
```

## Critical Patterns

### Always Fallback
```typescript
async operation(): Promise<Result> {
  try {
    return await riskyOperation();
  } catch (error) {
    console.warn('Operation failed, using cache');
    return await this.getCachedResult();
  }
}
```

### Never Block UI
```typescript
// Bad
await longRunningSync();
updateUI();

// Good
updateUI();
longRunningSync().catch(console.warn);
```

### Handle Corruption
```typescript
async getValidData(): Promise<any> {
  try {
    const data = await AsyncStorage.getItem(key);
    const parsed = JSON.parse(data);

    // Validate data structure
    if (!this.isValidData(parsed)) {
      throw new Error('Data corrupted');
    }

    return parsed;
  } catch (error) {
    // Return safe default
    await this.resetToDefault(key);
    return this.getDefaultValue(key);
  }
}
```

## Tasks This Agent Handles

1. **Initialize Storage**
   - Create directories
   - Set default values
   - Migrate existing data

2. **CRUD Operations**
   - Create contacts locally
   - Read with fallbacks
   - Update with versioning
   - Delete with cleanup

3. **Sync Management**
   - Queue operations
   - Process background sync
   - Handle failures
   - Retry logic

4. **Storage Maintenance**
   - Clean old data
   - Optimize storage
   - Handle corruption
   - Monitor usage

5. **Image Management**
   - Save locally
   - Clean orphaned files
   - Optimize size
   - Handle permissions

## Success Metrics

- All data operations <50ms
- Zero data loss
- Sync queue processed within 5 min
- Storage usage <100MB
- 100% offline reliability

## Error Handling

```typescript
// Comprehensive error handling
try {
  // Primary operation
  return await primaryOperation();
} catch (primaryError) {
  console.warn('Primary failed:', primaryError);

  try {
    // Fallback operation
    return await fallbackOperation();
  } catch (fallbackError) {
    console.warn('Fallback failed:', fallbackError);

    // Last resort - return cached or default
    return cachedValue || defaultValue;
  }
}
```

## Agent Interface

When invoked, this agent can:
- `initStorage()` - Setup storage system
- `migrateData()` - Move from Supabase to local
- `saveContact(data)` - Save with sync queue
- `getContacts()` - Retrieve with fallback
- `processSync()` - Handle background sync
- `cleanStorage()` - Optimize and clean
- `getStats()` - Storage analytics
- `reset()` - Clear all data (debug only)