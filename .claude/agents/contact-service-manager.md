# Contact Service Manager Agent

## Purpose
Manage the unified ContactService layer that bridges components with storage, ensuring offline-first operation and optional Supabase synchronization.

## Architecture Overview

```
Components → ContactService → LocalStorage → [SyncQueue] → Supabase
                    ↑
              [This Agent]
```

## Core Service Implementation

### 1. Contact CRUD Operations

#### Create Contact (Offline-First)
```typescript
async createContact(contactData: Partial<Contact>): Promise<Contact> {
  // Step 1: Process image locally
  if (contactData.imageUrl && contactData.imageUrl.startsWith('file://')) {
    contactData.imageUrl = await LocalStorage.saveImage(contactData.imageUrl);
  }

  // Step 2: Save locally FIRST (always succeeds)
  const localContact = await LocalStorage.saveContact(contactData);

  // Step 3: Queue for sync (non-blocking)
  if (this.isOnline && this.hasAuth) {
    this.queueForSync('create', localContact).catch(console.warn);
  }

  // Step 4: Update UI immediately
  this.notifyListeners('contact_created', localContact);

  return localContact;
}
```

#### Get Contacts (With Smart Loading)
```typescript
async getContacts(): Promise<Contact[]> {
  // Step 1: Return local data immediately
  const localContacts = await LocalStorage.getContacts();

  // Step 2: Trigger background sync (non-blocking)
  if (this.shouldSync()) {
    this.syncInBackground().catch(console.warn);
  }

  // Step 3: Return local data (never wait for network)
  return localContacts;
}
```

#### Update Contact
```typescript
async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
  // Local update first
  const updated = await LocalStorage.updateContact(id, updates);

  // Queue sync if online
  if (this.isOnline && this.hasAuth) {
    this.queueForSync('update', updated).catch(console.warn);
  }

  // Notify listeners
  this.notifyListeners('contact_updated', updated);

  return updated;
}
```

#### Delete Contact
```typescript
async deleteContact(id: string): Promise<void> {
  // Delete locally first
  await LocalStorage.deleteContact(id);

  // Queue for sync
  if (this.isOnline && this.hasAuth) {
    this.queueForSync('delete', { id }).catch(console.warn);
  }

  // Notify listeners
  this.notifyListeners('contact_deleted', id);
}
```

### 2. Search & Filter

#### Smart Search
```typescript
async searchContacts(query: string): Promise<Contact[]> {
  // Always search locally (instant)
  const contacts = await LocalStorage.getContacts();

  const normalizedQuery = query.toLowerCase();

  return contacts.filter(contact =>
    contact.name?.toLowerCase().includes(normalizedQuery) ||
    contact.company?.toLowerCase().includes(normalizedQuery) ||
    contact.email?.toLowerCase().includes(normalizedQuery) ||
    contact.phone?.includes(query) ||
    contact.jobTitle?.toLowerCase().includes(normalizedQuery)
  );
}
```

#### Advanced Filtering
```typescript
async filterContacts(filters: FilterOptions): Promise<Contact[]> {
  const contacts = await LocalStorage.getContacts();

  return contacts.filter(contact => {
    if (filters.hasImage && !contact.imageUrl) return false;
    if (filters.hasEmail && !contact.email) return false;
    if (filters.hasPhone && !contact.phone) return false;
    if (filters.company && contact.company !== filters.company) return false;
    if (filters.addedAfter && new Date(contact.addedDate) < filters.addedAfter) return false;

    return true;
  });
}
```

### 3. Sync Management

#### Background Sync Orchestration
```typescript
async syncInBackground(): Promise<void> {
  // Don't block, just start sync
  setTimeout(async () => {
    try {
      await this.processSyncQueue();
      await this.pullRemoteChanges();
      await this.resolveConflicts();
    } catch (error) {
      console.log('Background sync failed, will retry:', error);
      this.scheduleRetry();
    }
  }, 1000);
}
```

#### Sync Queue Processing
```typescript
async processSyncQueue(): Promise<void> {
  if (!this.isOnline || !this.hasAuth) return;

  const queue = await LocalStorage.getSyncQueue();

  for (const item of queue) {
    try {
      switch (item.action) {
        case 'create':
          await this.syncCreate(item.data);
          break;
        case 'update':
          await this.syncUpdate(item.data);
          break;
        case 'delete':
          await this.syncDelete(item.data);
          break;
      }

      await LocalStorage.removeFromSyncQueue(item.id);
    } catch (error) {
      console.warn(`Sync failed for ${item.id}:`, error);
      await this.handleSyncError(item, error);
    }
  }
}
```

