import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseService } from './supabase';
import { getSupabaseClient } from './supabaseClient';

interface AuthSession {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthManager {
  private static SESSION_KEY = 'auth_session';
  private static sessionCache: AuthSession | null = null;

  /**
   * Verify and refresh session if needed
   */
  static async verifySession(): Promise<{ user: any; error: any }> {
    try {
      const client = getSupabaseClient();

      // First, try to get the current session
      const { data: { session }, error: sessionError } = await client.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        return { user: null, error: sessionError };
      }

      if (!session) {
        // Try to restore from AsyncStorage
        const storedSession = await this.getStoredSession();
        if (storedSession) {
          // Attempt to restore the session
          const { data, error } = await client.auth.setSession({
            access_token: storedSession.accessToken,
            refresh_token: storedSession.refreshToken,
          });

          if (!error && data.session) {
            await this.storeSession(data.session);
            return { user: data.user, error: null };
          }
        }

        return { user: null, error: { message: 'No active session. Please sign in.' } };
      }

      // Check if session needs refresh (expires in less than 60 seconds)
      const expiresAt = new Date(session.expires_at || 0).getTime();
      const now = Date.now();
      const needsRefresh = expiresAt - now < 60000; // Less than 1 minute

      if (needsRefresh) {
        console.log('Session expiring soon, refreshing...');
        const { data, error } = await client.auth.refreshSession();
        if (!error && data.session) {
          await this.storeSession(data.session);
          return { user: data.user, error: null };
        }
      }

      // Session is valid
      await this.storeSession(session);
      return { user: session.user, error: null };

    } catch (error) {
      console.error('Session verification failed:', error);
      return { user: null, error };
    }
  }

  /**
   * Store session in AsyncStorage for persistence
   */
  static async storeSession(session: any): Promise<void> {
    try {
      if (!session) return;

      const authSession: AuthSession = {
        user: session.user,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at || 0).getTime(),
      };

      this.sessionCache = authSession;
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(authSession));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Get stored session from AsyncStorage
   */
  static async getStoredSession(): Promise<AuthSession | null> {
    try {
      // Check cache first
      if (this.sessionCache) {
        return this.sessionCache;
      }

      const stored = await AsyncStorage.getItem(this.SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored) as AuthSession;
        this.sessionCache = session;
        return session;
      }
      return null;
    } catch (error) {
      console.error('Failed to get stored session:', error);
      return null;
    }
  }

  /**
   * Clear stored session
   */
  static async clearSession(): Promise<void> {
    try {
      this.sessionCache = null;
      await AsyncStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Restore session from storage and verify it's still valid
   */
  static async restoreSession(): Promise<any> {
    try {
      // Get stored session
      const storedSession = await this.getStoredSession();

      if (!storedSession) {
        return null;
      }

      // Check if session is expired
      const now = Date.now();
      if (storedSession.expiresAt && storedSession.expiresAt < now) {
        // Session expired, try to refresh with refresh token
        const client = SupabaseService.getClient();
        if (!client) return null;

        const { data, error } = await client.auth.refreshSession({
          refresh_token: storedSession.refreshToken
        });

        if (error || !data.session) {
          console.log('Failed to refresh expired session:', error);
          await this.clearSession();
          return null;
        }

        // Store the new session
        await this.storeSession(data.session);
        return data.session;
      }

      // Session still valid, return it
      return {
        user: storedSession.user,
        access_token: storedSession.accessToken,
        refresh_token: storedSession.refreshToken,
        expires_at: storedSession.expiresAt
      };
    } catch (error) {
      console.error('Failed to restore session:', error);
      return null;
    }
  }

  /**
   * Wrapper to execute operations with verified session
   */
  static async withVerifiedSession<T>(
    operation: (userId: string) => Promise<T>,
    retries: number = 3
  ): Promise<T> {
    let lastError: any = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Verify session before operation
        const { user, error } = await this.verifySession();

        if (error || !user) {
          throw new Error(error?.message || 'Authentication required');
        }

        // Execute the operation
        return await operation(user.id);

      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        // If it's an auth error and we have retries left, refresh session
        if (attempt < retries &&
            (error.message?.includes('JWT') ||
             error.message?.includes('token') ||
             error.message?.includes('expired'))) {
          console.log('Refreshing session and retrying...');

          // Wait with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));

          // Try to refresh the session
          const client = getSupabaseClient();
          const { data, error: refreshError } = await client.auth.refreshSession();

          if (!refreshError && data.session) {
            await this.storeSession(data.session);
            continue; // Retry the operation
          }
        }

        // If it's not an auth error or we're out of retries, throw
        if (attempt === retries) {
          throw lastError;
        }
      }
    }

    throw lastError;
  }

  /**
   * Setup auth state change listener
   */
  static setupAuthListener(onAuthChange: (user: any) => void): () => void {
    const client = getSupabaseClient();

    const { data: subscription } = client.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          await this.storeSession(session);
          onAuthChange(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        await this.clearSession();
        onAuthChange(null);
      }
    });

    // Return unsubscribe function
    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }
}