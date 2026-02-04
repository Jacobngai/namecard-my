/**
 * In-App Purchase Configuration for WhatsCard
 *
 * MOCK MODE:
 * - Set MOCK_MODE to true for testing in Expo Go and development
 * - Mock mode simulates IAP without real purchases
 * - Perfect for UI/UX testing and flow validation
 *
 * PRODUCTION MODE:
 * - Set MOCK_MODE to false when ready for production
 * - Update PRODUCTS.ios and PRODUCTS.android with real product IDs
 * - Real product IDs come from App Store Connect and Google Play Console
 */

import { Platform } from 'react-native';

export const IAP_CONFIG = {
  /**
   * MOCK MODE TOGGLE
   *
   * true  = Use mock data (perfect for Expo Go testing and web)
   * false = Use real IAP (requires production build on native platforms)
   *
   * IMPORTANT: Auto-enabled on web platform (IAP doesn't work on web)
   */
  MOCK_MODE: Platform.OS === 'web' ? true : false,

  /**
   * MOCK PRODUCT IDs
   * Used when MOCK_MODE is true
   * These simulate real product IDs for testing
   */
  MOCK_PRODUCTS: {
    // 🟢 Basic Plan
    basic_monthly: 'mock_whatscard_basic_monthly',
    basic_yearly: 'mock_whatscard_basic_yearly',
    // 🟡 Premium Plan (Default)
    monthly: 'mock_whatscard_monthly_premium',
    yearly: 'mock_whatscard_yearly_premium',
  },

  /**
   * REAL PRODUCT IDs
   *
   * iOS App Store Connect:
   * - App ID: 6754809694
   * - Bundle ID: com.alittlebetter.alittlebetter
   * - Subscription Group: Premium Access (21821977)
   * - Product IDs: See below
   *
   * Android Google Play Console:
   * - Package Name: com.resultmarketing.whatscard
   * - Developer Account: Drinking Monster (6055773806895794556)
   * - Service Fee: 15%
   * - Product IDs: See below
   *
   * NOTE: You need to create these product IDs in App Store Connect & Play Console:
   * - whatscard_basic_monthly ($5.95/month)
   * - whatscard_basic_yearly ($71.50/year)
   * - whatscard_premium_monthly ($9.95/month)
   * - whatscard_premium_yearly ($119.40/year)
   */
  PRODUCTS: {
    ios: {
      // 🟢 Basic Plan
      basic_monthly: 'whatscard_basic_monthly',      // TODO: Create in App Store Connect
      basic_yearly: 'whatscard_basic_yearly',        // TODO: Create in App Store Connect
      // 🟡 Premium Plan (Current - Already exists)
      monthly: 'whatscard_premium_monthly',          // Existing product
      yearly: 'whatscard_premium_yearly',            // Existing product
    },
    android: {
      // 🟢 Basic Plan
      basic_monthly: 'basic_monthly_subscription',   // TODO: Create in Play Console
      basic_yearly: 'basic_yearly_subscription',     // TODO: Create in Play Console
      // 🟡 Premium Plan (Current - Already exists)
      monthly: 'monthly_premium_subscription',       // OLD Product ID (Active in Play Console)
      yearly: 'yearly_premium_subscription',         // OLD Product ID (Active in Play Console)
    },
  },

  /**
   * PROMO CODES
   *
   * Define promotional codes and their discounts
   * discount: 0.70 = 70% off
   * applicableTo: which plan the promo applies to
   */
  PROMO_CODES: {
    WHATSBNI: {
      code: 'WHATSBNI',
      discount: 0.70, // 70% off
      applicableTo: 'yearly' as 'monthly' | 'yearly',
      description: '70% off yearly subscription',
    },
  },

  /**
   * PRICING STRUCTURE
   *
   * 🟢 BASIC PLAN:
   * - Scan name cards
   * - Save contacts to cloud (Supabase)
   * - Export saved contacts
   * - Monthly: $5.95 USD
   * - Yearly: $71.50 USD (Save 17%)
   *
   * 🟡 PREMIUM PLAN:
   * - Everything in Basic Plan
   * - AI Chatbot (ask questions about contacts)
   * - Smart contact insights & analytics
   * - Monthly: $9.95 USD
   * - Yearly: $119.40 USD (Save 17%)
   *
   * Note: Both platforms use the same pricing for consistency.
   * Actual prices will be fetched from app stores.
   * Promo codes are applied manually by users, not automatically.
   */
  PRICING: {
    // 🟢 BASIC PLAN
    basic_monthly: {
      usd: 5.95,
      displayPrice: '$5.95',
      period: 'month',
      description: 'Scan & save contacts',
      tier: 'basic',
    },
    basic_yearly: {
      usd: 71.99,
      displayPrice: '$71.99',
      period: 'year',
      description: 'Save 17% annually',
      savings: 17, // ($5.95/month x 12 = $71.40, yearly = $71.99)
      tier: 'basic',
      badge: 'BEST VALUE',
    },
    // 🟡 PREMIUM PLAN
    monthly: {
      usd: 9.99,
      displayPrice: '$9.99',
      period: 'month',
      description: 'AI insights & analytics',
      tier: 'premium',
      badge: 'POPULAR',
    },
    yearly: {
      usd: 119.99,
      displayPrice: '$119.99',
      period: 'year',
      description: 'Best value - Save 17%',
      savings: 17, // ($9.99/month x 12 = $119.88, yearly = $119.99)
      tier: 'premium',
      badge: 'BEST VALUE',
    },
    yearlyWithPromo: {
      usd: 36.00,  // 70% off $119.99 (only when user manually applies WHATSBNI promo code)
      displayPrice: '$36.00',
      period: 'year',
      description: 'Special offer - 70% off',
      tier: 'premium',
    },
  },

  /**
   * SUBSCRIPTION FEATURES BY TIER
   *
   * 🟢 BASIC PLAN Features
   * 🟡 PREMIUM PLAN Features (includes all Basic + additional features)
   */
  FEATURES: {
    // 🟢 BASIC PLAN FEATURES
    basic: [
      {
        id: 'card_scanning',
        icon: 'camera',
        title: 'Scan Name Cards',
        description: 'AI-powered OCR to digitize business cards',
        tier: 'basic',
      },
      {
        id: 'cloud_storage',
        icon: 'cloud',
        title: 'Save to Cloud',
        description: 'Securely store contacts in Supabase cloud',
        tier: 'basic',
      },
      {
        id: 'export_contacts',
        icon: 'download',
        title: 'Export Contacts',
        description: 'Export saved contacts to Excel or CSV',
        tier: 'basic',
      },
    ],
    // 🟡 PREMIUM PLAN FEATURES (includes Basic + these)
    premium: [
      {
        id: 'ai_chatbot',
        icon: 'chatbubbles',
        title: 'AI Chatbot',
        description: 'Ask questions about your contacts using AI',
        tier: 'premium',
        badge: 'NEW',
      },
      {
        id: 'smart_insights',
        icon: 'analytics',
        title: 'Smart Insights',
        description: 'Get intelligent contact analytics & suggestions',
        tier: 'premium',
        badge: 'NEW',
      },
      {
        id: 'contact_analytics',
        icon: 'stats-chart',
        title: 'Contact Analytics',
        description: 'Track interactions and engagement metrics',
        tier: 'premium',
      },
    ],
    // All features combined (for marketing display)
    all: [
      {
        id: 'card_scanning',
        icon: 'camera',
        title: 'Scan Name Cards',
        description: 'AI-powered OCR to digitize business cards',
        tier: 'basic',
      },
      {
        id: 'cloud_storage',
        icon: 'cloud',
        title: 'Save to Cloud',
        description: 'Securely store contacts in Supabase cloud',
        tier: 'basic',
      },
      {
        id: 'export_contacts',
        icon: 'download',
        title: 'Export Contacts',
        description: 'Export saved contacts to Excel or CSV',
        tier: 'basic',
      },
      {
        id: 'ai_chatbot',
        icon: 'chatbubbles',
        title: 'AI Chatbot',
        description: 'Ask questions about your contacts',
        tier: 'premium',
        badge: 'PREMIUM',
      },
      {
        id: 'smart_insights',
        icon: 'analytics',
        title: 'Smart Insights & Analytics',
        description: 'Intelligent contact analytics',
        tier: 'premium',
        badge: 'PREMIUM',
      },
    ],
  },

  /**
   * FREE TIER LIMITS
   *
   * Limits for free users (to encourage upgrades)
   */
  FREE_TIER: {
    maxScans: 10,
    maxContacts: 50,
    features: ['basic_scan', 'manual_entry', 'basic_export'],
  },

  /**
   * SUBSCRIPTION DURATIONS
   *
   * For simulating subscription expiry in mock mode
   */
  DURATIONS: {
    basic_monthly: 30 * 24 * 60 * 60 * 1000,  // 30 days in milliseconds
    basic_yearly: 365 * 24 * 60 * 60 * 1000,   // 365 days in milliseconds
    monthly: 30 * 24 * 60 * 60 * 1000,         // 30 days in milliseconds
    yearly: 365 * 24 * 60 * 60 * 1000,         // 365 days in milliseconds
  },

  /**
   * MOCK BEHAVIOR SETTINGS
   *
   * Customize mock behavior for testing different scenarios
   */
  MOCK_SETTINGS: {
    // Simulate loading delay (in ms)
    fetchProductsDelay: 2000,
    purchaseDelay: 1500,
    restoreDelay: 1000,

    // Simulate errors (for testing error handling)
    simulateFetchError: false,
    simulatePurchaseError: false,
    simulateRestoreError: false,

    // Error messages for testing
    errorMessages: {
      fetch: 'Failed to fetch products. Please check your connection.',
      purchase: 'Purchase failed. Please try again.',
      restore: 'No purchases found to restore.',
      network: 'Network error. Please check your internet connection.',
      canceled: 'Purchase canceled by user.',
    },
  },
} as const;