#### Conflict Resolution
```typescript
async resolveConflicts(localContact: Contact, remoteContact: Contact): Promise<Contact> {
  // Strategy: Last write wins with merge
  const localTime = new Date(localContact.updatedAt || 0).getTime();
  const remoteTime = new Date(remoteContact.updatedAt || 0).getTime();

  if (localTime > remoteTime) {
    // Local is newer
    return localContact;
  } else if (remoteTime > localTime) {
    // Remote is newer, but preserve local-only fields
    return {
      ...remoteContact,
      localNotes: localContact.localNotes,
      localTags: localContact.localTags
    };
  } else {
    // Same time, merge fields
    return this.mergeContacts(localContact, remoteContact);
  }
}
```

### 4. OCR Integration

#### Process Business Card
```typescript
async processBusinessCard(imageUri: string): Promise<Partial<Contact>> {
  try {
    // Try online OCR first if available
    if (this.isOnline && ENV.GOOGLE_VISION_API_KEY) {
      const ocrData = await GoogleVisionService.processBusinessCard(imageUri);
      return this.parseOCRData(ocrData);
    }
  } catch (error) {
    console.warn('Online OCR failed, using offline fallback');
  }

  // Offline fallback - basic extraction
  return {
    imageUrl: imageUri,
    addedDate: new Date().toISOString(),
    needsManualReview: true
  };
}
```

### 5. Export & Import

#### Export to Excel
```typescript
async exportToExcel(): Promise<string> {
  const contacts = await this.getContacts();

  const worksheet = XLSX.utils.json_to_sheet(contacts.map(c => ({
    Name: c.name,
    Company: c.company,
    'Job Title': c.jobTitle,
    Phone: c.phone,
    Email: c.email,
    Address: c.address,
    'Added Date': c.addedDate,
    'Last Contact': c.lastContact
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

  const filePath = `${FileSystem.documentDirectory}contacts_${Date.now()}.xlsx`;
  const excelData = XLSX.write(workbook, { type: 'base64' });

  await FileSystem.writeAsStringAsync(filePath, excelData, {
    encoding: FileSystem.EncodingType.Base64
  });

  return filePath;
}
```

#### Import from Excel
```typescript
async importFromExcel(filePath: string): Promise<number> {
  const data = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64
  });

  const workbook = XLSX.read(data, { type: 'base64' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const contacts = XLSX.utils.sheet_to_json(worksheet);

  let imported = 0;
  for (const contact of contacts) {
    await this.createContact({
      name: contact['Name'],
      company: contact['Company'],
      jobTitle: contact['Job Title'],
      phone: contact['Phone'],
      email: contact['Email'],
      address: contact['Address']
    });
    imported++;
  }

  return imported;
}
```

### 6. State Management

#### Event Listeners
```typescript
class ContactServiceEvents {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
}
```

#### Cache Management
```typescript
class ContactCache {
  private cache: Map<string, Contact> = new Map();
  private lastFetch: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async get(id: string): Promise<Contact | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    const contact = await LocalStorage.getContact(id);
    if (contact) {
      this.cache.set(id, contact);
    }

    return contact;
  }

  invalidate() {
    this.cache.clear();
    this.lastFetch = 0;
  }
}
```

## Service Configuration

```typescript
interface ContactServiceConfig {
  syncInterval: number;        // Default: 5 minutes
  maxRetries: number;         // Default: 3
  conflictStrategy: 'local' | 'remote' | 'merge'; // Default: 'merge'
  cacheEnabled: boolean;       // Default: true
  offlineFirst: boolean;      // Default: true (always!)
}
```

## Error Handling Strategy

```typescript
async safeOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn(errorMessage, error);

    // Try recovery
    try {
      await this.recover(error);
      return await operation();
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      return fallback;
    }
  }
}
```

## Performance Optimizations

1. **Lazy Loading**: Load contacts in batches
2. **Virtualization**: Only render visible items
3. **Debouncing**: Delay search queries
4. **Caching**: Memory cache for frequent access
5. **Background Sync**: Never block UI

## Success Metrics

- Contact operations <100ms
- Search results <50ms
- Zero data loss
- 100% offline functionality
- Sync success rate >95%

## Agent Commands

When invoked, this agent can:
- `setupService()` - Initialize ContactService
- `migrateToOffline()` - Convert to offline-first
- `optimizePerformance()` - Apply optimizations
- `validateIntegrity()` - Check data consistency
- `forceSyncAll()` - Manual sync trigger
- `exportData()` - Export all contacts
- `importData()` - Import contacts
- `cleanupData()` - Remove duplicates/orphans