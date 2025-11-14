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

export interface TrialStatus {
  hasTrialRecord: boolean; // User has trial_start_date (used trial before)
  isTrialActive: boolean; // Trial is currently active (trial_end_date > NOW)
  isTrialExpired: boolean; // Trial has expired (trial_end_date < NOW)
  trialStartDate: string | null;
  trialEndDate: string | null;
  daysRemaining: number; // Days left in trial (0 if expired)
}

class SubscriptionCheckService {
  /**
   * Check if user is a premium subscriber (includes trial users)
   *
   * CRITICAL LOGIC (Based on Research):
   * 1. Check trial status FIRST (trial_end_date > NOW)
   * 2. If on active trial → return TRUE
   * 3. If trial expired → check paid subscription
   * 4. Users keep access until trial_end_date (even if canceled)
   *
   * @param userId - User ID to check
   * @returns true if user has active trial OR active subscription
   */
  async isPremiumUser(userId: string): Promise<boolean> {
    try {
      console.log('[SubscriptionCheck] Checking premium status for:', userId);

      const supabase = getSupabaseClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('tier, subscription_end, trial_start_date, trial_end_date')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('[SubscriptionCheck] Error fetching user:', error);
        return false;
      }

      const now = new Date();

      // ✅ PRIORITY 1: Check active trial status FIRST
      // Research: User keeps access until trial_end_date (even if canceled)
      if (user.trial_end_date) {
        const trialEnd = new Date(user.trial_end_date);

        if (trialEnd > now) {
          console.log('[SubscriptionCheck] ✅ User on ACTIVE TRIAL');
          console.log('[SubscriptionCheck] 📅 Trial expires:', trialEnd.toISOString());
          return true; // Active trial = premium access
        } else {
          console.log('[SubscriptionCheck] ⚠️ Trial EXPIRED');
          console.log('[SubscriptionCheck] 📅 Trial expired:', trialEnd.toISOString());
          // Fall through to check paid subscription
        }
      }

      // ✅ PRIORITY 2: Check paid subscription (after trial check)
      if (user.tier === 'free' || !user.tier) {
        console.log('[SubscriptionCheck] ❌ Free tier user - no active subscription');
        return false;
      }

      // Check if subscription is still valid
      if (user.subscription_end) {
        const subscriptionEnd = new Date(user.subscription_end);

        if (subscriptionEnd > now) {
          console.log('[SubscriptionCheck] ✅ Valid PAID subscription');
          console.log('[SubscriptionCheck] 📅 Subscription expires:', subscriptionEnd.toISOString());
          return true;
        } else {
          console.log('[SubscriptionCheck] ⚠️ Subscription EXPIRED');
          return false;
        }
      }

      // If no subscription_end but tier is pro/enterprise, consider as premium
      // (for lifetime subscriptions or manual assignments)
      const hasLifetime = user.tier === 'pro' || user.tier === 'enterprise';
      if (hasLifetime) {
        console.log('[SubscriptionCheck] ✅ Lifetime subscription');
      }
      return hasLifetime;
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
   * Get trial status for user
   *
   * CRITICAL: Use this to determine if PaywallScreen should show
   * "Start Free Trial" vs "Subscribe Now" button
   *
   * @param userId - User ID to check
   * @returns Complete trial status information
   */
  async getTrialStatus(userId: string): Promise<TrialStatus> {
    try {
      const supabase = getSupabaseClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('trial_start_date, trial_end_date')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('[SubscriptionCheck] Error fetching trial status:', error);
        return {
          hasTrialRecord: false,
          isTrialActive: false,
          isTrialExpired: false,
          trialStartDate: null,
          trialEndDate: null,
          daysRemaining: 0,
        };
      }

      const now = new Date();
      const hasTrialRecord = user.trial_start_date !== null;
      let isTrialActive = false;
      let isTrialExpired = false;
      let daysRemaining = 0;

      if (user.trial_end_date) {
        const trialEnd = new Date(user.trial_end_date);
        isTrialActive = trialEnd > now;
        isTrialExpired = trialEnd <= now;

        if (isTrialActive) {
          const diffTime = trialEnd.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      console.log('[SubscriptionCheck] 📊 Trial status:', {
        hasTrialRecord,
        isTrialActive,
        isTrialExpired,
        daysRemaining,
      });

      return {
        hasTrialRecord,
        isTrialActive,
        isTrialExpired,
        trialStartDate: user.trial_start_date,
        trialEndDate: user.trial_end_date,
        daysRemaining,
      };
    } catch (err) {
      console.error('[SubscriptionCheck] Error getting trial status:', err);
      return {
        hasTrialRecord: false,
        isTrialActive: false,
        isTrialExpired: false,
        trialStartDate: null,
        trialEndDate: null,
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
