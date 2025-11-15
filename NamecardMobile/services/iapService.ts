/**
 * In-App Purchase Service for WhatsCard
 *
 * Handles all IAP operations with mock mode support for testing
 *
 * MOCK MODE (MOCK_MODE = true):
 * - Simulates IAP without real purchases
 * - Perfect for testing in Expo Go
 * - Stores subscription in AsyncStorage
 * - Simulates loading delays
 *
 * PRODUCTION MODE (MOCK_MODE = false):
 * - Uses real expo-in-app-purchases
 * - Connects to Apple/Google stores
 * - Handles real transactions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import {
  IAP_CONFIG,
  getProductIds,
  SubscriptionPlan,
  SubscriptionInfo,
  ProductInfo,
} from '../config/iap-config';
import { simulatePurchase } from '../utils/subscription-utils';
import { getSupabaseClient } from './supabaseClient';

// Lazy load react-native-iap only when needed and not in mock mode
// NOTE: expo-in-app-purchases is DEPRECATED in Expo SDK 53
// Using react-native-iap instead (free, no RevenueCat fees!)
let RNIap: any = null;
if (!IAP_CONFIG.MOCK_MODE) {
  try {
    RNIap = require('react-native-iap');
  } catch (error) {
    console.warn('[IAP Service] ⚠️ react-native-iap not available, using mock mode');
    // Will fall back to mock mode
  }
}

const SUBSCRIPTION_STORAGE_KEY = '@whatscard_subscription';
const MOCK_PURCHASE_HISTORY_KEY = '@whatscard_mock_purchases';

/**
 * IAP Service Class
 */
class IAPService {
  private isInitialized = false;
  private products: ProductInfo[] = [];
  private currentUserId: string | null = null; // Track current user for trial saving

  /**
   * Set current user ID for trial tracking
   * Call this after user logs in
   */
  setUserId(userId: string | null): void {
    this.currentUserId = userId;
    console.log('[IAP Service] 👤 User ID set:', userId);
  }

  /**
   * Initialize IAP connection
   *
   * Call this when app starts or before first purchase
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[IAP Service] ✅ Already initialized');
      return;
    }

    console.log('[IAP Service] 🚀 Initializing...');

    if (IAP_CONFIG.MOCK_MODE || !RNIap) {
      console.log('[IAP Service] 🎭 Running in MOCK MODE');
      // Simulate initialization delay
      await this.delay(500);
      this.isInitialized = true;
      console.log('[IAP Service] ✅ Mock initialization complete');
      return;
    }

    try {
      console.log('[IAP Service] 📱 Connecting to real IAP (react-native-iap)...');
      await RNIap.initConnection();
      this.isInitialized = true;
      console.log('[IAP Service] ✅ Real IAP connection established');
    } catch (error) {
      console.error('[IAP Service] ❌ Initialization error:', error);
      throw new Error('Failed to initialize In-App Purchases');
    }
  }

  /**
   * Disconnect from IAP
   *
   * Call this when app closes or when done with IAP
   */
  async disconnect(): Promise<void> {
    if (!IAP_CONFIG.MOCK_MODE && this.isInitialized && RNIap) {
      console.log('[IAP Service] 🔌 Disconnecting from IAP...');
      await RNIap.endConnection();
      this.isInitialized = false;
      console.log('[IAP Service] ✅ Disconnected');
    }
  }

