import { supabase } from './supabaseClient';

/**
 * Service for managing client interactions
 * Handles CRUD operations for the client_interactions table
 */

export interface ClientInteraction {
  id: string;
  user_id: string;
  contact_id: string;
  interaction_date: string;
  interaction_type: 'meeting' | 'call' | 'email' | 'whatsapp' | 'other' | null;
  topic: string;
  summary: string | null;
  transcription: string | null;
  keywords: string[] | null;
  interest_level: 'high' | 'medium' | 'low' | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  follow_up_required: boolean;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  follow_up_completed: boolean;
  follow_up_completed_at: string | null;
  voice_recording_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInteractionInput {
  contact_id: string;
  interaction_date: string;
  interaction_type?: 'meeting' | 'call' | 'email' | 'whatsapp' | 'other';
  topic: string;
  summary?: string;
  transcription?: string;
  keywords?: string[];
  interest_level?: 'high' | 'medium' | 'low';
  sentiment?: 'positive' | 'neutral' | 'negative';
  follow_up_required?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  voice_recording_url?: string;
}

export interface InteractionFilters {
  contact_id?: string;
  topic?: string;
  interest_level?: 'high' | 'medium' | 'low';
  follow_up_required?: boolean;
  start_date?: string;
  end_date?: string;
}

export class InteractionService {
  /**
   * Create a new interaction
   */
  static async createInteraction(
    userId: string,
    input: CreateInteractionInput
  ): Promise<ClientInteraction> {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .insert({
          user_id: userId,
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create interaction:', error);
        throw new Error(`Failed to create interaction: ${error.message}`);
      }

      console.log('✅ Interaction created:', data.id);
      return data as ClientInteraction;
    } catch (error) {
      console.error('❌ Create interaction error:', error);
      throw error;
    }
  }

  /**
   * Get all interactions for a user
   */
  static async getUserInteractions(
    userId: string,
    filters?: InteractionFilters
  ): Promise<ClientInteraction[]> {
    try {
      let query = supabase
        .from('client_interactions')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters?.contact_id) {
        query = query.eq('contact_id', filters.contact_id);
      }

      if (filters?.topic) {
        query = query.eq('topic', filters.topic);
      }

      if (filters?.interest_level) {
        query = query.eq('interest_level', filters.interest_level);
      }

      if (filters?.follow_up_required !== undefined) {
        query = query.eq('follow_up_required', filters.follow_up_required);
      }

      if (filters?.start_date) {
        query = query.gte('interaction_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('interaction_date', filters.end_date);
      }

      const { data, error } = await query.order('interaction_date', { ascending: false });

      if (error) {
        console.error('❌ Failed to get interactions:', error);
        throw new Error(`Failed to get interactions: ${error.message}`);
      }

      console.log(`✅ Retrieved ${data?.length || 0} interactions`);
      return (data as ClientInteraction[]) || [];
    } catch (error) {
      console.error('❌ Get interactions error:', error);
      throw error;
    }
  }

  /**
   * Get a single interaction by ID
   */
  static async getInteraction(userId: string, interactionId: string): Promise<ClientInteraction> {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('id', interactionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Failed to get interaction:', error);
        throw new Error(`Failed to get interaction: ${error.message}`);
      }

      return data as ClientInteraction;
    } catch (error) {
      console.error('❌ Get interaction error:', error);
      throw error;
    }
  }

  /**
   * Update an interaction
   */
  static async updateInteraction(
    userId: string,
    interactionId: string,
    updates: Partial<CreateInteractionInput>
  ): Promise<ClientInteraction> {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interactionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to update interaction:', error);
        throw new Error(`Failed to update interaction: ${error.message}`);
      }

