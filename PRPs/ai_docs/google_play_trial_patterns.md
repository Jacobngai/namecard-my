# Google Play Free Trial Implementation Patterns

**Quick Reference for WhatsCard IAP Implementation**

---

## CRITICAL BEHAVIORS

### Trial Lifecycle (3-Day Trial Example)

```
Day 0, 12:00 PM: User confirms purchase → Trial starts immediately
Day 1-3:         User has full premium access
Day 3, 11:59 PM: Trial ends
Day 4, 12:00 AM: IMMEDIATE auto-charge (within 1 second)
```

### Cancellation During Trial

**KEY RULE:** User **keeps access** until trial end, even after canceling

```typescript
// ❌ WRONG: Remove access when user cancels
if (purchase.willAutoRenew === false) {
  isPremiumUser = false; // DON'T DO THIS
}

// ✅ CORRECT: Check expiry date
if (Date.now() < new Date(purchase.expiryDate).getTime()) {
  isPremiumUser = true; // Grant access until expiry
}
```

### Payment Failure Recovery

**Grace Period:** User **keeps access**, Google retries payment
**Account Hold:** User **loses access**, Google still retries (up to 60 days)

```typescript
// Android purchase states
switch (purchase.purchaseStateAndroid) {
  case 0: // PURCHASED - Active
    return 'active';
  case 1: // CANCELED - Check expiry
    return Date.now() < expiryTime ? 'active' : 'expired';
  case 2: // PENDING - Grace period (keeps access)
    return 'grace_period';
  // Account hold not directly exposed, infer from expiry + state
}
```

---

## IMPLEMENTATION PATTERNS

### 1. Trial Detection

```typescript
import { getSubscriptions, SubscriptionPurchase } from 'react-native-iap';

// Check if user is in trial
function isInTrial(purchase: SubscriptionPurchase): boolean {
  const now = Date.now();
  const startTime = new Date(purchase.transactionDate).getTime();
  const expiryTime = new Date(purchase.expiryDate).getTime();

  // Check if within trial period (typically first billing cycle)
  const isActive = now < expiryTime;
  const isTrial = purchase.introductoryPrice !== undefined; // Had trial offer

  return isActive && isTrial;
}
```

### 2. Access Control Logic

```typescript
function isPremiumActive(purchase: SubscriptionPurchase): boolean {
  const now = Date.now();
  const expiryTime = new Date(purchase.expiryDate).getTime();

  // Rule 1: Not expired
  if (now >= expiryTime) {
    return false;
  }

  // Rule 2: Active subscription (even if canceled, check expiry)
  if (purchase.purchaseStateAndroid === 0) { // PURCHASED
    return true;
  }

  // Rule 3: Grace period (payment pending, keep access)
  if (purchase.purchaseStateAndroid === 2) { // PENDING
    return true;
  }

  // Rule 4: Canceled but not yet expired (trial cancellation)
  if (purchase.purchaseStateAndroid === 1 && now < expiryTime) {
    return true;
  }

  return false;
}
```

### 3. Trial-to-Paid Conversion Detection

```typescript
// Listen for subscription state changes
useEffect(() => {
  const subscription = purchaseUpdateSubscription(
    async (purchase: SubscriptionPurchase) => {
      const { transactionReceipt, productId } = purchase;

      // Acknowledge purchase within 3 days
      await finishTransaction({ purchase, isConsumable: false });

      // Check if trial converted to paid
      if (isTrialToPaidConversion(purchase)) {
        // Analytics: Trial converted
        logEvent('trial_converted', { productId });
      }
    }
  );

  return () => subscription.remove();
}, []);

function isTrialToPaidConversion(purchase: SubscriptionPurchase): boolean {
  // First renewal after trial = conversion
  // Check if purchase has billingPeriodCount > 0 (second period)
  return purchase.purchaseStateAndroid === 0 &&
         purchase.autoRenewing === true;
}
```

### 4. Re-subscription Handling

```typescript
// Google Play handles trial eligibility automatically
// Once user uses trial for a SKU, they can't get it again

async function handleSubscribe(productId: string) {
  try {
    // Request subscription
    const purchase = await requestSubscription({
      sku: productId,
      // If user already used trial for this SKU:
      // - They'll be charged immediately at full price
      // - No special handling needed
    });

    // Acknowledge purchase
    await finishTransaction({ purchase, isConsumable: false });

    // Check if this was a trial or immediate paid purchase
    const hadTrial = purchase.introductoryPrice !== undefined;

    if (hadTrial) {
      // First-time subscriber with trial
      logEvent('subscription_started', { type: 'trial' });
    } else {
      // Returning subscriber (no trial)
      logEvent('subscription_started', { type: 'paid' });
    }

  } catch (error) {
    // Handle subscription errors
  }
}
```

---

## COMMON PATTERNS

### Pattern 1: Trial Status Banner

```typescript
function SubscriptionBanner() {
  const { subscription } = useSubscription();

  if (!subscription) return null;

  const isInTrial = isTrialActive(subscription);
  const daysLeft = getDaysUntilExpiry(subscription);
  const isCanceled = !subscription.autoRenewing;

  if (isInTrial && isCanceled) {
    return (
      <Banner type="warning">
        Your trial ends in {daysLeft} days. You won't be charged.
      </Banner>
    );
  }

  if (isInTrial && !isCanceled) {
    return (
      <Banner type="info">
        Free trial ends in {daysLeft} days. Then ${price}/month.
      </Banner>
    );
  }

  return null;
}
```

