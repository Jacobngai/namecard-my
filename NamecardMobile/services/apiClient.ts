/**
 * API Client for WhatsCard
 *
 * This service provides a programmatic way for users to access their WhatsCard data
 * using Personal Access Tokens (PAT).
 *
 * Usage:
 * ```typescript
 * const client = new WhatsCardAPIClient('wc_abc123...');
 * const contacts = await client.contacts.list();
 * await client.contacts.create({ name: 'John Tan', phone: '60123456789' });
 * ```
 */

import { supabase } from './supabaseClient';
import { APITokenService } from './apiTokenService';

export interface ContactInput {
  name: string;
  company?: string;
  phone?: string;
  phones?: {
    mobile1?: string;
    mobile2?: string;
    office?: string;
    fax?: string;
  };
  job_title?: string;
  email?: string;
  address?: string;
  tags?: string[];
}

export interface InteractionInput {
  contact_id: string;
  interaction_date: string;
  interaction_type?: 'meeting' | 'call' | 'email' | 'whatsapp' | 'other';
  topic: string;
  summary?: string;
  interest_level?: 'high' | 'medium' | 'low';
  sentiment?: 'positive' | 'neutral' | 'negative';
  follow_up_required?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
}

/**
 * WhatsCard API Client
 * Authenticates using Personal Access Tokens
 */
export class WhatsCardAPIClient {
  private userId: string | null = null;
  private scopes: string[] = [];
  private isAuthenticated: boolean = false;

  constructor(private apiToken: string) {
    // Use the existing Supabase client
  }

  /**
   * Authenticate the token and initialize the client
   */
  async authenticate(): Promise<boolean> {
    try {
      const tokenData = await APITokenService.validateToken(this.apiToken);

      if (!tokenData) {
        console.error('❌ Invalid API token');
        return false;
      }

      this.userId = tokenData.userId;
      this.scopes = tokenData.scopes;
      this.isAuthenticated = true;

      console.log('✅ API client authenticated');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return false;
    }
  }

  /**
   * Check if user has a required scope
   */
  private hasScope(requiredScope: string): boolean {
    if (!this.isAuthenticated) {
      throw new Error('Client not authenticated. Call authenticate() first.');
    }

    return APITokenService.hasScope(this.scopes, requiredScope);
  }

