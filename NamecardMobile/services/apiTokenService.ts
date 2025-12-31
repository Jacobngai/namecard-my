import { supabase } from './supabaseClient';
import * as Crypto from 'expo-crypto';

/**
 * Service for managing user API tokens
 * Allows users to generate Personal Access Tokens (PAT) for programmatic access to their data
 */

export interface APIToken {
  id: string;
  user_id: string;
  token_name: string;
  token_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  usage_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenValidationResult {
  userId: string;
  scopes: string[];
  tokenId: string;
}

export class APITokenService {
  /**
   * Generate a new API token for the user
   *
   * @param userId - User's ID from auth.users
   * @param tokenName - User-friendly name for the token
   * @param scopes - Array of permission scopes
   * @param expiresInDays - Optional expiration in days
   * @returns The generated token (plaintext) and token prefix
   */
  static async generateToken(
    userId: string,
    tokenName: string,
    scopes: string[] = ['read:contacts', 'write:contacts', 'read:interactions', 'write:interactions'],
    expiresInDays?: number
  ): Promise<{ token: string; tokenPrefix: string; tokenId: string }> {
    try {
      // Generate a secure random token (32 bytes = 64 hex chars)
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const randomHex = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

      const token = `wc_${randomHex}`;

      // Hash the token for storage using SHA-256 (never store plaintext!)
      const tokenHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        token
      );

      // Token prefix for display (like GitHub: ghp_abc123...)
      const tokenPrefix = token.substring(0, 11); // "wc_abc12345"

      // Calculate expiration
      const expiresAt = expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Store hashed token in database
      const { data, error } = await supabase
        .from('user_api_tokens')
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          token_name: tokenName,
          token_prefix: tokenPrefix,
          scopes: scopes,
          expires_at: expiresAt,
          is_active: true,
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Failed to create token:', error);
        throw new Error(`Failed to create token: ${error.message}`);
      }

      console.log('✅ API token generated:', tokenPrefix);

