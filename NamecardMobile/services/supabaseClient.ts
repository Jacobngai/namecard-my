import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Config from '../config/environment';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client singleton
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!Config.SUPABASE_URL || !Config.SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    supabaseClient = createClient(
      Config.SUPABASE_URL,
      Config.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return supabaseClient;
}

/**
 * Export supabase instance for backward compatibility
 */
export const supabase = getSupabaseClient();