import { Contact } from '../types';
import { LocalStorage } from './localStorage';
import { SupabaseService } from './supabase';

/**
 * Unified contact service that prioritizes local storage
 * and syncs with Supabase in the background
 */
export class ContactService {
  private static isOnline = true;
  private static hasAuth = false;

  /**
   * Initialize the contact service
   */
  static async init(): Promise<void> {
    // Initialize local storage
    await LocalStorage.init();

    // Check if we have a valid session (non-blocking)
    this.checkAuthStatus();
  }

  /**
   * Check authentication status (non-blocking)
   */
  private static async checkAuthStatus(): Promise<void> {
    try {
      const user = await SupabaseService.getCurrentUser();
      this.hasAuth = !!user;
      console.log('📱 Auth status:', this.hasAuth ? 'Authenticated' : 'Guest mode');
    } catch {
      this.hasAuth = false;
      console.log('📱 Running in offline/guest mode');
    }
  }

  /**
   * Create a new contact (offline-first)
   */
  static async createContact(contactData: Partial<Contact>): Promise<Contact> {
    // Step 1: Save image locally if provided
    let localImageUrl = contactData.imageUrl;
    if (localImageUrl && !localImageUrl.startsWith('file://')) {
      try {
        localImageUrl = await LocalStorage.saveImage(localImageUrl);
      } catch (error) {
        console.warn('Failed to save image locally, using original:', error);
      }
    }

    // Step 2: Save contact locally (always succeeds)
    const localContact = await LocalStorage.saveContact({
      ...contactData,
      imageUrl: localImageUrl
    });

    // Step 3: Queue for sync if authenticated (non-blocking)
    if (this.hasAuth) {
      this.queueSync('create', localContact);
    }

    return localContact;
  }

  /**
   * Get all contacts (offline-first)
   */
  static async getContacts(): Promise<Contact[]> {
    // Always return local contacts immediately
    const contacts = await LocalStorage.getContacts();

    // Trigger background sync if authenticated (non-blocking)
    if (this.hasAuth) {
      this.syncInBackground();
    }

    return contacts;
  }

  /**
   * Update a contact (offline-first)
   */
  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    // Update locally first
    const updatedContact = await LocalStorage.updateContact(id, updates);

    // Queue for sync if authenticated
    if (this.hasAuth) {
      this.queueSync('update', updatedContact);
    }

    return updatedContact;
  }

  /**
   * Delete a contact (offline-first)
   */
  static async deleteContact(id: string): Promise<void> {
    // Delete locally first
    await LocalStorage.deleteContact(id);

    // Queue for sync if authenticated
    if (this.hasAuth) {
      this.queueSync('delete', { id });
    }
  }

  /**
   * Search contacts (local only)
   */
  static async searchContacts(query: string): Promise<Contact[]> {
    return LocalStorage.searchContacts(query);
  }

  /**
   * Queue an operation for sync
   */
  private static async queueSync(action: 'create' | 'update' | 'delete', data: any): Promise<void> {
    try {
      await LocalStorage.addToSyncQueue({
        action,
        data,
        timestamp: Date.now()
      });

      // Try to sync immediately if online
      this.processSyncQueue();
    } catch (error) {
      console.log('Failed to queue sync operation:', error);
      // Non-fatal - local operation already succeeded
    }
  }

  /**
   * Process sync queue in background
   */
  private static async processSyncQueue(): Promise<void> {
    if (!this.hasAuth || !this.isOnline) {
      console.log('⏸️ Skipping sync (offline or not authenticated)');
      return;
    }

    try {
      const queue = await LocalStorage.getSyncQueue();
      console.log(`📤 Processing ${queue.length} sync items`);

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await LocalStorage.removeFromSyncQueue(item.id);
        } catch (error) {
          console.log(`Failed to sync item ${item.id}:`, error);
          // Will retry later
          if (item.retries > 5) {
            // Too many retries, remove from queue
            await LocalStorage.removeFromSyncQueue(item.id);
          }
        }
      }
    } catch (error) {
      console.log('Sync queue processing failed:', error);
    }
  }

  /**
   * Sync a single item to Supabase
   */
  private static async syncItem(item: any): Promise<void> {
    switch (item.action) {
      case 'create':
        // Upload image to Supabase if it's local
        let remoteImageUrl = item.data.imageUrl;
        if (remoteImageUrl && remoteImageUrl.includes(FileSystem.documentDirectory)) {
          try {
            remoteImageUrl = await SupabaseService.uploadCardImage(
              remoteImageUrl,
              item.data.id
            );
          } catch {
            // Keep local URL if upload fails
          }
        }

        await SupabaseService.createContact({
          ...item.data,
          imageUrl: remoteImageUrl
        });
        break;

      case 'update':
        await SupabaseService.updateContact(item.data.id, item.data);
        break;

      case 'delete':
        await SupabaseService.deleteContact(item.data.id);
        break;
    }
  }

  /**
   * Sync contacts in background (non-blocking)
   */
  private static async syncInBackground(): Promise<void> {
    // Run sync in background without blocking UI
    setTimeout(async () => {
      try {
        await this.processSyncQueue();
      } catch (error) {
        console.log('Background sync failed:', error);
      }
    }, 1000);
  }

  /**
   * Force sync all contacts (for manual sync button)
   */
  static async forceSyncAll(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.hasAuth) {
        return { success: false, message: 'Please sign in to sync' };
      }

      // Get all local contacts
      const localContacts = await LocalStorage.getContacts();

      // Get all remote contacts
      const remoteContacts = await SupabaseService.getContacts();

      // Merge logic (local takes precedence)
      // This is simplified - real implementation needs conflict resolution
      for (const localContact of localContacts) {
        const exists = remoteContacts.find(r => r.id === localContact.id);
        if (!exists) {
          await this.queueSync('create', localContact);
        }
      }

      await this.processSyncQueue();

      return { success: true, message: 'Sync completed' };
    } catch (error) {
      console.error('Force sync failed:', error);
      return { success: false, message: 'Sync failed' };
    }
  }

  /**
   * Get sync status
   */
  static async getSyncStatus(): Promise<{
    isAuthenticated: boolean;
    isOnline: boolean;
    pendingSyncCount: number;
  }> {
    const queue = await LocalStorage.getSyncQueue();
    return {
      isAuthenticated: this.hasAuth,
      isOnline: this.isOnline,
      pendingSyncCount: queue.length
    };
  }

  /**
   * Sign in and enable sync
   */
  static async enableSync(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { user, error } = await SupabaseService.signIn(email, password);
      if (error) {
        return { success: false, error: error.message };
      }

      this.hasAuth = true;
      await this.forceSyncAll();

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out and disable sync
   */
  static async disableSync(): Promise<void> {
    this.hasAuth = false;
    await SupabaseService.signOut();
  }
}

// Import FileSystem for type checking
import * as FileSystem from 'expo-file-system/legacy';