      // Return the PLAINTEXT token (user must save it - we won't show it again!)
      return {
        token,
        tokenPrefix,
        tokenId: data.id
      };
    } catch (error) {
      console.error('❌ Token generation failed:', error);
      throw error;
    }
  }

  /**
   * Validate a token and return user info
   *
   * @param token - The plaintext token to validate
   * @returns User ID, scopes, and token ID if valid, null otherwise
   */
  static async validateToken(token: string): Promise<TokenValidationResult | null> {
    try {
      // Hash the provided token
      const tokenHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        token
      );

      // Look up the token
      const { data, error } = await supabase
        .from('user_api_tokens')
        .select('id, user_id, scopes, expires_at, is_active, usage_count')
        .eq('token_hash', tokenHash)
        .single();

      if (error || !data) {
        console.log('⚠️ Token not found or invalid');
        return null;
      }

      // Check if token is active
      if (!data.is_active) {
        console.log('⚠️ Token is inactive');
        return null;
      }

      // Check if token is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        console.log('⚠️ Token has expired');
        return null;
      }

      // Update last used timestamp and usage count
      await supabase
        .from('user_api_tokens')
        .update({
          last_used_at: new Date().toISOString(),
          usage_count: data.usage_count + 1,
        })
        .eq('id', data.id);

      console.log('✅ Token validated for user:', data.user_id);

      return {
        userId: data.user_id,
        scopes: data.scopes,
        tokenId: data.id,
      };
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return null;
    }
  }

  /**
   * Revoke a token (set is_active to false)
   *
   * @param userId - User's ID
   * @param tokenId - Token ID to revoke
   */
  static async revokeToken(userId: string, tokenId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .update({ is_active: false })
        .eq('id', tokenId)
        .eq('user_id', userId); // Ensure user owns the token

      if (error) {
        console.error('❌ Failed to revoke token:', error);
        throw new Error(`Failed to revoke token: ${error.message}`);
      }

      console.log('✅ Token revoked:', tokenId);
    } catch (error) {
      console.error('❌ Token revocation failed:', error);
      throw error;
    }
  }

  /**
   * Delete a token permanently
   *
   * @param userId - User's ID
   * @param tokenId - Token ID to delete
   */
  static async deleteToken(userId: string, tokenId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .delete()
        .eq('id', tokenId)
        .eq('user_id', userId); // Ensure user owns the token

      if (error) {
        console.error('❌ Failed to delete token:', error);
        throw new Error(`Failed to delete token: ${error.message}`);
      }

      console.log('✅ Token deleted:', tokenId);
    } catch (error) {
      console.error('❌ Token deletion failed:', error);
      throw error;
    }
  }

  /**
   * List all tokens for a user
   *
   * @param userId - User's ID
   * @returns Array of tokens (without sensitive data)
   */
  static async listTokens(userId: string): Promise<APIToken[]> {
    try {
      const { data, error } = await supabase
        .from('user_api_tokens')
        .select('id, user_id, token_name, token_prefix, scopes, created_at, last_used_at, usage_count, expires_at, is_active, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to list tokens:', error);
        throw new Error(`Failed to list tokens: ${error.message}`);
      }

      console.log(`✅ Listed ${data?.length || 0} tokens`);

      return (data || []) as APIToken[];
    } catch (error) {
      console.error('❌ Token listing failed:', error);
      throw error;
    }
  }

  /**
   * Reactivate a revoked token
   *
   * @param userId - User's ID
   * @param tokenId - Token ID to reactivate
   */
  static async reactivateToken(userId: string, tokenId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .update({ is_active: true })
        .eq('id', tokenId)
        .eq('user_id', userId); // Ensure user owns the token

      if (error) {
        console.error('❌ Failed to reactivate token:', error);
        throw new Error(`Failed to reactivate token: ${error.message}`);
      }

      console.log('✅ Token reactivated:', tokenId);
    } catch (error) {
      console.error('❌ Token reactivation failed:', error);
      throw error;
    }
  }

  /**
   * Update token name
   *
   * @param userId - User's ID
   * @param tokenId - Token ID to update
   * @param newName - New token name
   */
  static async updateTokenName(userId: string, tokenId: string, newName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_api_tokens')
        .update({ token_name: newName })
        .eq('id', tokenId)
        .eq('user_id', userId); // Ensure user owns the token

      if (error) {
        console.error('❌ Failed to update token name:', error);
        throw new Error(`Failed to update token name: ${error.message}`);
      }

      console.log('✅ Token name updated:', tokenId);
    } catch (error) {
      console.error('❌ Token name update failed:', error);
      throw error;
    }
  }

  /**
   * Get token statistics
   *
   * @param userId - User's ID
   * @returns Token usage statistics
   */
  static async getTokenStats(userId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
    totalUsage: number;
  }> {
    try {
      const tokens = await this.listTokens(userId);

      const now = new Date();
      const stats = {
        total: tokens.length,
        active: tokens.filter(t => t.is_active).length,
        inactive: tokens.filter(t => !t.is_active).length,
        expired: tokens.filter(t => t.expires_at && new Date(t.expires_at) < now).length,
        totalUsage: tokens.reduce((sum, t) => sum + t.usage_count, 0),
      };

      console.log('✅ Token stats:', stats);

      return stats;
    } catch (error) {
      console.error('❌ Failed to get token stats:', error);
      throw error;
    }
  }

  /**
   * Check if a user has a valid scope
   *
   * @param scopes - User's scopes from token
   * @param requiredScope - Required scope to check
   * @returns True if user has the required scope
   */
  static hasScope(scopes: string[], requiredScope: string): boolean {
    return scopes.includes(requiredScope);
  }

  /**
   * Get available scopes
   */
  static getAvailableScopes(): Array<{ scope: string; description: string }> {
    return [
      { scope: 'read:contacts', description: 'Read contacts data' },
      { scope: 'write:contacts', description: 'Create, update, delete contacts' },
      { scope: 'read:interactions', description: 'Read interaction history' },
      { scope: 'write:interactions', description: 'Create, update, delete interactions' },
      { scope: 'read:profile', description: 'Read user profile information' },
      { scope: 'write:profile', description: 'Update user profile' },
    ];
  }
}
