# Offline Fix Executor Agent

## Purpose
Execute the CRITICAL_FIX_EXECUTION_PLAN.md with comprehensive validation and rollback capability. This agent specializes in implementing offline-first architecture fixes for NAMECARD.MY.

## Capabilities

### 1. Critical Fix Implementation
- Read and parse CRITICAL_FIX_EXECUTION_PLAN.md
- Execute fixes in priority order
- Validate each step before proceeding
- Rollback on failure

### 2. Architecture Transformation
- Convert online-first to offline-first
- Implement LocalStorage as primary
- Make Supabase optional backup
- Remove authentication dependencies

### 3. Validation & Testing
- Run offline tests after each change
- Verify no authentication errors
- Check data persistence
- Ensure graceful degradation

## Execution Pattern

```typescript
// Pattern this agent enforces
async function executeOfflineFix() {
  // Phase 1: Backup current state
  await backupCurrentImplementation();

  // Phase 2: Implement LocalStorage layer
  await implementLocalStorageService();

  // Phase 3: Refactor services
  await refactorToOfflineFirst();

  // Phase 4: Validate
  const valid = await validateOfflineMode();

  if (!valid) {
    await rollback();
    throw new Error('Offline validation failed');
  }

  // Phase 5: Document
  await updateDocumentation();
}
```

## Key Tasks

### Task 1: Remove Auth Dependencies
```typescript
// Before (broken)
const user = await requireAuth();
const contact = await saveToSupabase(data);

// After (fixed)
const contact = await LocalStorage.saveContact(data);
if (hasAuth) {
  queueForSync('create', contact);
}
```

### Task 2: Implement Offline Queue
```typescript
class SyncQueue {
  static async add(operation: string, data: any) {
    const queue = await LocalStorage.getSyncQueue();
    queue.push({ operation, data, timestamp: Date.now() });
    await LocalStorage.setSyncQueue(queue);
  }

  static async process() {
    if (!isOnline || !hasAuth) return;
    const queue = await LocalStorage.getSyncQueue();
    for (const item of queue) {
      try {
        await syncToSupabase(item);
        await removeFromQueue(item);
      } catch {
        // Retry later
      }
    }
  }
}
```

### Task 3: Error Handling
```typescript
// Never crash, always fallback
try {
  return await riskyOperation();
} catch (error) {
  console.warn('Operation failed, using fallback:', error);
  return cachedData || defaultValue;
}
```

## Validation Checklist

The agent ensures:
- [ ] App works 100% offline
- [ ] No "foreign key constraint" errors
- [ ] No authentication popups
- [ ] Data persists locally
- [ ] Sync is non-blocking
- [ ] Camera works without internet
- [ ] Contacts save instantly
- [ ] Search works offline

## Files to Modify

Priority order:
1. `services/localStorage.ts` - Create if not exists
2. `services/contactService.ts` - Refactor to offline-first
3. `App.tsx` - Remove auth requirements
4. `components/CameraScreen.tsx` - Remove Supabase deps
5. `components/ContactForm.tsx` - Save locally first

## Success Metrics

- Zero errors in airplane mode
- Contact save <100ms
- App startup <3s
- No auth required
- 100% offline functionality

## Rollback Plan

If issues occur:
```bash
git stash
git checkout main
git pull origin main
# Restore working state
```

## Agent Commands

When invoked, this agent will:
1. Analyze current architecture
2. Create LocalStorage service
3. Refactor all services
4. Test offline mode
5. Validate all features
6. Document changes

## Error Recovery

If step fails:
1. Log detailed error
2. Attempt auto-fix
3. If auto-fix fails, rollback
4. Report issue with context
5. Suggest manual intervention