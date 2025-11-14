# StoreKit 2 Free Trial Implementation Guide

**For:** WhatsCard 1.0 - React Native with react-native-iap 12.15.4
**Updated:** January 2025
**Apple Requirements:** StoreKit 2 APIs (iOS 15+)

---

## 🎯 Overview

This guide shows how to implement 3-day free trials for WhatsCard Premium subscriptions using `react-native-iap` library (v12.15.4), which wraps Apple's StoreKit 2 APIs.

---

## 📋 Prerequisites

**Before implementing free trials in code:**
1. ✅ Subscriptions created in App Store Connect
2. ✅ Introductory offers configured as "Free" type (3 days)
3. ✅ Subscriptions in "Ready to Submit" or "Approved" state
4. ✅ `react-native-iap` installed (already in package.json)

---

## 🔧 Implementation Steps

### Step 1: Install & Configure react-native-iap

**Already installed in package.json:**
```json
{
  "react-native-iap": "12.15.4"
}
```

**Android Gradle Configuration (CRITICAL):**
```gradle
// android/app/build.gradle
android {
    defaultConfig {
        missingDimensionStrategy 'store', 'play'  // Use Google Play variant
    }

    flavorDimensions "store"
    productFlavors {
        play {
            dimension "store"
        }
    }
}
```

### Step 2: Initialize IAP Connection

**Create:** `services/subscriptionService.ts`

```typescript
import {
  initConnection,
  getSubscriptions,
  requestSubscription,
  getAvailablePurchases,
  finishTransaction,
  acknowledgePurchaseAndroid,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Subscription,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';

// Product IDs from App Store Connect
const SUBSCRIPTION_PRODUCT_IDS = {
  MONTHLY: 'com.whatscard.pro.monthly',
  YEARLY: 'com.whatscard.pro.yearly',
} as const;

export class SubscriptionService {
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;

  /**
   * Initialize IAP connection
   * Call this in App.tsx on mount
   */
  async initialize(): Promise<void> {
    try {
      await initConnection();
      console.log('IAP connection initialized');

      // Set up purchase listeners
      this.setupPurchaseListeners();

      // Check for existing purchases
      await this.restorePurchases();
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      throw error;
    }
  }

  /**
   * Fetch available subscriptions
   * Returns subscription products with pricing & trial info
   */
  async getAvailableSubscriptions(): Promise<Subscription[]> {
    try {
      const subscriptions = await getSubscriptions({
        skus: Object.values(SUBSCRIPTION_PRODUCT_IDS),
      });

      console.log('Available subscriptions:', subscriptions);
      return subscriptions;
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      return [];
    }
  }

  /**
   * Check if user is eligible for free trial
   * Returns true if user has never subscribed to this group
   */
  async isEligibleForFreeTrial(subscriptionSku: string): Promise<boolean> {
    try {
      const availablePurchases = await getAvailablePurchases();

      // Check if user has any previous purchases in this subscription group
      const hasSubscribed = availablePurchases.some(
        purchase => purchase.productId === subscriptionSku
      );

      // User is eligible if they've never subscribed before
      return !hasSubscribed;
    } catch (error) {
      console.error('Failed to check trial eligibility:', error);
      // Default to true if we can't determine eligibility
      return true;
    }
  }

  /**
   * Purchase subscription with free trial
   * Automatically applies free trial if user is eligible
   */
  async purchaseSubscription(subscriptionSku: string): Promise<void> {
    try {
      console.log('Requesting subscription:', subscriptionSku);

      await requestSubscription({
        sku: subscriptionSku,
        // Free trial is automatically applied by Apple if user is eligible
        // No additional parameters needed
      });

      // Purchase result will be handled by purchaseUpdateListener
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  /**
   * Restore previous purchases
   * Call this on app launch and when user taps "Restore Purchases"
   */
  async restorePurchases(): Promise<Purchase[]> {
    try {
      const availablePurchases = await getAvailablePurchases();
      console.log('Restored purchases:', availablePurchases);

      // Process each purchase
      for (const purchase of availablePurchases) {
        await this.acknowledgePurchase(purchase);
      }

      return availablePurchases;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return [];
    }
  }

  /**
   * Set up purchase listeners
   * These listeners handle purchase updates and errors
   */
  private setupPurchaseListeners(): void {
    // Listen for successful purchases
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        console.log('Purchase updated:', purchase);

        try {
          // Verify purchase with your backend here
          // await verifyPurchaseWithBackend(purchase);

          // Acknowledge purchase
          await this.acknowledgePurchase(purchase);

          // Unlock premium features
          await this.unlockPremiumFeatures(purchase);

        } catch (error) {
          console.error('Failed to process purchase:', error);
        }
      }
    );

    // Listen for purchase errors
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.error('Purchase error:', error);

        if (error.code === 'E_USER_CANCELLED') {
          // User cancelled purchase - no action needed
        } else {
          // Show error to user
          alert('Purchase failed: ' + error.message);
        }
      }
    );
  }

  /**
   * Acknowledge purchase to finalize transaction
   * CRITICAL: Must be called for all purchases
   */
  private async acknowledgePurchase(purchase: Purchase): Promise<void> {
    try {
      if (purchase.transactionReceipt) {
        // iOS: Finish transaction
        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        // Android: Acknowledge purchase
        if (Platform.OS === 'android') {
          await acknowledgePurchaseAndroid({
            token: purchase.purchaseToken!,
          });
        }

        console.log('Purchase acknowledged:', purchase.productId);
      }
    } catch (error) {
      console.error('Failed to acknowledge purchase:', error);
    }
  }

  /**
   * Unlock premium features after successful purchase
   */
  private async unlockPremiumFeatures(purchase: Purchase): Promise<void> {
    // Update user state to premium
    // This should:
    // 1. Update local state (AsyncStorage)
    // 2. Update Supabase user record
    // 3. Notify UI to refresh

    console.log('Unlocking premium features for:', purchase.productId);

    // Example:
    // await AsyncStorage.setItem('isPremium', 'true');
    // await supabase.from('users').update({ is_premium: true });
  }

  /**
   * Clean up listeners on unmount
   */
  dispose(): void {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
```

