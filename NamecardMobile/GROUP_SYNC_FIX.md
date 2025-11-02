# Group Sync Fix - Null Name Constraint Error

## Problem

Users were experiencing database constraint errors:
```
ERROR: null value in column "name" of relation "groups" violates not-null constraint
```

This occurred when updating group contact counts because the sync operation only sent partial data (e.g., `{contactCount: 4}`) without the required `name` field.

## Root Cause

In `services/groupService.ts`, the `updateGroup` method was queuing only the partial `updates` object for cloud sync instead of the complete group object:

```typescript
// ❌ OLD CODE (caused null constraint error)
await this.queueSyncOperation({
  type: 'update',
  groupId,
  data: updates, // Only {contactCount: 4}, missing name!
  timestamp: new Date().toISOString(),
});
```

When `updateContactCount()` called `updateGroup()` with just `{contactCount: count}`, the sync queue stored incomplete data. Then when syncing to Supabase, the `upsertGroup()` method received `name: undefined`, violating the NOT NULL constraint.

## Solution (Two-Part Fix)

### Part 1: Prevent Future Invalid Operations

**File**: `NamecardMobile/services/groupService.ts` (line 148-153)

Changed sync operation to send the complete updated group object:

```typescript
// ✅ NEW CODE (fixed)
await this.queueSyncOperation({
  type: 'update',
  groupId,
  data: updatedGroup, // Full group object with all required fields
  timestamp: new Date().toISOString(),
});
```

### Part 2: Auto-Clean Invalid Sync Queue

**File**: `NamecardMobile/services/groupService.ts` (line 265-326)

Added validation and auto-cleanup in `processSyncQueue()`:

```typescript
// Validate that required fields are present
if (!groupData.name || !groupData.color) {
  console.log(`⚠️ Removing invalid sync operation - missing required fields`);
  this.syncQueue = this.syncQueue.filter(op => op !== operation);
  continue; // Skip to next operation
}

// Also auto-remove operations with local IDs that can't sync
if (groupData.id && groupData.id.startsWith('group_')) {
  console.log(`⏭️ Skipping sync for local group ID: ${groupData.id}`);
  this.syncQueue = this.syncQueue.filter(op => op !== operation);
}

// Catch and remove operations that violate database constraints
if (error instanceof Error && error.message.includes('null value in column')) {
  console.log(`⚠️ Removing invalid operation that violates constraints`);
  this.syncQueue = this.syncQueue.filter(op => op !== operation);
}
```

## Automatic Cleanup (No Manual Action Required!)

**Good news**: With Part 2 of the fix, the app will **automatically detect and remove invalid sync operations** the next time it tries to sync!

When you restart the app, you'll see these cleanup logs:

```
🔄 Processing 5 group sync operations...
⚠️ Removing invalid sync operation - missing required fields: {"groupId":"group_...", "hasName":false, "hasColor":false}
⏭️ Skipping sync for local group ID: group_1761992909084_54het1upx
✅ Group sync completed
```

The invalid operations will be automatically removed from the queue, and future syncs will work correctly.

## Manual Cleanup (Optional - Only if you want to force immediate cleanup)

If you want to force an immediate cleanup without waiting for the next sync:

### Option 1: Restart the App

Simply restart the app. The `processSyncQueue()` method will run on initialization and automatically clean up invalid operations.

### Option 2: Manual Queue Clear (Nuclear Option)

Only use if you want to completely clear the sync queue:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('@namecard_groups_sync_queue');
console.log('✅ Sync queue cleared');
```

### Option 3: Full Reset (Complete Wipe)

Only use if you want to completely reset ALL group data:

```typescript
import { GroupService } from './services/groupService';

await GroupService.clearAll(); // Clears all local group data
await GroupService.syncFromCloud(); // Re-download from cloud
```

## Verification

After applying the fix, you should see:

```
✅ Group updated locally: [group name]
🔄 Processing X group sync operations...
✅ Group sync completed
```

**No more null constraint errors!**

## Testing

To test the fix:

1. Create a group
2. Add contacts to the group
3. Watch the sync logs - should succeed without errors
4. Verify in Supabase that the group was synced with all fields

## Database Schema Reference

The `groups` table requires these fields:
- `name` (text, NOT NULL) ← This was missing in partial updates
- `color` (text, NOT NULL, default: '#3B82F6')
- `user_id` (uuid, nullable)
- `id` (uuid, auto-generated)

The fix ensures all required fields are always included in sync operations.