/**
 * TYPE DEFINITIONS
 */
export type SubscriptionPlan = 'monthly' | 'yearly' | 'basic_monthly' | 'basic_yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'pending';

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiryDate: number; // timestamp
  purchaseDate: number; // timestamp
  isPromo: boolean;
  promoCode?: string;
}

export interface ProductInfo {
  productId: string;
  type: SubscriptionPlan;
  price: string;
  priceAmount: number;
  currency: string;
  title: string;
  description: string;
}

/**
 * HELPER FUNCTION
 * Get product IDs based on platform and mock mode
 */
export const getProductIds = (platform: 'ios' | 'android' = 'ios'): {
  basic_monthly: string;
  basic_yearly: string;
  monthly: string;
  yearly: string;
} => {
  if (IAP_CONFIG.MOCK_MODE) {
    console.log('[IAP Config] 🎭 Using MOCK product IDs');
    return IAP_CONFIG.MOCK_PRODUCTS;
  }

  console.log(`[IAP Config] 📱 Using REAL ${platform.toUpperCase()} product IDs`);
  return IAP_CONFIG.PRODUCTS[platform];
};

/**
 * VALIDATION HELPERS
 */
export const isValidPromoCode = (code: string): boolean => {
  return code.toUpperCase() in IAP_CONFIG.PROMO_CODES;
};

export const getPromoDiscount = (code: string, plan: SubscriptionPlan): number => {
  const promo = IAP_CONFIG.PROMO_CODES[code.toUpperCase() as keyof typeof IAP_CONFIG.PROMO_CODES];
  if (!promo) return 0;
  if (promo.applicableTo !== plan) return 0;
  return promo.discount;
};

export const calculatePromoPrice = (originalPrice: number, code: string, plan: SubscriptionPlan): number => {
  const discount = getPromoDiscount(code, plan);
  return originalPrice * (1 - discount);
};

console.log('[IAP Config] ⚙️ Configuration loaded');
console.log(`[IAP Config] Mock Mode: ${IAP_CONFIG.MOCK_MODE ? '✅ ENABLED' : '❌ DISABLED'}`);