### Step 3: Display Subscriptions with Free Trial Info

**Create:** `components/SubscriptionModal.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { subscriptionService } from '../services/subscriptionService';
import type { Subscription } from 'react-native-iap';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEligibleForTrial, setIsEligibleForTrial] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (visible) {
      loadSubscriptions();
    }
  }, [visible]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);

      // Fetch subscriptions
      const subs = await subscriptionService.getAvailableSubscriptions();
      setSubscriptions(subs);

      // Check free trial eligibility for each
      const eligibility: { [key: string]: boolean } = {};
      for (const sub of subs) {
        eligibility[sub.productId] =
          await subscriptionService.isEligibleForFreeTrial(sub.productId);
      }
      setIsEligibleForTrial(eligibility);

    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    try {
      await subscriptionService.purchaseSubscription(productId);
      // Purchase success will be handled by listener
      // Modal will close automatically when premium is unlocked
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Plan</Text>

      {subscriptions.map((subscription) => {
        const eligible = isEligibleForTrial[subscription.productId];

        return (
          <TouchableOpacity
            key={subscription.productId}
            style={styles.subscriptionCard}
            onPress={() => handlePurchase(subscription.productId)}
          >
            <Text style={styles.subscriptionName}>
              {subscription.title}
            </Text>

            <Text style={styles.subscriptionDescription}>
              {subscription.description}
            </Text>

            <Text style={styles.subscriptionPrice}>
              {subscription.localizedPrice} / {subscription.subscriptionPeriodUnitIOS}
            </Text>

            {eligible && subscription.introductoryPrice && (
              <View style={styles.trialBadge}>
                <Text style={styles.trialText}>
                  ✨ 3-DAY FREE TRIAL
                </Text>
                <Text style={styles.trialSubtext}>
                  Then {subscription.localizedPrice}/{subscription.subscriptionPeriodUnitIOS}
                </Text>
              </View>
            )}

            {!eligible && (
              <Text style={styles.noTrialText}>
                Start subscription immediately
              </Text>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={async () => {
          await subscriptionService.restorePurchases();
        }}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subscriptionCard: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 15,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  subscriptionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  trialBadge: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  trialText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  trialSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  noTrialText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  restoreButton: {
    padding: 15,
    marginTop: 10,
  },
  restoreText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
  },
  closeButton: {
    padding: 15,
    marginTop: 10,
  },
  closeText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});
```

### Step 4: Initialize IAP in App.tsx

```typescript
// App.tsx
import { subscriptionService } from './services/subscriptionService';

export default function App() {
  useEffect(() => {
    // Initialize IAP on app launch
    subscriptionService.initialize().catch(console.error);

    // Clean up on unmount
    return () => {
      subscriptionService.dispose();
    };
  }, []);

  // ... rest of app
}
```

---

## 🧪 Testing Free Trials

### Local Testing with StoreKit Configuration File

**Create:** `NamecardMobile.storekit`

```json
{
  "identifier": "WhatsCard",
  "nonRenewingSubscriptions": [],
  "products": [],
  "settings": {
    "_failTransactionsEnabled": false,
    "_locale": "en_US",
    "_storefront": "USA",
    "_storeKitErrors": []
  },
  "subscriptionGroups": [
    {
      "id": "whatscard_premium",
      "localizations": [],
      "name": "WhatsCard Premium",
      "subscriptions": [
        {
          "adHocOffers": [],
          "codeOffers": [],
          "displayPrice": "199",
          "familyShareable": false,
          "groupNumber": 1,
          "internalID": "com.whatscard.pro.monthly",
          "introductoryOffer": {
            "internalID": "monthly_free_trial",
            "paymentMode": "free",
            "subscriptionPeriod": "P3D"
          },
          "localizations": [
            {
              "description": "Premium features",
              "displayName": "WhatsCard Pro Monthly",
              "locale": "en_US"
            }
          ],
          "productID": "com.whatscard.pro.monthly",
          "recurringSubscriptionPeriod": "P1M",
          "referenceName": "WhatsCard Pro Monthly",
          "subscriptionGroupID": "whatscard_premium",
          "type": "RecurringSubscription"
        }
      ]
    }
  ],
  "version": {
    "major": 2,
    "minor": 0
  }
}
```