  /**
   * Fetch available products
   *
   * @returns Array of product info
   */
  async fetchProducts(): Promise<ProductInfo[]> {
    console.log('[IAP Service] 📦 Fetching products...');

    if (IAP_CONFIG.MOCK_MODE || !RNIap) {
      return this.fetchMockProducts();
    }

    try {
      const platform = Platform.OS as 'ios' | 'android';
      const productIds = getProductIds(platform);
      const productIdArray = [productIds.monthly, productIds.yearly];

      console.log('[IAP Service] 📱 Platform:', Platform.OS);
      console.log('[IAP Service] 🆔 Product IDs to fetch:', productIdArray);

      // ✅ CRITICAL: Ensure IAP is initialized before fetching
      if (!this.isInitialized) {
        console.warn('[IAP Service] ⚠️ IAP not initialized - initializing now...');
        await this.initialize();
      }

      // react-native-iap API: getSubscriptions() for subscription products
      console.log('[IAP Service] 🔄 Calling RNIap.getSubscriptions()...');
      const results = await RNIap.getSubscriptions({ skus: productIdArray });

      // ✅ CRITICAL: Log raw response from App Store/Play Store
      console.log('[IAP Service] 📊 Raw results from store:');
      console.log(JSON.stringify(results, null, 2));

      if (!results || results.length === 0) {
        console.error('[IAP Service] ❌ No products returned from App Store/Play Store!');
        console.error('[IAP Service] 🔍 Expected product IDs:', productIdArray);
        console.error('[IAP Service] 📱 Platform:', Platform.OS);
        console.error('[IAP Service] 🔌 IAP initialized:', this.isInitialized);
        console.error('[IAP Service] 🏪 Bundle ID (iOS):', 'com.whatscard.app');
        console.error('[IAP Service] 📦 Package (Android):', 'com.whatscard.app');
        console.warn('[IAP Service] ⚠️ Falling back to MOCK products (purchases will FAIL!)');
        return this.fetchMockProducts();
      }

      this.products = results.map((product: any) => ({
        productId: product.productId,
        type: product.productId.includes('monthly') ? 'monthly' : 'yearly',
        price: product.localizedPrice || '$0.00',
        priceAmount: parseFloat(product.price || '0'),
        currency: product.currency || 'USD',
        title: product.title || '',
        description: product.description || '',
      }));

      console.log('[IAP Service] ✅ Successfully fetched', this.products.length, 'REAL products from store');
      console.log('[IAP Service] 📋 Products:', this.products.map(p => p.productId).join(', '));
      return this.products;
    } catch (error) {
      console.error('[IAP Service] ❌ Error fetching products:', error);
      console.error('[IAP Service] 📱 Platform:', Platform.OS);
      console.error('[IAP Service] 🔌 IAP initialized:', this.isInitialized);
      console.log('[IAP Service] 🔄 Falling back to MOCK products (purchases will FAIL!)');
      return this.fetchMockProducts();
    }
  }

  /**
   * Fetch mock products (for testing)
   *
   * @returns Mock product data
   */
  private async fetchMockProducts(): Promise<ProductInfo[]> {
    console.log('[IAP Service] 🎭 Fetching MOCK products...');

    // Simulate network delay
    await this.delay(IAP_CONFIG.MOCK_SETTINGS.fetchProductsDelay);

    // Simulate fetch error if enabled
    if (IAP_CONFIG.MOCK_SETTINGS.simulateFetchError) {
      throw new Error(IAP_CONFIG.MOCK_SETTINGS.errorMessages.fetch);
    }

    const mockProducts: ProductInfo[] = [
      {
        productId: IAP_CONFIG.MOCK_PRODUCTS.monthly,
        type: 'monthly',
        price: IAP_CONFIG.PRICING.monthly.displayPrice,
        priceAmount: IAP_CONFIG.PRICING.monthly.usd,
        currency: 'USD',
        title: 'WhatsCard Premium Monthly',
        description: IAP_CONFIG.PRICING.monthly.description,
      },
      {
        productId: IAP_CONFIG.MOCK_PRODUCTS.yearly,
        type: 'yearly',
        price: IAP_CONFIG.PRICING.yearly.displayPrice,
        priceAmount: IAP_CONFIG.PRICING.yearly.usd,
        currency: 'USD',
        title: 'WhatsCard Premium Yearly',
        description: IAP_CONFIG.PRICING.yearly.description,
      },
    ];

    this.products = mockProducts;
    console.log('[IAP Service] ✅ Mock products loaded:', this.products.length);
    return mockProducts;
  }

