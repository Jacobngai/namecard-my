# react-native-iap Quick Reference Guide

**TL;DR**: Critical rules for robust IAP implementation

---

## 🚨 Critical Rules (Never Break These)

1. **ALWAYS finish transactions** → Prevents auto-refunds (Android 3-day limit)
2. **Save to database BEFORE finishing** → Once finished, purchase is gone forever
3. **Setup listeners ONCE at app launch** → Not in component render
4. **Check for duplicates** → Track transaction IDs in Set + database unique constraint
5. **Call `flushFailedPurchases...` on Android init** → Clears ghost purchases
6. **Never finish PENDING purchases** → Only finish when state === PURCHASED (1)

---

## 📋 Purchase Flow Checklist

```javascript
// Step-by-step purchase handling
async function handlePurchase(purchase) {
  // 1. Duplicate check
  if (alreadyProcessed(purchase.transactionId)) {
    await finishTransaction(purchase, isConsumable);
    return;
  }

  // 2. State check (Android)
  if (Platform.OS === 'android' && purchase.purchaseStateAndroid === 2) {
    return; // PENDING - don't process yet
  }

  // 3. Save to database FIRST
  try {
    await savePurchaseToDatabase(purchase);
  } catch (error) {
    // Don't finish if save failed!
    throw error;
  }

  // 4. Grant user access
  await updateUserSubscription(purchase);

  // 5. THEN finish transaction
  await finishTransaction(purchase, isConsumable);
}
```

---

## 🔑 Key API Methods

### Initialization

```javascript
import RNIap, {
  initConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  purchaseUpdatedListener,
  purchaseErrorListener
} from 'react-native-iap';

// On app launch
await initConnection();

// Android only - clear ghost purchases
if (Platform.OS === 'android') {
  await flushFailedPurchasesCachedAsPendingAndroid();
}

// Setup listeners (ONCE)
purchaseUpdatedListener(handlePurchase);
purchaseErrorListener(handleError);
```

### Purchase States

```javascript
// Android
purchase.purchaseStateAndroid === 0  // UNSPECIFIED (error)
purchase.purchaseStateAndroid === 1  // PURCHASED ✅
purchase.purchaseStateAndroid === 2  // PENDING ⏳

// iOS
purchase.transactionState === 'purchasing'  // In progress
purchase.transactionState === 'purchased'   // Success ✅
purchase.transactionState === 'failed'      // Failed ❌
```

### Finishing Transactions

```javascript
// Unified (recommended v4.1.0+)
await finishTransaction(purchase, isConsumable);

// Platform-specific (legacy)
// iOS
await finishTransactionIOS(purchase.transactionId);

// Android - Non-consumable
await acknowledgePurchaseAndroid(purchase.purchaseToken);

// Android - Consumable
await consumePurchaseAndroid(purchase.purchaseToken);
```

---

## 🎯 Trial Detection

### iOS (Receipt Validation)

```javascript
// Requires backend validation for production
const receipt = await validateReceiptIos({
  'receipt-data': purchase.transactionReceipt,
  password: IOS_SHARED_SECRET
}, true); // Extended validation

const isInTrial = receipt.isTrialPeriod === true;
```

### Android (Calculate from Product)

```javascript
const products = await getProducts([purchase.productId]);
const trialPeriod = products[0].freeTrialPeriodAndroid; // "P7D"

const trialDays = parseInt(trialPeriod.replace('P', '').replace('D', ''));
const trialEndDate = new Date(purchase.transactionDate);
trialEndDate.setDate(trialEndDate.getDate() + trialDays);

const isInTrial = new Date() < trialEndDate;
```

---

## 🐛 Error Handling

### User Cancellation

```javascript
purchaseErrorListener((error) => {
  if (error.code === 'E_USER_CANCELLED') {
    // Not an error - user backed out
    console.log('Purchase cancelled by user');
    return;
  }

  // Handle real errors
  console.error('Purchase failed:', error);
});
```

### Error Codes Reference

```javascript
'E_USER_CANCELLED'     // User cancelled purchase flow
'E_ALREADY_OWNED'      // User already owns product
'E_ITEM_UNAVAILABLE'   // Product not available
'E_NETWORK_ERROR'      // Network failure
'E_DEVELOPER_ERROR'    // Configuration error
```

---

## 🔄 Duplicate Prevention

### Memory Tracking

```javascript
const processedTransactions = new Set();

function handlePurchase(purchase) {
  if (processedTransactions.has(purchase.transactionId)) {
    console.log('Duplicate detected');
    return;
  }

  processedTransactions.add(purchase.transactionId);
  // Process purchase...
}
```

### Database Constraint

```sql
CREATE TABLE purchases (
  transaction_id TEXT UNIQUE NOT NULL,  -- Prevents duplicates
  -- other fields...
);
```

---

## 📱 Platform Differences

| Feature | iOS | Android |
|---------|-----|---------|
| State field | `transactionState` | `purchaseStateAndroid` |
| Finish required | ✅ Yes | ✅ Yes (acknowledge/consume) |
| Pending common | ❌ Rare | ✅ Common (cash payments) |
| Clear ghosts | ❌ Not needed | ✅ `flushFailedPurchases...` |
| Multiple products | ❌ One at a time | ✅ Multiple per transaction |

---

## ⚡ Quick Snippets

### Initialize IAP (useEffect)

```javascript
useEffect(() => {
  const init = async () => {
    await initConnection();
    if (Platform.OS === 'android') {
      await flushFailedPurchasesCachedAsPendingAndroid();
    }

    const purchaseUpdate = purchaseUpdatedListener(handlePurchase);
    const purchaseError = purchaseErrorListener(handleError);

    return () => {
      purchaseUpdate.remove();
      purchaseError.remove();
      endConnection();
    };
  };

  init();
}, []);
```

### Retry with Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

### Check Purchase State

```javascript
function isPurchased(purchase) {
  if (Platform.OS === 'ios') {
    return purchase.transactionState === 'purchased';
  }
  if (Platform.OS === 'android') {
    return purchase.purchaseStateAndroid === 1;
  }
}

function isPending(purchase) {
  if (Platform.OS === 'ios') {
    return purchase.transactionState === 'purchasing';
  }
  if (Platform.OS === 'android') {
    return purchase.purchaseStateAndroid === 2;
  }
}
```

---

## 🎓 Best Practices

1. **Listener Setup**: Setup at app launch, NOT in component lifecycle
2. **Error Handling**: Always wrap in try-catch, implement retry logic
3. **Backend Validation**: Always validate receipts on backend for security
4. **Idempotency**: Make all operations idempotent (safe to retry)
5. **Logging**: Log every step for debugging purchase issues
6. **Testing**: Test with real money in sandbox (behavior differs from production)

---

## 🚫 Common Mistakes

1. ❌ Not calling `finishTransaction()` → Auto-refund
2. ❌ Finishing before database save → Lost purchase
3. ❌ Finishing PENDING purchases → Error
4. ❌ Not checking for duplicates → Double-charging
5. ❌ Not flushing failed Android purchases → Ghost purchases
6. ❌ Multiple listener setups → Duplicate callbacks
7. ❌ No retry logic → Lost purchases on network failure

---

## 📚 Full Documentation

See `iap_edge_cases_research.md` for complete edge case documentation with detailed explanations and examples.

---

**Last Updated**: 2025-11-07