**Test in Xcode:**
1. Open iOS project in Xcode
2. Product → Scheme → Edit Scheme
3. Run → Options tab
4. StoreKit Configuration: Select `WhatsCard.storekit`
5. Run app in simulator
6. Test subscription purchase
7. Verify free trial starts

### TestFlight Testing

1. Upload build to TestFlight
2. Add sandbox tester in App Store Connect
3. Install via TestFlight on device
4. Sign out of App Store
5. Sign in with sandbox Apple ID
6. Test subscription flow
7. Verify 3-day free trial starts

**Important:** TestFlight free trials last 3 REAL days (changed December 2024)

---

## 🔍 Debugging Free Trials

### Check Subscription Object

```typescript
const subs = await subscriptionService.getAvailableSubscriptions();
console.log('Subscription:', JSON.stringify(subs[0], null, 2));

// Look for:
// - introductoryPrice: should exist
// - introductoryPricePaymentModeIOS: should be "FREETRIAL"
// - introductoryPriceNumberOfPeriodsIOS: should be "3"
// - introductoryPriceSubscriptionPeriodIOS: should be "DAY"
```

### Verify Purchase Receipt

```typescript
const purchases = await getAvailablePurchases();
console.log('Purchases:', JSON.stringify(purchases, null, 2));

// Check for:
// - productId: matches subscription SKU
// - transactionReceipt: contains receipt data
// - transactionDate: purchase timestamp
```

---

## 🚨 Common Issues & Solutions

### Free Trial Not Showing
**Cause:** Subscription not configured correctly in App Store Connect
**Fix:**
- Verify introductory offer is "Free" type (not pay as you go)
- Check duration is exactly "3 days"
- Ensure territories match subscription availability
- Refresh App Store Connect (can take 5-10 minutes to propagate)

### User Not Eligible for Trial
**Cause:** User has previously subscribed to this subscription group
**Fix:**
- Free trials are ONE-TIME per subscription group per Apple ID
- User must use different Apple ID to test again
- Create new sandbox tester for fresh testing

### Purchase Not Completing
**Cause:** Transaction not acknowledged
**Fix:**
- Ensure `finishTransaction()` is called for all purchases
- Check purchase listeners are set up correctly
- Verify network connection for receipt validation

### Android Build Fails
**Cause:** Missing Gradle flavor configuration
**Fix:**
```gradle
// android/app/build.gradle
defaultConfig {
    missingDimensionStrategy 'store', 'play'
}
```

---

## 📊 Free Trial Business Logic

### Trial Lifecycle

```
1. User taps "Start Free Trial"
   ↓
2. Check eligibility (has user subscribed before?)
   ↓
3. Request subscription purchase
   ↓
4. Apple automatically applies free trial (if eligible)
   ↓
5. User gets 3 days of premium access
   ↓
6. On day 3, Apple sends renewal notification
   ↓
7. User can cancel anytime (no charge)
   ↓
8. If not cancelled, Apple charges on day 4
   ↓
9. Subscription continues monthly/yearly
```

### Server-Side Validation (Recommended)

**Create Supabase Edge Function:**
```typescript
// supabase/functions/validate-receipt/index.ts
export async function validateAppleReceipt(receiptData: string) {
  // Send to Apple's receipt validation API
  const response = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
    method: 'POST',
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': process.env.APPLE_SHARED_SECRET,
    }),
  });

  const result = await response.json();

  // Check if subscription is active
  const latestReceipt = result.latest_receipt_info?.[0];
  const expiresDate = new Date(latestReceipt?.expires_date_ms || 0);
  const isActive = expiresDate > new Date();

  return {
    isActive,
    productId: latestReceipt?.product_id,
    expiresDate,
    isTrialPeriod: latestReceipt?.is_trial_period === 'true',
  };
}
```

---

## ✅ Final Checklist

Before going live:
- [ ] Subscriptions created in App Store Connect
- [ ] Free trials configured (3 days, "Free" type)
- [ ] `react-native-iap` implemented
- [ ] Purchase listeners set up
- [ ] Transaction acknowledgment implemented
- [ ] Receipt validation (client-side minimum, server-side recommended)
- [ ] Tested in Xcode with StoreKit Configuration File
- [ ] Tested in TestFlight with sandbox tester
- [ ] Error handling for purchase failures
- [ ] Restore purchases functionality
- [ ] Premium features unlock on successful purchase
- [ ] User state persists across app restarts

---

## 🔗 Resources

- [react-native-iap Documentation](https://react-native-iap.dooboolab.com/)
- [Apple StoreKit 2 Documentation](https://developer.apple.com/documentation/storekit)
- [App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [Receipt Validation Guide](https://developer.apple.com/documentation/appstorereceipts)

---

**Next Steps:**
1. Implement `SubscriptionService` in your app
2. Create subscription modal UI
3. Test locally with StoreKit Configuration File
4. Test in TestFlight
5. Submit for App Review

**Good luck!** 🚀