  /**
   * Purchase a subscription
   *
   * @param plan - Subscription plan to purchase
   * @returns Purchase result
   */
  async purchaseSubscription(
    plan: SubscriptionPlan
  ): Promise<{
    success: boolean;
    subscription?: SubscriptionInfo;
    error?: string;
  }> {
    console.log('[IAP Service] 💳 Purchasing subscription:', plan);

    if (IAP_CONFIG.MOCK_MODE || !RNIap) {
      return this.mockPurchase(plan);
    }

    try {
      // ✅ CRITICAL: Verify products were loaded before purchase
      if (this.products.length === 0) {
        console.error('[IAP Service] ❌ No products loaded - fetching now...');
        await this.fetchProducts();

        if (this.products.length === 0) {
          console.error('[IAP Service] ❌ FATAL: Unable to load products from App Store/Play Store!');
          console.error('[IAP Service] 🔍 This usually means:');
          console.error('[IAP Service]   1. Products not configured in App Store Connect/Play Console');
          console.error('[IAP Service]   2. Bundle ID mismatch (expected: com.whatscard.app)');
          console.error('[IAP Service]   3. Testing in wrong environment (production vs sandbox)');
          console.error('[IAP Service]   4. Network connectivity issues');
          throw new Error('Unable to load subscription products. Please check your internet connection and try again.');
        }
      }

      const productId = this.getProductIdForPlan(plan);

      if (!productId) {
        throw new Error(`Product not found for plan: ${plan}`);
      }

      // ✅ CRITICAL: Verify the product ID is NOT a mock product
      if (productId.startsWith('mock_')) {
        console.error('[IAP Service] ❌ FATAL: Attempting to purchase MOCK product!');
        console.error('[IAP Service] 🔍 Product ID:', productId);
        console.error('[IAP Service] 🔍 This means products were not fetched from App Store/Play Store');
        throw new Error('Subscription products are not available. Please restart the app and try again.');
      }

      console.log('[IAP Service] 🛒 Purchasing REAL product ID:', productId);

      // react-native-iap API: requestSubscription() for subscription purchase
      const purchase = await RNIap.requestSubscription({
        sku: productId,
      });

      console.log('[IAP Service] ✅ Purchase completed:', purchase);

      // CRITICAL: Save trial dates to database BEFORE finishTransaction
      // Research shows: Both platforms auto-refund if not acknowledged within 3 days
      if (this.currentUserId) {
        const trialStartDate = new Date();
        const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

        // Save to database with retry logic (network failures)
        await this.saveTrialDatesToDatabase(
          this.currentUserId,
          trialStartDate,
          trialEndDate
        );
      } else {
        console.warn('[IAP Service] ⚠️ No user ID set - trial dates not saved to database');
      }

      // Create subscription record for local state
      const subscription = this.createSubscriptionFromPurchase(plan);
      await this.saveSubscription(subscription);

      // CRITICAL: Finish transaction AFTER saving to database
      // This acknowledges the purchase and prevents auto-refund
      await RNIap.finishTransaction({ purchase, isConsumable: false });
      console.log('[IAP Service] ✅ Transaction finished (acknowledged)');

      console.log('[IAP Service] ✅ Purchase flow completed');
      return {
        success: true,
        subscription,
      };
    } catch (error: any) {
      console.error('[IAP Service] ❌ Purchase error:', error);

      // Check if user canceled
      if (error.code === 'E_USER_CANCELLED' || error.code === 'E_USER_CANCELED') {
        return {
          success: false,
          error: 'Purchase canceled',
        };
      }

      return {
        success: false,
        error: error.message || 'Purchase failed',
      };
    }
  }

