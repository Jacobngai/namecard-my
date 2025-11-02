import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Contact } from '../types';

const CONTACTS_KEY = '@namecard/contacts';
const SYNC_QUEUE_KEY = '@namecard/sync_queue';
const IMAGES_DIR = `${FileSystem.documentDirectory}business_cards/`;

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

export class LocalStorage {
  /**
   * Initialize local storage and create necessary directories
   */
  static async init(): Promise<void> {
    try {
      // Ensure images directory exists
      const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
        console.log('📁 Created local images directory');
      }

      // Initialize empty contacts array if not exists
      const contacts = await AsyncStorage.getItem(CONTACTS_KEY);
      if (!contacts) {
        await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify([]));
        console.log('📱 Initialized local contacts storage');
      }
    } catch (error) {
      console.error('Failed to initialize local storage:', error);
      // Non-fatal - app continues to work
    }
  }

  /**
   * Save contact locally with generated ID
   */
  static async saveContact(contact: Partial<Contact>): Promise<Contact> {
    try {
      const contacts = await this.getContacts();

      // Generate local ID if not provided
      const newContact: Contact = {
        id: contact.id || `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: contact.name || '',
        company: contact.company || '',
        phone: contact.phone || '',
        email: contact.email || '',
        address: contact.address || '',
        imageUrl: contact.imageUrl || '',
        addedDate: contact.addedDate || new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        jobTitle: contact.jobTitle,
        lastContact: contact.lastContact,
        phones: contact.phones,
      };

      contacts.push(newContact);
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));

      console.log('✅ Contact saved locally:', newContact.id);
      return newContact;
    } catch (error) {
      console.error('Failed to save contact locally:', error);
      throw new Error('Failed to save contact');
    }
  }

  /**
   * Get all contacts from local storage
   */
  static async getContacts(): Promise<Contact[]> {
    try {
      const contactsJson = await AsyncStorage.getItem(CONTACTS_KEY);
      if (!contactsJson) return [];

      const contacts = JSON.parse(contactsJson);
      return Array.isArray(contacts) ? contacts : [];
    } catch (error) {
      console.error('Failed to get contacts:', error);
      return []; // Always return array to prevent crashes
    }
  }

  /**
   * Update a contact locally
   */
  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    try {
      const contacts = await this.getContacts();
      const index = contacts.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('Contact not found');
      }

      const updatedContact = { ...contacts[index], ...updates };
      contacts[index] = updatedContact;

      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
      console.log('✅ Contact updated locally:', id);

      return updatedContact;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw new Error('Failed to update contact');
    }
  }

  /**
   * Delete a contact locally
   */
  static async deleteContact(id: string): Promise<void> {
    try {
      const contacts = await this.getContacts();
      const filteredContacts = contacts.filter(c => c.id !== id);

      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(filteredContacts));
      console.log('✅ Contact deleted locally:', id);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw new Error('Failed to delete contact');
    }
  }

  /**
   * Search contacts locally
   */
  static async searchContacts(query: string): Promise<Contact[]> {
    try {
      const contacts = await this.getContacts();
      const lowercaseQuery = query.toLowerCase();

      return contacts.filter(contact =>
        contact.name.toLowerCase().includes(lowercaseQuery) ||
        contact.company.toLowerCase().includes(lowercaseQuery) ||
        contact.phone.toLowerCase().includes(lowercaseQuery) ||
        contact.email.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Failed to search contacts:', error);
      return [];
    }
  }

  /**
   * Save image to local filesystem
   */
  static async saveImage(imageUri: string): Promise<string> {
    try {
      // Ensure directory exists
      await this.init();

      // Generate unique filename
      const fileName = `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.jpg`;
      const localUri = `${IMAGES_DIR}${fileName}`;

      // Copy image to app's document directory
      await FileSystem.copyAsync({
        from: imageUri,
        to: localUri
      });

      console.log('✅ Image saved locally:', localUri);
      return localUri;
    } catch (error) {
      console.error('Failed to save image locally:', error);
      // Return original URI as fallback
      return imageUri;
    }
  }

  /**
   * Delete image from local filesystem
   */
  static async deleteImage(imageUri: string): Promise<void> {
    try {
      // Only delete if it's a local image
      if (imageUri.includes(IMAGES_DIR)) {
        await FileSystem.deleteAsync(imageUri, { idempotent: true });
        console.log('✅ Image deleted locally:', imageUri);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      // Non-fatal error
    }
  }

  /**
   * Add item to sync queue
   */
  static async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'retries'>): Promise<void> {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncQueueItem[] = queueJson ? JSON.parse(queueJson) : [];

      const newItem: SyncQueueItem = {
        ...item,
        id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        retries: 0
      };

      queue.push(newItem);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

      console.log('📤 Added to sync queue:', newItem.action);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      // Non-fatal - sync will be skipped
    }
  }

  /**
   * Get sync queue items
   */
  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  /**
   * Remove item from sync queue
   */
  static async removeFromSyncQueue(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const filteredQueue = queue.filter(item => item.id !== id);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  /**
   * Clear all local data (for debugging)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CONTACTS_KEY, SYNC_QUEUE_KEY]);

      // Clear images directory
      const images = await FileSystem.readDirectoryAsync(IMAGES_DIR);
      for (const image of images) {
        await FileSystem.deleteAsync(`${IMAGES_DIR}${image}`, { idempotent: true });
      }

      console.log('🗑️ Cleared all local data');
    } catch (error) {
      console.error('Failed to clear local data:', error);
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    contactsCount: number;
    imagesCount: number;
    syncQueueCount: number;
    totalSizeKB: number;
  }> {
    try {
      const contacts = await this.getContacts();
      const syncQueue = await this.getSyncQueue();

      let imagesCount = 0;
      let totalSize = 0;

      try {
        const images = await FileSystem.readDirectoryAsync(IMAGES_DIR);
        imagesCount = images.length;

        // Calculate total size
        for (const image of images) {
          const info = await FileSystem.getInfoAsync(`${IMAGES_DIR}${image}`);
          if (info.exists && 'size' in info) {
            totalSize += info.size;
          }
        }
      } catch {
        // Directory might not exist yet
      }

      return {
        contactsCount: contacts.length,
        imagesCount,
        syncQueueCount: syncQueue.length,
        totalSizeKB: Math.round(totalSize / 1024)
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        contactsCount: 0,
        imagesCount: 0,
        syncQueueCount: 0,
        totalSizeKB: 0
      };
    }
  }
}