      console.log('✅ Interaction updated:', data.id);
      return data as ClientInteraction;
    } catch (error) {
      console.error('❌ Update interaction error:', error);
      throw error;
    }
  }

  /**
   * Delete an interaction
   */
  static async deleteInteraction(userId: string, interactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('client_interactions')
        .delete()
        .eq('id', interactionId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Failed to delete interaction:', error);
        throw new Error(`Failed to delete interaction: ${error.message}`);
      }

      console.log('✅ Interaction deleted:', interactionId);
    } catch (error) {
      console.error('❌ Delete interaction error:', error);
      throw error;
    }
  }

  /**
   * Mark follow-up as completed
   */
  static async completeFollowUp(userId: string, interactionId: string): Promise<ClientInteraction> {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .update({
          follow_up_completed: true,
          follow_up_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', interactionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to complete follow-up:', error);
        throw new Error(`Failed to complete follow-up: ${error.message}`);
      }

      console.log('✅ Follow-up completed:', data.id);
      return data as ClientInteraction;
    } catch (error) {
      console.error('❌ Complete follow-up error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming follow-ups (due in the next N days)
   */
  static async getUpcomingFollowUps(userId: string, days: number = 7): Promise<ClientInteraction[]> {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('follow_up_required', true)
        .eq('follow_up_completed', false)
        .gte('follow_up_date', now.toISOString())
        .lte('follow_up_date', futureDate.toISOString())
        .order('follow_up_date', { ascending: true });

      if (error) {
        console.error('❌ Failed to get upcoming follow-ups:', error);
        throw new Error(`Failed to get upcoming follow-ups: ${error.message}`);
      }

      console.log(`✅ Retrieved ${data?.length || 0} upcoming follow-ups`);
      return (data as ClientInteraction[]) || [];
    } catch (error) {
      console.error('❌ Get upcoming follow-ups error:', error);
      throw error;
    }
  }

  /**
   * Get overdue follow-ups
   */
  static async getOverdueFollowUps(userId: string): Promise<ClientInteraction[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('follow_up_required', true)
        .eq('follow_up_completed', false)
        .lt('follow_up_date', now)
        .order('follow_up_date', { ascending: true });

      if (error) {
        console.error('❌ Failed to get overdue follow-ups:', error);
        throw new Error(`Failed to get overdue follow-ups: ${error.message}`);
      }

      console.log(`✅ Retrieved ${data?.length || 0} overdue follow-ups`);
      return (data as ClientInteraction[]) || [];
    } catch (error) {
      console.error('❌ Get overdue follow-ups error:', error);
      throw error;
    }
  }

  /**
   * Get interaction statistics for a user
   */
  static async getInteractionStats(userId: string): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_topic: Record<string, number>;
    by_interest_level: Record<string, number>;
    pending_follow_ups: number;
    completed_follow_ups: number;
  }> {
    try {
      const interactions = await this.getUserInteractions(userId);

      const stats = {
        total: interactions.length,
        by_type: {} as Record<string, number>,
        by_topic: {} as Record<string, number>,
        by_interest_level: {} as Record<string, number>,
        pending_follow_ups: 0,
        completed_follow_ups: 0,
      };

      interactions.forEach(interaction => {
        // Count by type
        const type = interaction.interaction_type || 'other';
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;

        // Count by topic
        stats.by_topic[interaction.topic] = (stats.by_topic[interaction.topic] || 0) + 1;

        // Count by interest level
        if (interaction.interest_level) {
          stats.by_interest_level[interaction.interest_level] =
            (stats.by_interest_level[interaction.interest_level] || 0) + 1;
        }

        // Count follow-ups
        if (interaction.follow_up_required) {
          if (interaction.follow_up_completed) {
            stats.completed_follow_ups++;
          } else {
            stats.pending_follow_ups++;
          }
        }
      });

      console.log('✅ Interaction stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Get interaction stats error:', error);
      throw error;
    }
  }

  /**
   * Search interactions by keywords
   */
  static async searchInteractions(userId: string, searchTerm: string): Promise<ClientInteraction[]> {
    try {
      const { data, error } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('user_id', userId)
        .or(`summary.ilike.%${searchTerm}%,transcription.ilike.%${searchTerm}%,topic.ilike.%${searchTerm}%`)
        .order('interaction_date', { ascending: false });

      if (error) {
        console.error('❌ Failed to search interactions:', error);
        throw new Error(`Failed to search interactions: ${error.message}`);
      }

      console.log(`✅ Found ${data?.length || 0} interactions matching "${searchTerm}"`);
      return (data as ClientInteraction[]) || [];
    } catch (error) {
      console.error('❌ Search interactions error:', error);
      throw error;
    }
  }
}