### Pattern 2: Payment Retry Prompt

```typescript
function PaymentIssuePrompt() {
  const { subscription } = useSubscription();

  // Grace period: User still has access, but payment failed
  if (subscription?.purchaseStateAndroid === 2) {
    return (
      <AlertDialog
        title="Payment Issue"
        message="Your payment method was declined. Update it to keep your subscription."
        actions={[
          { label: 'Update Payment', onPress: openPlayStoreSubscriptions },
          { label: 'Later', onPress: dismiss }
        ]}
      />
    );
  }

  return null;
}

function openPlayStoreSubscriptions() {
  Linking.openURL('https://play.google.com/store/account/subscriptions');
}
```

### Pattern 3: Subscription Restore

```typescript
// Restore purchases on app launch
async function restorePurchases() {
  try {
    // Get all subscriptions from Google Play
    const purchases = await getSubscriptions();

    // Find active or grace-period subscriptions
    const activeSubscription = purchases.find(p =>
      isPremiumActive(p)
    );

    if (activeSubscription) {
      // Restore premium access
      await unlockPremiumFeatures(activeSubscription);

      // Check if user is in grace period (needs attention)
      if (activeSubscription.purchaseStateAndroid === 2) {
        showPaymentRetryPrompt();
      }
    }

  } catch (error) {
    console.error('Failed to restore purchases:', error);
  }
}
```

---

## TESTING CHECKLIST

### Scenario 1: Normal Trial Flow
```
1. Start trial → Verify immediate premium access
2. Wait 3 days → Verify auto-charge occurs
3. Verify premium access continues after charge
```

### Scenario 2: Trial Cancellation
```
1. Start trial
2. Cancel immediately
3. Verify access retained for remaining trial period
4. Verify no charge at trial end
5. Verify access ends at trial expiry
```

### Scenario 3: Payment Failure
```
1. Use test card that declines
2. Let trial expire
3. Verify grace period (keeps access)
4. Verify account hold (loses access)
5. Fix payment → Verify restoration
```

### Scenario 4: Re-subscription
```
1. Complete trial, let expire
2. Re-subscribe to same SKU
3. Verify immediate charge (no new trial)
4. Verify premium access restored immediately
```

---

## EDGE CASES

### Offline Access During Trial

```typescript
// Store trial expiry locally for offline access checks
async function cacheSubscriptionState(purchase: SubscriptionPurchase) {
  await AsyncStorage.setItem('subscription_expiry', purchase.expiryDate);
  await AsyncStorage.setItem('subscription_active', 'true');
}

// Check offline
async function isPremiumActiveOffline(): Promise<boolean> {
  const expiryDate = await AsyncStorage.getItem('subscription_expiry');
  if (!expiryDate) return false;

  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();

  // Grace period: Allow up to 7 days offline access
  const gracePeriod = 7 * 24 * 60 * 60 * 1000; // 7 days

  return now < (expiry + gracePeriod);
}
```

### Multiple Devices

```typescript
// Subscription syncs automatically via Google Play
// Both devices see same subscription state

// However, handle race conditions:
async function refreshSubscriptionState() {
  // Debounce rapid checks
  const lastCheck = await AsyncStorage.getItem('last_subscription_check');
  const now = Date.now();

  if (lastCheck && (now - parseInt(lastCheck)) < 60000) {
    // Checked within last minute, use cached state
    return getCachedSubscription();
  }

  // Fresh check from Google Play
  await AsyncStorage.setItem('last_subscription_check', now.toString());
  const purchases = await getSubscriptions();
  return purchases[0];
}
```

---

## ANALYTICS EVENTS

Track these key events:

```typescript
// Trial events
logEvent('trial_started', { productId, startDate });
logEvent('trial_canceled', { productId, daysRemaining });
logEvent('trial_converted', { productId, conversionDate });
logEvent('trial_expired', { productId, endDate });

// Payment events
logEvent('payment_failed', { productId, reason });
logEvent('payment_recovered', { productId, recoveryDate });
logEvent('grace_period_started', { productId, startDate });
logEvent('account_hold_started', { productId, startDate });

// Re-subscription events
logEvent('resubscribed', { productId, hadPriorTrial: boolean });
```

---

## KEY TAKEAWAYS

1. **Trial starts immediately** upon purchase confirmation
2. **Cancellation retains access** until trial end (not immediate revocation)
3. **Auto-charge is immediate** when trial ends (within seconds)
4. **Grace period = keep access** (payment retrying)
5. **Account hold = lose access** (payment failed)
6. **One trial per SKU per user** (lifetime)
7. **Acknowledge within 3 days** or automatic refund
8. **Always check expiry date** for access control, not just cancellation status

---

## REFERENCES

- [Full Documentation](../docs/google_play_trial_lifecycle.md)
- [Android Subscription Lifecycle](https://developer.android.com/google/play/billing/lifecycle/subscriptions)
- [react-native-iap Documentation](https://github.com/dooboolab-community/react-native-iap)

---

**Last Updated:** January 2025
