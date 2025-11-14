# react-native-iap Purchase Handling: Complete Edge Cases & Best Practices

**Research Date**: 2025-11-07
**Library Version**: react-native-iap 12.15.4 (Current Project Version)
**Purpose**: Trial tracking implementation after IAP purchase

---

## Table of Contents

1. [Critical finishTransaction() Behavior](#1-critical-finishtransaction-behavior)
2. [User Cancellation Handling](#2-user-cancellation-handling)
3. [Network Failure Recovery](#3-network-failure-recovery)
4. [Pending Purchases](#4-pending-purchases)
5. [Trial vs Paid Detection](#5-trial-vs-paid-detection)
6. [Duplicate Purchase Prevention](#6-duplicate-purchase-prevention)
7. [Platform-Specific Differences](#7-platform-specific-differences)
8. [Complete Implementation Pattern](#8-complete-implementation-pattern)

---

## 1. Critical finishTransaction() Behavior

### What Happens If finishTransaction() Is NOT Called?

**Android:**
- ❌ **Automatic Refund**: Non-consumables will be automatically refunded after 3 days
- ❌ **Blocked Repurchase**: Users cannot purchase consumables again until transaction is finished
- ❌ **Pending State**: Purchase remains in "pending" state indefinitely

**iOS:**
- ❌ **Stuck Transactions**: Purchases remain in transaction queue
- ❌ **Repeated Callbacks**: Purchase will be emitted to `purchaseUpdatedListener` on EVERY app relaunch
- ⚠️ **Auto-Finish (Deprecated)**: iOS currently auto-finishes non-consumables but this will change in future versions

### Critical Rule: ALWAYS Finish Transactions

```javascript
// ✅ CORRECT: Finish after validating purchase
const handlePurchase = async (purchase) => {
  try {
    // 1. Save to database FIRST
    await savePurchaseToDatabase(purchase);

    // 2. Then finish transaction
    await RNIap.finishTransaction(purchase, isConsumable);

  } catch (error) {
    console.error('Failed to finish transaction:', error);
    // DO NOT finish transaction if database save failed
  }
};
```

### Best Practice: Database Before Finish

**CRITICAL ORDER:**
```
1. Validate purchase receipt (optional but recommended)
2. Save purchase to database/backend
3. Grant user access/premium features
4. ONLY THEN call finishTransaction()
```

**Why?** Once consumed/acknowledged, the purchase is removed from `getAvailablePurchases()` and you CANNOT recover it!

---

## 2. User Cancellation Handling

### Error Code: `E_USER_CANCELLED`

**Platform Response Codes:**
- **Android**: `responseCode: 1` (integer)
- **iOS**: `"2"` (string)

### Handling Cancellation

```javascript
import RNIap, { purchaseErrorListener } from 'react-native-iap';

// Setup error listener
const purchaseErrorSubscription = purchaseErrorListener((error) => {
  console.log('Purchase error:', error);

  if (error.code === 'E_USER_CANCELLED') {
    // User cancelled the purchase flow
    console.log('User cancelled purchase');

    // ✅ DO:
    // - Log the cancellation for analytics
    // - Show "Purchase cancelled" message
    // - Reset UI state

    // ❌ DO NOT:
    // - Call finishTransaction (nothing to finish)
    // - Show error message (it's not an error)
    // - Retry automatically
  }
});
```

### Common Cancellation Scenarios

1. **User clicks "Cancel" in App Store/Play Store dialog**
2. **User dismisses payment authentication (Face ID, fingerprint)**
3. **User backs out before confirming payment**

**Edge Case:** Trial cancellation is treated the same as paid cancellation - both emit `E_USER_CANCELLED`.

---

## 3. Network Failure Recovery

### Automatic Recovery Since v3.3.0

**Good News:** react-native-iap safely completes transactions even during severe disasters (app crashes, network failures).

### Purchase Persistence Pattern

```javascript
// Purchases persist until finished - this is AUTOMATIC recovery!
componentDidMount() {
  // Setup listener BEFORE any purchase attempts
  this.purchaseUpdateSubscription = purchaseUpdatedListener(
    async (purchase) => {
      console.log('Purchase update:', purchase);

      // This will receive:
      // 1. New purchases
      // 2. Pending purchases from previous sessions
      // 3. Purchases that failed to finish last time

      await handlePurchase(purchase);
    }
  );
}
```

### Network Failure Scenarios

| Scenario | Behavior | Recovery |
|----------|----------|----------|
| Network fails BEFORE purchase | Purchase never starts | User can retry |
| Network fails DURING purchase | Purchase enters PENDING state | Listener receives it when network returns |
| Network fails AFTER purchase | Purchase received but not finished | Listener receives it on next app launch |
| App crashes during purchase | Purchase not finished | Listener receives it on next app launch |

### Implementation Pattern

```javascript
const handlePurchase = async (purchase) => {
  try {
    // 1. Check if already processed (duplicate prevention)
    const isProcessed = await checkIfPurchaseProcessed(purchase.transactionId);
    if (isProcessed) {
      console.log('Purchase already processed, finishing...');
      await RNIap.finishTransaction(purchase, isConsumable);
      return;
    }

    // 2. Save to database with retry logic
    await retryWithBackoff(() =>
      savePurchaseToDatabase(purchase),
      { maxRetries: 3, backoffMs: 1000 }
    );

    // 3. Finish transaction
    await RNIap.finishTransaction(purchase, isConsumable);

  } catch (error) {
    console.error('Failed to handle purchase:', error);
    // Purchase will be retried on next app launch
    // DO NOT finish transaction if failed
  }
};

// Retry helper
async function retryWithBackoff(fn, { maxRetries = 3, backoffMs = 1000 }) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, backoffMs * (i + 1)));
    }
  }
}
```

---

## 4. Pending Purchases

### Purchase States (Android)

```typescript
enum PurchaseStateAndroid {
  UNSPECIFIED_STATE = 0,
  PURCHASED = 1,
  PENDING = 2
}
```

**IMPORTANT:** There was historical confusion about these values - PENDING is 2, not 0.

### Checking Purchase State

```javascript
const handlePurchase = async (purchase) => {
  // Android
  if (Platform.OS === 'android') {
    if (purchase.purchaseStateAndroid === 0) {
      console.log('Purchase state: UNSPECIFIED');
      // Handle edge case - rare, usually means error
    } else if (purchase.purchaseStateAndroid === 1) {
      console.log('Purchase state: PURCHASED');
      // Normal successful purchase
      await processPurchase(purchase);
    } else if (purchase.purchaseStateAndroid === 2) {
      console.log('Purchase state: PENDING');
      // User paid with cash, offline payment, etc.
      // DO NOT acknowledge/finish yet!
      // Wait for state to change to PURCHASED
    }
  }

  // iOS
  if (Platform.OS === 'ios') {
    // iOS uses transactionState, not purchaseStateAndroid
    console.log('Transaction state:', purchase.transactionState);
    await processPurchase(purchase);
  }
};
```

### Pending Purchase Scenarios

1. **Offline Payment (Android)**: User pays with cash at store
2. **Delayed Authorization**: Bank requires additional verification
3. **Failed Previous Transaction**: Ghost purchases from crashed sessions

### Clearing Ghost Purchases

```javascript
// ✅ MANDATORY: Call this after initConnection() on Android
async initializeIAP() {
  try {
    await RNIap.initConnection();

    if (Platform.OS === 'android') {
      // Clear failed pending purchases from previous sessions
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
    }

    // Setup listeners AFTER initialization
    setupPurchaseListeners();

  } catch (error) {
    console.error('IAP initialization failed:', error);
  }
}
```

### Common Mistake: Acknowledging PENDING Purchases

```javascript
// ❌ WRONG: Don't acknowledge PENDING purchases
if (purchase.purchaseStateAndroid === 2) {
  await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
  // This will ERROR!
}

// ✅ CORRECT: Only acknowledge PURCHASED purchases
if (purchase.purchaseStateAndroid === 1) {
  await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
}
```

---

## 5. Trial vs Paid Detection

### iOS: Receipt Fields

```javascript
// iOS receipt includes trial information (when using extended validation)
{
  "isTrialPeriod": true,  // User is in trial period
  "isInIntroOfferPeriod": true,  // User is in intro offer (discounted period)
  "originalTransactionDateIOS": "...",
  "originalTransactionIdentifierIOS": "..."
}
```

**Note:** Some developers report `isTrialPeriod` returns false during testing - validate in production!

### Android: Product Fields

```javascript
// When calling getProducts(), check subscription object
const products = await RNIap.getProducts(productIds);

products.forEach(product => {
  if (product.type === 'subs') {
    console.log('Free trial period:', product.freeTrialPeriodAndroid);
    // Example: "P7D" = 7 days, "P1M" = 1 month
  }
});
```

**Note:** In v8.0.8+, use `subscription.freeTrialPeriodAndroid`.

### Trial Eligibility Detection

**Recommended Approach:**
```javascript
// Check if user has ever subscribed to this subscription group
const checkTrialEligibility = async (userId) => {
  // 1. Check purchase history from backend
  const hasPreviousSubscription = await checkBackendPurchaseHistory(userId);

  if (hasPreviousSubscription) {
    return false; // Not eligible for trial
  }

  // 2. Check local purchase history (fallback)
  const purchaseHistory = await RNIap.getPurchaseHistory();
  const hasSubscriptionHistory = purchaseHistory.some(
    purchase => purchase.productId.includes('subscription')
  );

  return !hasSubscriptionHistory; // Eligible if no history
};
```

**Platform Limitations:**
- iOS: User is only eligible for free trial ONCE per subscription group
- Android: Trial eligibility is per subscription product
- Both: Test users follow same rules as production users

### Detecting Active Trial

```javascript
const checkActiveTrialStatus = async (purchase) => {
  if (Platform.OS === 'ios') {
    // iOS: Check receipt fields
    const receipt = await RNIap.validateReceiptIos({
      'receipt-data': purchase.transactionReceipt,
      password: IOS_SHARED_SECRET
    }, true); // true = extended validation

    return receipt.isTrialPeriod === true;
  }

  if (Platform.OS === 'android') {
    // Android: Check purchase fields
    // Note: Google doesn't provide explicit "is in trial" flag
    // You must track this based on purchase date + trial period

    const purchaseDate = new Date(purchase.transactionDate);
    const trialEndDate = new Date(purchaseDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7); // Assuming 7-day trial

    const isInTrial = new Date() < trialEndDate;
    return isInTrial;
  }
};
```

### Critical: Trial Detection for Conversion Tracking

```javascript
const handlePurchase = async (purchase) => {
  const isInTrial = await checkActiveTrialStatus(purchase);

  if (isInTrial) {
    console.log('User started trial');

    // Save trial start date
    await Supabase
      .from('users')
      .update({
        subscription_status: 'trial',
        trial_start_date: new Date().toISOString(),
        trial_end_date: calculateTrialEndDate(purchase)
      })
      .eq('id', userId);

  } else {
    console.log('User made direct paid purchase');

    await Supabase
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString()
      })
      .eq('id', userId);
  }

  await RNIap.finishTransaction(purchase, false);
};
```

---

## 6. Duplicate Purchase Prevention

### Problem: Multiple Purchase Callbacks

**Common Issue:** `purchaseUpdatedListener` can be called multiple times for the same purchase:
- On app restart
- When network recovers
- If transaction wasn't finished
- Platform bug reports (20+ duplicate callbacks)

### Solution: Transaction ID Tracking

```javascript
// Maintain a Set of processed transaction IDs
const processedTransactions = new Set();

const handlePurchase = async (purchase) => {
  const transactionId = purchase.transactionId;

  // ✅ Check if already processed
  if (processedTransactions.has(transactionId)) {
    console.log('Duplicate purchase detected, skipping:', transactionId);

    // Still finish transaction if not finished
    if (!purchase.isAcknowledgedAndroid || purchase.transactionState !== 'purchased') {
      await RNIap.finishTransaction(purchase, isConsumable);
    }

    return;
  }

  // Add to processed set BEFORE processing
  processedTransactions.add(transactionId);

  try {
    // Process purchase
    await processPurchase(purchase);
    await RNIap.finishTransaction(purchase, isConsumable);

  } catch (error) {
    // Remove from set if failed (allow retry)
    processedTransactions.delete(transactionId);
    throw error;
  }
};
```

### Backend Duplicate Prevention

```javascript
// Database schema should have unique constraint
CREATE TABLE purchases (
  transaction_id TEXT PRIMARY KEY,  -- Unique constraint prevents duplicates
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  purchase_date TIMESTAMP NOT NULL,
  -- other fields...
);

// Backend endpoint with idempotent handling
const savePurchaseToDatabase = async (purchase) => {
  try {
    const { data, error } = await Supabase
      .from('purchases')
      .insert({
        transaction_id: purchase.transactionId,
        user_id: userId,
        product_id: purchase.productId,
        purchase_date: new Date(purchase.transactionDate),
        receipt: purchase.transactionReceipt
      });

    if (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        console.log('Purchase already saved, continuing...');
        return; // Not an error - idempotent behavior
      }
      throw error;
    }

    console.log('Purchase saved successfully');

  } catch (error) {
    console.error('Failed to save purchase:', error);
    throw error;
  }
};
```

### Common Duplicate Scenarios

1. **App Restart**: Purchase not finished before app closed
2. **Network Recovery**: Purchase callback fires again after reconnection
3. **Platform Bug**: iOS/Android occasionally sends duplicate events
4. **Multiple Listeners**: Accidentally setting up multiple purchase listeners

### Prevention Checklist

- ✅ Track processed transaction IDs in memory
- ✅ Use database unique constraint on transaction_id
- ✅ Setup purchase listener ONCE (not in component render)
- ✅ Check `isAcknowledgedAndroid` flag before processing
- ✅ Implement idempotent backend endpoints

---

## 7. Platform-Specific Differences

### Key Differences Summary

| Feature | iOS | Android |
|---------|-----|---------|
| **Multiple Purchases** | ❌ One at a time | ✅ Multiple products in single transaction |
| **finishTransaction** | Required | Required (acknowledged=true) |
| **Purchase States** | transactionState | purchaseStateAndroid (0,1,2) |
| **Pending Purchases** | Rare | Common (cash payments, offline) |
| **Trial Detection** | Receipt validation | Product metadata |
| **Auto-Finish** | Current: Yes (non-consumables)<br>Future: No | Never |
| **Clear Ghost Purchases** | Not needed | ✅ flushFailedPurchases... |

### iOS-Specific Code

```javascript
if (Platform.OS === 'ios') {
  // iOS: Use transactionState
  console.log('Transaction state:', purchase.transactionState);

  // iOS: Original transaction info
  const originalTransactionId = purchase.originalTransactionIdentifierIOS;
  const originalTransactionDate = purchase.originalTransactionDateIOS;

  // iOS: Trial detection (extended validation)
  const isInTrial = receipt.isTrialPeriod === true;
  const isInIntroOffer = receipt.isInIntroOfferPeriod === true;

  // iOS: Finish transaction (all purchases)
  await RNIap.finishTransactionIOS(purchase.transactionId);
}
```

### Android-Specific Code

```javascript
if (Platform.OS === 'android') {
  // Android: Use purchaseStateAndroid
  const state = purchase.purchaseStateAndroid;

  if (state === 1) { // PURCHASED
    // Android: Check if acknowledged
    if (!purchase.isAcknowledgedAndroid) {
      // For non-consumables
      await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
    } else {
      // For consumables
      await RNIap.consumePurchaseAndroid(purchase.purchaseToken);
    }
  } else if (state === 2) { // PENDING
    console.log('Purchase pending, waiting for completion...');
    // DO NOT acknowledge/consume yet
  }

  // Android: Trial period from product
  const product = await RNIap.getProducts([purchase.productId]);
  const trialPeriod = product[0].freeTrialPeriodAndroid; // "P7D"
}
```

### Unified Approach (Recommended)

```javascript
// Use finishTransaction() for both platforms (v4.1.0+)
const handlePurchase = async (purchase) => {
  // Platform-agnostic processing
  await processPurchase(purchase);

  // Unified finish (works on both iOS and Android)
  const isConsumable = purchase.productId.includes('consumable');
  await RNIap.finishTransaction(purchase, isConsumable);
};
```

### Platform Detection Helper

```javascript
const getPurchaseStatus = (purchase) => {
  if (Platform.OS === 'ios') {
    return {
      state: purchase.transactionState,
      isPending: purchase.transactionState === 'purchasing',
      isPurchased: purchase.transactionState === 'purchased',
      isFailed: purchase.transactionState === 'failed'
    };
  }

  if (Platform.OS === 'android') {
    return {
      state: purchase.purchaseStateAndroid,
      isPending: purchase.purchaseStateAndroid === 2,
      isPurchased: purchase.purchaseStateAndroid === 1,
      isFailed: purchase.purchaseStateAndroid === 0
    };
  }
};
```

---

## 8. Complete Implementation Pattern

### Full Purchase Flow (Production-Ready)

```javascript
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import RNIap, {
  initConnection,
  endConnection,
  purchaseUpdatedListener,
  purchaseErrorListener,
  flushFailedPurchasesCachedAsPendingAndroid,
  finishTransaction,
  PurchaseError
} from 'react-native-iap';

// Track processed transactions to prevent duplicates
const processedTransactions = new Set();

export const useIAP = () => {
  const purchaseUpdateSubscription = useRef(null);
  const purchaseErrorSubscription = useRef(null);

  // Initialize IAP connection
  useEffect(() => {
    const initializeIAP = async () => {
      try {
        console.log('Initializing IAP...');
        await initConnection();
        console.log('IAP initialized');

        // Android: Clear ghost pending purchases
        if (Platform.OS === 'android') {
          await flushFailedPurchasesCachedAsPendingAndroid();
          console.log('Flushed failed pending purchases');
        }

        // Setup purchase listener
        purchaseUpdateSubscription.current = purchaseUpdatedListener(
          handlePurchaseUpdate
        );

        // Setup error listener
        purchaseErrorSubscription.current = purchaseErrorListener(
          handlePurchaseError
        );

      } catch (error) {
        console.error('Failed to initialize IAP:', error);
      }
    };

    initializeIAP();

    // Cleanup
    return () => {
      if (purchaseUpdateSubscription.current) {
        purchaseUpdateSubscription.current.remove();
      }
      if (purchaseErrorSubscription.current) {
        purchaseErrorSubscription.current.remove();
      }
      endConnection();
    };
  }, []);

  // Handle purchase updates
  const handlePurchaseUpdate = async (purchase) => {
    console.log('Purchase update received:', purchase);

    try {
      // Validate purchase object
      if (!purchase || !purchase.transactionId) {
        console.error('Invalid purchase object:', purchase);
        return;
      }

      // Check for duplicates
      if (processedTransactions.has(purchase.transactionId)) {
        console.log('Duplicate purchase detected:', purchase.transactionId);

        // Finish if not already finished
        if (shouldFinishTransaction(purchase)) {
          await finishTransaction(purchase, isConsumable(purchase));
        }

        return;
      }

      // Check purchase state
      const status = getPurchaseStatus(purchase);

      if (status.isPending) {
        console.log('Purchase is pending, waiting...');
        return; // Don't process or finish pending purchases
      }

      if (!status.isPurchased) {
        console.log('Purchase not completed:', status.state);
        return;
      }

      // Mark as processing
      processedTransactions.add(purchase.transactionId);

      // Process purchase
      await processPurchase(purchase);

      // Finish transaction
      await finishTransaction(purchase, isConsumable(purchase));
      console.log('Purchase completed successfully');

    } catch (error) {
      console.error('Error handling purchase:', error);

      // Remove from processed set to allow retry
      processedTransactions.delete(purchase.transactionId);

      // Don't finish transaction on error - will retry on next launch
    }
  };

  // Handle purchase errors
  const handlePurchaseError = (error: PurchaseError) => {
    console.log('Purchase error:', error);

    if (error.code === 'E_USER_CANCELLED') {
      console.log('User cancelled purchase');
      // Show friendly message, don't treat as error
    } else if (error.code === 'E_ALREADY_OWNED') {
      console.log('User already owns this product');
      // Restore purchase
      restorePurchases();
    } else {
      console.error('Purchase error:', error.code, error.message);
      // Show error message to user
    }
  };

  // Process purchase (save to database, grant access)
  const processPurchase = async (purchase) => {
    try {
      // 1. Detect trial status
      const isInTrial = await checkActiveTrialStatus(purchase);

      // 2. Save to database with retry
      await retryWithBackoff(
        async () => {
          await savePurchaseToDatabase({
            transactionId: purchase.transactionId,
            productId: purchase.productId,
            userId: getCurrentUserId(),
            purchaseDate: new Date(purchase.transactionDate),
            isInTrial: isInTrial,
            receipt: purchase.transactionReceipt,
            platform: Platform.OS
          });
        },
        { maxRetries: 3, backoffMs: 1000 }
      );

      // 3. Update user subscription status
      await updateUserSubscription({
        userId: getCurrentUserId(),
        status: isInTrial ? 'trial' : 'active',
        trialStartDate: isInTrial ? new Date() : null,
        subscriptionStartDate: !isInTrial ? new Date() : null,
        productId: purchase.productId
      });

      // 4. Grant premium features immediately
      grantPremiumAccess(getCurrentUserId());

      console.log('Purchase processed successfully');

    } catch (error) {
      console.error('Failed to process purchase:', error);
      throw error;
    }
  };

  // Check if purchase is consumable
  const isConsumable = (purchase) => {
    // Subscriptions and non-consumables: false
    // Consumables (coins, power-ups, etc.): true
    return purchase.productId.includes('consumable');
  };

  // Check purchase status (platform-agnostic)
  const getPurchaseStatus = (purchase) => {
    if (Platform.OS === 'ios') {
      return {
        state: purchase.transactionState,
        isPending: purchase.transactionState === 'purchasing',
        isPurchased: purchase.transactionState === 'purchased',
        isFailed: purchase.transactionState === 'failed'
      };
    }

    if (Platform.OS === 'android') {
      return {
        state: purchase.purchaseStateAndroid,
        isPending: purchase.purchaseStateAndroid === 2,
        isPurchased: purchase.purchaseStateAndroid === 1,
        isFailed: purchase.purchaseStateAndroid === 0
      };
    }
  };

  // Check if transaction should be finished
  const shouldFinishTransaction = (purchase) => {
    if (Platform.OS === 'android') {
      // Android: Check if not acknowledged
      return !purchase.isAcknowledgedAndroid;
    }

    if (Platform.OS === 'ios') {
      // iOS: Check transaction state
      return purchase.transactionState === 'purchased';
    }

    return false;
  };

  // Check active trial status
  const checkActiveTrialStatus = async (purchase) => {
    if (Platform.OS === 'ios') {
      // iOS: Use receipt validation
      // Note: This requires backend validation for production
      const receipt = await validateReceiptWithBackend(
        purchase.transactionReceipt
      );
      return receipt.isTrialPeriod === true;
    }

    if (Platform.OS === 'android') {
      // Android: Calculate based on purchase date + trial period
      const product = await RNIap.getProducts([purchase.productId]);
      const trialPeriod = product[0]?.freeTrialPeriodAndroid; // "P7D"

      if (!trialPeriod) return false;

      const trialDays = parseInt(trialPeriod.replace('P', '').replace('D', ''));
      const purchaseDate = new Date(purchase.transactionDate);
      const trialEndDate = new Date(purchaseDate);
      trialEndDate.setDate(trialEndDate.getDate() + trialDays);

      return new Date() < trialEndDate;
    }

    return false;
  };

  // Retry helper with exponential backoff
  const retryWithBackoff = async (fn, { maxRetries = 3, backoffMs = 1000 }) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        const delay = backoffMs * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  return {
    // Expose helper functions for components
    processPurchase,
    handlePurchaseUpdate,
    handlePurchaseError
  };
};
```

### Database Schema

```sql
-- Purchases table with unique constraint for duplicate prevention
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT UNIQUE NOT NULL,  -- Prevents duplicates
  user_id UUID NOT NULL REFERENCES users(id),
  product_id TEXT NOT NULL,
  purchase_date TIMESTAMP NOT NULL,
  is_in_trial BOOLEAN NOT NULL DEFAULT false,
  receipt TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_transaction_id ON purchases(transaction_id);

-- Users table with subscription status
ALTER TABLE users ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('free', 'trial', 'active', 'expired'));
ALTER TABLE users ADD COLUMN trial_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN current_product_id TEXT;
```

---

## Summary: Critical Edge Cases Checklist

When implementing IAP purchase handling, ensure you handle:

### ✅ Must Handle

1. **finishTransaction() Timing**
   - Save to database BEFORE finishing
   - ALWAYS finish transactions (refund prevention)
   - Use unified `finishTransaction()` for both platforms

2. **User Cancellation**
   - Handle `E_USER_CANCELLED` gracefully
   - Don't show error message (not an error)
   - Log for analytics

3. **Network Failures**
   - Implement retry logic with exponential backoff
   - Don't finish transaction if database save fails
   - Trust automatic recovery (listener fires on next launch)

4. **Pending Purchases**
   - Check `purchaseStateAndroid` === 2 (PENDING)
   - DON'T finish PENDING purchases
   - Call `flushFailedPurchasesCachedAsPendingAndroid()` on init

5. **Trial Detection**
   - iOS: Validate receipt for `isTrialPeriod`
   - Android: Calculate from purchase date + trial period
   - Track trial status in database

6. **Duplicate Prevention**
   - Track processed transaction IDs in Set
   - Use database unique constraint on transaction_id
   - Check `isAcknowledgedAndroid` before processing
   - Setup listener ONCE, not in render

7. **Platform Differences**
   - iOS: Use `transactionState`
   - Android: Use `purchaseStateAndroid` (0=unspecified, 1=purchased, 2=pending)
   - Android: Clear ghost purchases on init
   - Use unified `finishTransaction()` for cleaner code

### ❌ Common Mistakes to Avoid

1. Not calling `finishTransaction()` → Auto-refund on Android
2. Finishing before saving to database → Lost purchase record
3. Acknowledging PENDING purchases → Error
4. Not handling duplicates → Multiple charges/credits
5. Not implementing retry logic → Lost purchases on network failure
6. Setting up multiple listeners → Duplicate callbacks
7. Using platform-specific code unnecessarily → Code duplication

---

## Additional Resources

- **Official Docs**: https://giovannicimolin.github.io/react-native-iap/
- **GitHub Issues**: https://github.com/hyochan/react-native-iap/issues
- **Best Practices**: https://www.supremetech.vn/best-practices-for-react-native-iap/

**Last Updated**: 2025-11-07
**For Project**: WhatsCard/NameCard Mobile v1.0.0
