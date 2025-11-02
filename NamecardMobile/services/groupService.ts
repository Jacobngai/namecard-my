import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group } from '../types';
import { SupabaseService } from './supabase';

/**
 * GroupService - Offline-first group management
 *
 * Features:
 * - Local storage using AsyncStorage
 * - Optional cloud sync with Supabase
 * - Automatic conflict resolution
 * - Batch operations support
 */

const GROUPS_STORAGE_KEY = '@namecard_groups';
const SYNC_QUEUE_KEY = '@namecard_groups_sync_queue';

interface SyncOperation {
  type: 'create' | 'update' | 'delete';
  groupId: string;
  data?: Partial<Group>;
  timestamp: string;
}

export class GroupService {
  private static syncQueue: SyncOperation[] = [];
  private static isInitialized = false;
  private static isSyncing = false;

  /**
   * Initialize the group service
   * - Load sync queue from storage
   * - Attempt initial sync if online
   */
  static async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load pending sync operations
      const queueData = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }

      this.isInitialized = true;
      console.log('✅ GroupService initialized');

      // Try to sync pending operations
      await this.processSyncQueue();
    } catch (error) {
      console.error('⚠️ GroupService initialization warning:', error);
      // Continue anyway - offline mode
      this.isInitialized = true;
    }
  }

  /**
   * Get all groups from local storage
   */
  static async getGroups(): Promise<Group[]> {
    try {
      const groupsData = await AsyncStorage.getItem(GROUPS_STORAGE_KEY);
      if (!groupsData) {
        return [];
      }

      const groups: Group[] = JSON.parse(groupsData);
      console.log(`✅ Loaded ${groups.length} groups from storage`);
      return groups;
    } catch (error) {
      console.error('❌ Failed to load groups:', error);
      return [];
    }
  }

  /**
   * Get a single group by ID
   */
  static async getGroup(groupId: string): Promise<Group | null> {
    try {
      const groups = await this.getGroups();
      return groups.find(g => g.id === groupId) || null;
    } catch (error) {
      console.error('❌ Failed to get group:', error);
      return null;
    }
  }

  /**
   * Create a new group
   */
  static async createGroup(groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'contactCount'>): Promise<Group> {
    try {
      const newGroup: Group = {
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...groupData,
        contactCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to local storage
      const groups = await this.getGroups();
      const updatedGroups = [newGroup, ...groups];
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));

      console.log('✅ Group created locally:', newGroup.name);

      // Queue for cloud sync
      await this.queueSyncOperation({
        type: 'create',
        groupId: newGroup.id,
        data: newGroup,
        timestamp: new Date().toISOString(),
      });

      return newGroup;
    } catch (error) {
      console.error('❌ Failed to create group:', error);
      throw new Error('Failed to create group');
    }
  }

  /**
   * Update an existing group
   */
  static async updateGroup(groupId: string, updates: Partial<Omit<Group, 'id' | 'createdAt'>>): Promise<Group> {
    try {
      const groups = await this.getGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      const updatedGroup: Group = {
        ...groups[groupIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      groups[groupIndex] = updatedGroup;
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));

      console.log('✅ Group updated locally:', updatedGroup.name);

      // Queue for cloud sync - send full updated group to ensure required fields
      await this.queueSyncOperation({
        type: 'update',
        groupId,
        data: updatedGroup, // Send full group object instead of just updates
        timestamp: new Date().toISOString(),
      });

      return updatedGroup;
    } catch (error) {
      console.error('❌ Failed to update group:', error);
      throw new Error('Failed to update group');
    }
  }

  /**
   * Delete a group
   */
  static async deleteGroup(groupId: string): Promise<void> {
    try {
      const groups = await this.getGroups();
      const filteredGroups = groups.filter(g => g.id !== groupId);
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(filteredGroups));

      console.log('✅ Group deleted locally:', groupId);

      // Queue for cloud sync
      await this.queueSyncOperation({
        type: 'delete',
        groupId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to delete group:', error);
      throw new Error('Failed to delete group');
    }
  }

  /**
   * Update contact count for a group
   */
  static async updateContactCount(groupId: string, count: number): Promise<void> {
    try {
      await this.updateGroup(groupId, { contactCount: count });
    } catch (error) {
      console.error('❌ Failed to update contact count:', error);
    }
  }

  /**
   * Recalculate and update contact counts for all groups
   */
  static async recalculateContactCounts(contacts: { id: string; groupIds?: string[] }[]): Promise<void> {
    try {
      const groups = await this.getGroups();
      const groupCounts = new Map<string, number>();

      // Initialize all groups with 0
      groups.forEach(g => groupCounts.set(g.id, 0));

      // Count contacts in each group
      contacts.forEach(contact => {
        if (contact.groupIds && contact.groupIds.length > 0) {
          contact.groupIds.forEach(groupId => {
            const currentCount = groupCounts.get(groupId) || 0;
            groupCounts.set(groupId, currentCount + 1);
          });
        }
      });

      // Update all groups
      const updatedGroups = groups.map(group => ({
        ...group,
        contactCount: groupCounts.get(group.id) || 0,
      }));

      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
      console.log('✅ Contact counts recalculated for all groups');
    } catch (error) {
      console.error('❌ Failed to recalculate contact counts:', error);
    }
  }

  /**
   * Queue a sync operation for later processing
   */
  private static async queueSyncOperation(operation: SyncOperation): Promise<void> {
    try {
      this.syncQueue.push(operation);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));

      // Try to process queue immediately
      await this.processSyncQueue();
    } catch (error) {
      console.error('⚠️ Failed to queue sync operation:', error);
    }
  }

  /**
   * Process pending sync operations
   */
  private static async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    try {
      this.isSyncing = true;
      console.log(`🔄 Processing ${this.syncQueue.length} group sync operations...`);

      // Check if we can sync (user is authenticated)
      const { user } = await SupabaseService.getCurrentUser();
      if (!user) {
        console.log('⚠️ Cannot sync groups - not authenticated');
        this.isSyncing = false;
        return;
      }

      // Process each operation
      for (const operation of [...this.syncQueue]) {
        try {
          switch (operation.type) {
            case 'create':
            case 'update':
              if (operation.data) {
                const groupData = operation.data as Partial<Group>;

                // Validate that required fields are present
                if (!groupData.name || !groupData.color) {
                  console.log(`⚠️ Removing invalid sync operation - missing required fields:`, {
                    groupId: operation.groupId,
                    hasName: !!groupData.name,
                    hasColor: !!groupData.color,
                    data: groupData
                  });
                  // Remove invalid operation from queue
                  this.syncQueue = this.syncQueue.filter(op => op !== operation);
                  continue; // Skip to next operation
                }

                // Check if this is a local ID (starts with "group_")
                if (groupData.id && groupData.id.startsWith('group_')) {
                  console.log(`⏭️ Skipping sync for local group ID: ${groupData.id}`);
                  // Remove from queue - local IDs can't be synced to server
                  this.syncQueue = this.syncQueue.filter(op => op !== operation);
                } else {
                  // Normal sync for groups with valid UUIDs and complete data
                  await SupabaseService.upsertGroup(groupData as Group & { name: string; color: string });
                  // Remove from queue after successful sync
                  this.syncQueue = this.syncQueue.filter(op => op !== operation);
                }
              } else {
                // No data in sync operation - remove it
                console.log(`⚠️ Removing sync operation with no data:`, operation);
                this.syncQueue = this.syncQueue.filter(op => op !== operation);
              }
              break;
            case 'delete':
              // Skip delete for local IDs (never made it to server)
              if (operation.groupId && operation.groupId.startsWith('group_')) {
                console.log(`⏭️ Skipping delete for local group ID: ${operation.groupId}`);
                this.syncQueue = this.syncQueue.filter(op => op !== operation);
              } else if (operation.groupId) {
                await SupabaseService.deleteGroup(operation.groupId);
                // Remove from queue after successful delete
                this.syncQueue = this.syncQueue.filter(op => op !== operation);
              }
              break;
          }
        } catch (error) {
          console.error('⚠️ Sync operation failed:', operation, error);

          // If error is about null constraint, this operation is invalid - remove it
          if (error instanceof Error && error.message.includes('null value in column')) {
            console.log(`⚠️ Removing invalid operation that violates constraints`);
            this.syncQueue = this.syncQueue.filter(op => op !== operation);
          }
          // Otherwise keep in queue for retry
        }
      }

      // Save updated queue
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
      console.log('✅ Group sync completed');
    } catch (error) {
      console.error('⚠️ Group sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Replace a local group ID with a server-generated UUID
   */
  private static async replaceLocalGroupId(localId: string, serverId: string): Promise<void> {
    try {
      const groups = await this.getGroups();
      const updatedGroups = groups.map(group =>
        group.id === localId ? { ...group, id: serverId } : group
      );
      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updatedGroups));
      console.log(`✅ Replaced local group ID ${localId} with server ID ${serverId}`);
    } catch (error) {
      console.error('❌ Failed to replace local group ID:', error);
    }
  }

  /**
   * Pull groups from cloud and merge with local
   */
  static async syncFromCloud(): Promise<void> {
    try {
      console.log('🔄 Syncing groups from cloud...');

      const cloudGroups = await SupabaseService.getGroups();
      const localGroups = await this.getGroups();

      // Simple merge strategy: cloud wins for same ID, keep local-only groups
      const mergedGroups = [...cloudGroups];

      localGroups.forEach(localGroup => {
        const existsInCloud = cloudGroups.some(cg => cg.id === localGroup.id);
        if (!existsInCloud) {
          mergedGroups.push(localGroup);
        }
      });

      await AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(mergedGroups));
      console.log('✅ Groups synced from cloud');
    } catch (error) {
      console.error('⚠️ Failed to sync groups from cloud:', error);
    }
  }

  /**
   * Clear all local data (for testing or logout)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([GROUPS_STORAGE_KEY, SYNC_QUEUE_KEY]);
      this.syncQueue = [];
      console.log('✅ All group data cleared');
    } catch (error) {
      console.error('❌ Failed to clear group data:', error);
    }
  }
}
