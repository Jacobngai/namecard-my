/**
 * Subscription Check Service for WhatsCard
 *
 * Handles checking user subscription status and premium access
 */

import { getSupabaseClient } from './supabaseClient';

export interface SubscriptionInfo {
  isPremium: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  subscriptionEnd: string | null;
  daysRemaining: number;
}

class SubscriptionCheckService {
  /**
   * Check if user is a premium subscriber
   * @param userId - User ID to check
   * @returns true if user has active premium subscription
   */
  async isPremiumUser(userId: string): Promise<boolean> {
    try {
      console.log('[SubscriptionCheck] Checking premium status for:', userId);

      const supabase = getSupabaseClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('tier, subscription_end')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('[SubscriptionCheck] Error fetching user:', error);
        return false;
      }

      // Check if user has premium tier
      if (user.tier === 'free' || !user.tier) {
        return false;
      }

      // Check if subscription is still valid
      if (user.subscription_end) {
        const subscriptionEnd = new Date(user.subscription_end);
        const now = new Date();

        if (subscriptionEnd > now) {
          console.log('[SubscriptionCheck] ✅ Premium user - valid subscription');
          return true;
        } else {
          console.log('[SubscriptionCheck] ⚠️ Subscription expired');
          return false;
        }
      }

      // If no subscription_end but tier is pro/enterprise, consider as premium
      // (for lifetime subscriptions or manual assignments)
      return user.tier === 'pro' || user.tier === 'enterprise';
    } catch (err) {
      console.error('[SubscriptionCheck] Error:', err);
      return false;
    }
  }

  /**
   * Get detailed subscription information
   * @param userId - User ID to check
   * @returns Complete subscription info
   */
  async getUserSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
    try {
      const supabase = getSupabaseClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('tier, subscription_end')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return {
          isPremium: false,
          tier: 'free',
          subscriptionEnd: null,
          daysRemaining: 0,
        };
      }

      const isPremium = await this.isPremiumUser(userId);

      let daysRemaining = 0;
      if (user.subscription_end) {
        const subscriptionEnd = new Date(user.subscription_end);
        const now = new Date();
        const diffTime = subscriptionEnd.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = Math.max(0, daysRemaining);
      }

      return {
        isPremium,
        tier: user.tier || 'free',
        subscriptionEnd: user.subscription_end,
        daysRemaining,
      };
    } catch (err) {
      console.error('[SubscriptionCheck] Error getting subscription info:', err);
      return {
        isPremium: false,
        tier: 'free',
        subscriptionEnd: null,
        daysRemaining: 0,
      };
    }
  }

  /**
   * Determine if paywall should be shown to user
   * @param userId - User ID to check
   * @returns true if paywall should be shown
   */
  async shouldShowPaywall(userId: string): Promise<boolean> {
    const isPremium = await this.isPremiumUser(userId);
    // Show paywall for non-premium users
    return !isPremium;
  }

  /**
   * Update user subscription (after purchase)
   * @param userId - User ID
   * @param tier - Subscription tier
   * @param durationMonths - Subscription duration in months
   */
  async updateSubscription(
    userId: string,
    tier: 'pro' | 'enterprise',
    durationMonths: number
  ): Promise<boolean> {
    try {
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + durationMonths);

      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('users')
        .update({
          tier,
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('[SubscriptionCheck] Error updating subscription:', error);
        return false;
      }

      console.log('[SubscriptionCheck] ✅ Subscription updated:', { tier, subscriptionEnd });
      return true;
    } catch (err) {
      console.error('[SubscriptionCheck] Error:', err);
      return false;
    }
  }
}

export const subscriptionCheckService = new SubscriptionCheckService();

console.log('[subscriptionCheckService] ✅ Service initialized');
