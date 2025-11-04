/**
 * Android In-App Purchase Configuration for WhatsCard
 *
 * Google Play Console Credentials and Configuration
 *
 * ⚠️ SECURITY WARNING:
 * This file contains sensitive credentials. Never commit to public repositories.
 * Add to .gitignore and use environment variables in production.
 */

export const ANDROID_IAP_CONFIG = {
  /**
   * Google Play Console Information
   */
  playConsole: {
    packageName: 'com.resultmarketing.whatscard',
    developerAccount: 'Drinking Monster',
    developerAccountId: '6055773806895794556',
    serviceFee: 0.15, // 15% (enrolled in reduced service fee program)
  },

  /**
   * Product IDs
   */
  products: {
    monthly: {
      productId: 'monthly_premium_subscription',
      price: 9.95,
      displayPrice: '$9.95',
      priceMicros: 9950000, // $9.95 in micros (price * 1,000,000)
      currency: 'USD',
      period: 'P1M', // 1 month
      title: 'Monthly Premium',
      description: 'Premium features billed monthly',
    },
    yearly: {
      productId: 'yearly_premium_subscription',
      price: 117.99,
      displayPrice: '$117.99',
      priceMicros: 117990000, // $117.99 in micros
      currency: 'USD',
      period: 'P1Y', // 1 year
      title: 'Yearly Premium - Best Value!',
      description: 'Premium features billed yearly - Save 20%!',
      badge: 'BEST VALUE',
    },
  },

  /**
   * Promotional Offer Configuration
   */
  promotionalOffers: {
    WHATSBNI: {
      offerId: 'WHATSBNI',
      promoCode: 'WHATSBNI',
      offerType: 'promotional',
      discount: 0.70, // 70% off
      applicableTo: 'yearly_premium_subscription',
      pricing: {
        price: 35.40, // $117.99 * 0.30
        displayPrice: '$35.40',
        priceMicros: 35400000,
        currency: 'USD',
      },
      duration: 'ongoing',
      eligibility: 'new_subscribers', // recommended
      description: '70% off yearly subscription',
    },
  },

  /**
   * License Key (Base64 Encoded Public Key)
   *
   * ⚠️ CRITICAL: This key is used for receipt verification
   * SECURITY: This secret is now loaded from environment variables
   *
   * The value below is a fallback for development only.
   * In production, you MUST set ANDROID_PLAY_LICENSE_KEY in your environment.
   */
  licenseKey: process.env.ANDROID_PLAY_LICENSE_KEY || '',

  /**
   * Billing Permission
   */
  permissions: ['com.android.vending.BILLING'],

  /**
   * Testing Configuration
   */
  testing: {
    licenseTesterEmails: [
      // Add tester email addresses here
      // Testers can make test purchases without being charged
    ],
    testingTrack: 'internal', // or 'closed', 'open'
  },

  /**
   * JSON Configuration for Play Console
   * (Used when creating products manually)
   */
  playConsoleJSON: {
    monthly: {
      productId: 'monthly_premium_subscription',
      type: 'subs',
      price: '$9.95',
      price_amount_micros: 9950000,
      price_currency_code: 'USD',
      subscription_period: 'P1M',
      title: 'Monthly Premium',
      description: 'Premium features billed monthly',
    },
    yearly: {
      productId: 'yearly_premium_subscription',
      type: 'subs',
      price: '$117.99',
      price_amount_micros: 117990000,
      price_currency_code: 'USD',
      subscription_period: 'P1Y',
      title: 'Yearly Premium',
      description: 'Premium features billed yearly - Best Value!',
    },
    promoOffer: {
      productId: 'yearly_premium_subscription',
      offerId: 'WHATSBNI',
      promoCode: 'WHATSBNI',
      offerType: 'promotional',
      discount: '70%',
      pricing: {
        price: '$35.40',
        priceMicros: 35400000,
        currencyCode: 'USD',
      },
      duration: 'ongoing',
    },
  },
} as const;

/**
 * Helper function to get product by plan type
 */
export const getAndroidProduct = (plan: 'monthly' | 'yearly') => {
  return ANDROID_IAP_CONFIG.products[plan];
};

/**
 * Helper function to get all product IDs
 */
export const getAndroidProductIds = (): string[] => {
  return [
    ANDROID_IAP_CONFIG.products.monthly.productId,
    ANDROID_IAP_CONFIG.products.yearly.productId,
  ];
};

console.log('[Android IAP Config] ✅ Configuration loaded');
console.log(`[Android IAP Config] Package: ${ANDROID_IAP_CONFIG.playConsole.packageName}`);
console.log(`[Android IAP Config] Service Fee: ${ANDROID_IAP_CONFIG.playConsole.serviceFee * 100}%`);