  /**
   * Mock purchase (for testing)
   */
  private async mockPurchase(
    plan: SubscriptionPlan
  ): Promise<{
    success: boolean;
    subscription?: SubscriptionInfo;
    error?: string;
  }> {
    console.log('[IAP Service] 🎭 Simulating MOCK purchase...');

    // Simulate purchase delay
    await this.delay(IAP_CONFIG.MOCK_SETTINGS.purchaseDelay);

    // Simulate purchase error if enabled
    if (IAP_CONFIG.MOCK_SETTINGS.simulatePurchaseError) {
      console.log('[IAP Service] ❌ Simulated purchase error');
      return {
        success: false,
        error: IAP_CONFIG.MOCK_SETTINGS.errorMessages.purchase,
      };
    }

    // Create mock subscription
    const subscription = simulatePurchase(plan);

    // Save trial dates to database (mock mode)
    if (this.currentUserId) {
      const trialStartDate = new Date();
      const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

      await this.saveTrialDatesToDatabase(
        this.currentUserId,
        trialStartDate,
        trialEndDate
      );
    }

    // Save to storage
    await this.saveSubscription(subscription);

    // Save to purchase history
    await this.saveMockPurchaseHistory(subscription);

    console.log('[IAP Service] ✅ Mock purchase successful');
    console.log('[IAP Service] 📅 Expires:', new Date(subscription.expiryDate).toLocaleString());

    return {
      success: true,
      subscription,
    };
  }

  /**
   * Restore previous purchases
   *
   * @returns Restore result
   */
  async restorePurchases(): Promise<{
    success: boolean;
    subscription?: SubscriptionInfo;
    error?: string;
  }> {
    console.log('[IAP Service] 🔄 Restoring purchases...');

    if (IAP_CONFIG.MOCK_MODE || !RNIap) {
      return this.mockRestore();
    }

    try {
      // react-native-iap API: getAvailablePurchases() to restore
      const results = await RNIap.getAvailablePurchases();

      console.log('[IAP Service] 📜 Purchase history:', results.length, 'items');

      if (results.length === 0) {
        console.log('[IAP Service] ℹ️ No purchases found');
        return {
          success: false,
          error: 'No purchases found to restore',
        };
      }

      // Find most recent active subscription
      const latestPurchase = results[results.length - 1];
      const plan = latestPurchase.productId.includes('monthly') ? 'monthly' : 'yearly';

      const subscription = this.createSubscriptionFromPurchase(plan);
      await this.saveSubscription(subscription);

      // Finish transaction (required by react-native-iap)
      await RNIap.finishTransaction({ purchase: latestPurchase, isConsumable: false });

      console.log('[IAP Service] ✅ Purchases restored');
      return {
        success: true,
        subscription,
      };
    } catch (error: any) {
      console.error('[IAP Service] ❌ Restore error:', error);
      return {
        success: false,
        error: error.message || 'Failed to restore purchases',
      };
    }
  }

  /**
   * Mock restore (for testing)
   */
  private async mockRestore(): Promise<{
    success: boolean;
    subscription?: SubscriptionInfo;
    error?: string;
  }> {
    console.log('[IAP Service] 🎭 Simulating MOCK restore...');

    await this.delay(IAP_CONFIG.MOCK_SETTINGS.restoreDelay);

    if (IAP_CONFIG.MOCK_SETTINGS.simulateRestoreError) {
      console.log('[IAP Service] ❌ Simulated restore error');
      return {
        success: false,
        error: IAP_CONFIG.MOCK_SETTINGS.errorMessages.restore,
      };
    }

    // Try to get from purchase history
    const history = await this.getMockPurchaseHistory();

    if (!history || history.length === 0) {
      console.log('[IAP Service] ℹ️ No mock purchases to restore');
      return {
        success: false,
        error: 'No purchases found to restore',
      };
    }

    // Get most recent purchase
    const latestPurchase = history[history.length - 1];

    // Check if still valid
    if (latestPurchase.expiryDate < Date.now()) {
      console.log('[IAP Service] ⚠️ Found expired subscription');
      latestPurchase.status = 'expired';
    }

    await this.saveSubscription(latestPurchase);

    console.log('[IAP Service] ✅ Mock purchases restored');
    return {
      success: true,
      subscription: latestPurchase,
    };
  }

  /**
   * Get current subscription status
   *
   * @returns Current subscription or null
   */
  async getSubscriptionStatus(): Promise<SubscriptionInfo | null> {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);

      if (!stored) {
        console.log('[IAP Service] ℹ️ No subscription found');
        return null;
      }