  /**
   * Contacts API
   */
  contacts = {
    /**
     * List all contacts
     */
    list: async (filters?: { search?: string; tags?: string[] }) => {
      if (!this.hasScope('read:contacts')) {
        throw new Error('Missing required scope: read:contacts');
      }

      let query = supabase
        .from('contacts')
        .select('*')
        .eq('user_id', this.userId!);

      if (filters?.search) {
        query = query.ilike('search_text', `%${filters.search}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query;

      if (error) throw new Error(`Failed to list contacts: ${error.message}`);

      return data || [];
    },

    /**
     * Get a single contact by ID
     */
    get: async (contactId: string) => {
      if (!this.hasScope('read:contacts')) {
        throw new Error('Missing required scope: read:contacts');
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('user_id', this.userId!)
        .single();

      if (error) throw new Error(`Failed to get contact: ${error.message}`);

      return data;
    },

    /**
     * Create a new contact
     */
    create: async (contact: ContactInput) => {
      if (!this.hasScope('write:contacts')) {
        throw new Error('Missing required scope: write:contacts');
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: this.userId!,
          ...contact,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create contact: ${error.message}`);

      return data;
    },

    /**
     * Update a contact
     */
    update: async (contactId: string, updates: Partial<ContactInput>) => {
      if (!this.hasScope('write:contacts')) {
        throw new Error('Missing required scope: write:contacts');
      }

      const { data, error } = await supabase
        .from('contacts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contactId)
        .eq('user_id', this.userId!)
        .select()
        .single();

      if (error) throw new Error(`Failed to update contact: ${error.message}`);

      return data;
    },

    /**
     * Delete a contact
     */
    delete: async (contactId: string) => {
      if (!this.hasScope('write:contacts')) {
        throw new Error('Missing required scope: write:contacts');
      }

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', this.userId!);

      if (error) throw new Error(`Failed to delete contact: ${error.message}`);

      return true;
    },
  };

  /**
   * Interactions API (when we create the client_interactions table)
   */
  interactions = {
    /**
     * List all interactions
     */
    list: async (filters?: { contact_id?: string; topic?: string }) => {
      if (!this.hasScope('read:interactions')) {
        throw new Error('Missing required scope: read:interactions');
      }

      let query = supabase
        .from('client_interactions')
        .select('*')
        .eq('user_id', this.userId!);

      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }

      if (filters?.topic) {
        query = query.eq('topic', filters.topic);
      }

      const { data, error } = await query.order('interaction_date', { ascending: false });

      if (error) throw new Error(`Failed to list interactions: ${error.message}`);

      return data || [];
    },

    /**
     * Get a single interaction
     */
    get: async (interactionId: string) => {
      if (!this.hasScope('read:interactions')) {
        throw new Error('Missing required scope: read:interactions');
      }

      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('id', interactionId)
        .eq('user_id', this.userId!)
        .single();

      if (error) throw new Error(`Failed to get interaction: ${error.message}`);

      return data;
    },

    /**
     * Create a new interaction
     */
    create: async (interaction: InteractionInput) => {
      if (!this.hasScope('write:interactions')) {
        throw new Error('Missing required scope: write:interactions');
      }

      const { data, error } = await supabase
        .from('client_interactions')
        .insert({
          user_id: this.userId!,
          ...interaction,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create interaction: ${error.message}`);

      return data;
    },

    /**
     * Update an interaction
     */
    update: async (interactionId: string, updates: Partial<InteractionInput>) => {
      if (!this.hasScope('write:interactions')) {
        throw new Error('Missing required scope: write:interactions');
      }

      const { data, error } = await supabase
        .from('client_interactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interactionId)
        .eq('user_id', this.userId!)
        .select()
        .single();

      if (error) throw new Error(`Failed to update interaction: ${error.message}`);

      return data;
    },

    /**
     * Delete an interaction
     */
    delete: async (interactionId: string) => {
      if (!this.hasScope('write:interactions')) {
        throw new Error('Missing required scope: write:interactions');
      }

      const { error } = await supabase
        .from('client_interactions')
        .delete()
        .eq('id', interactionId)
        .eq('user_id', this.userId!);

      if (error) throw new Error(`Failed to delete interaction: ${error.message}`);

      return true;
    },
  };

  /**
   * Get client info (user ID, scopes)
   */
  getClientInfo(): { userId: string | null; scopes: string[]; isAuthenticated: boolean } {
    return {
      userId: this.userId,
      scopes: this.scopes,
      isAuthenticated: this.isAuthenticated,
    };
  }
}

/**
 * Example usage documentation
 *
 * // Initialize the client
 * const client = new WhatsCardAPIClient('wc_abc123...');
 * await client.authenticate();
 *
 * // List contacts
 * const contacts = await client.contacts.list();
 * console.log(contacts);
 *
 * // Create a contact
 * const newContact = await client.contacts.create({
 *   name: 'John Tan',
 *   phone: '60123456789',
 *   email: 'john@example.com',
 *   company: 'ABC Sdn Bhd'
 * });
 *
 * // Update a contact
 * await client.contacts.update(newContact.id, {
 *   job_title: 'CEO'
 * });
 *
 * // Create an interaction
 * await client.interactions.create({
 *   contact_id: newContact.id,
 *   interaction_date: new Date().toISOString(),
 *   topic: 'loans',
 *   summary: 'Discussed car loan options',
 *   interest_level: 'high'
 * });
 *
 * // Get interactions for a contact
 * const interactions = await client.interactions.list({
 *   contact_id: newContact.id
 * });
 */