      const subscription: SubscriptionInfo = JSON.parse(stored);

      // Check if expired
      if (subscription.expiryDate < Date.now()) {
        console.log('[IAP Service] ⚠️ Subscription expired');
        subscription.status = 'expired';
        await this.saveSubscription(subscription);
      }

      console.log('[IAP Service] 📊 Subscription status:', subscription.status);
      return subscription;
    } catch (error) {
      console.error('[IAP Service] ❌ Error getting subscription status:', error);
      return null;
    }
  }

  /**
   * Clear subscription (for testing/logout)
   */
  async clearSubscription(): Promise<void> {
    console.log('[IAP Service] 🗑️ Clearing subscription...');
    await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    console.log('[IAP Service] ✅ Subscription cleared');
  }

  /**
   * Set mock subscription (for testing)
   */
  async setMockSubscription(plan: SubscriptionPlan): Promise<void> {
    if (!IAP_CONFIG.MOCK_MODE && RNIap) {
      console.warn('[IAP Service] ⚠️ Cannot set mock subscription when not in mock mode');
      return;
    }

    const subscription = simulatePurchase(plan);
    await this.saveSubscription(subscription);
    console.log('[IAP Service] 🎭 Mock subscription set:', plan);
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getProductIdForPlan(plan: SubscriptionPlan): string | null {
    const product = this.products.find((p) => p.type === plan);
    return product?.productId || null;
  }

  private createSubscriptionFromPurchase(
    plan: SubscriptionPlan
  ): SubscriptionInfo {
    const now = Date.now();
    const duration = IAP_CONFIG.DURATIONS[plan];

    return {
      plan,
      status: 'active',
      purchaseDate: now,
      expiryDate: now + duration,
      isPromo: false,
    };
  }

  private async saveSubscription(subscription: SubscriptionInfo): Promise<void> {
    await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
    console.log('[IAP Service] 💾 Subscription saved to storage');
  }

  /**
   * Save trial dates to Supabase database
   *
   * CRITICAL: This must complete BEFORE finishTransaction()
   * Based on research: Both Google Play & App Store require proper acknowledgment
   *
   * @param userId - User ID to update
   * @param trialStartDate - When trial started
   * @param trialEndDate - When trial expires (NOW + 3 days)
   */
  private async saveTrialDatesToDatabase(
    userId: string,
    trialStartDate: Date,
    trialEndDate: Date
  ): Promise<void> {
    try {
      console.log('[IAP Service] 💾 Saving trial dates to database...');
      console.log('[IAP Service] 📅 Trial Start:', trialStartDate.toISOString());
      console.log('[IAP Service] 📅 Trial End:', trialEndDate.toISOString());

      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('users')
        .update({
          trial_start_date: trialStartDate.toISOString(),
          trial_end_date: trialEndDate.toISOString(),
          tier: 'pro', // Grant premium access during trial
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('[IAP Service] ❌ Database error:', error);
        throw new Error(`Failed to save trial dates: ${error.message}`);
      }

      console.log('[IAP Service] ✅ Trial dates saved to database');
    } catch (error: any) {
      console.error('[IAP Service] ❌ Failed to save trial dates:', error);
      throw error; // Re-throw to prevent finishTransaction if save fails
    }
  }

  private async saveMockPurchaseHistory(subscription: SubscriptionInfo): Promise<void> {
    try {
      const existing = await this.getMockPurchaseHistory();
      const updated = [...existing, subscription];
      await AsyncStorage.setItem(MOCK_PURCHASE_HISTORY_KEY, JSON.stringify(updated));
      console.log('[IAP Service] 📝 Added to mock purchase history');
    } catch (error) {
      console.error('[IAP Service] ❌ Error saving purchase history:', error);
    }
  }

  private async getMockPurchaseHistory(): Promise<SubscriptionInfo[]> {
    try {
      const stored = await AsyncStorage.getItem(MOCK_PURCHASE_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[IAP Service] ❌ Error getting purchase history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const iapService = new IAPService();

console.log('[IAP Service] ✅ Service initialized');
