# 💰 Pricing Update - OTA Deployment

## 📊 New Pricing (Effective Immediately via OTA)

### Changes Made:

| Plan | Old Price | New Price | Change |
|------|-----------|-----------|--------|
| Basic Monthly | $5.95 | $5.95 | ✅ No change |
| Basic Yearly | $71.50 | **$71.99** | 📈 +$0.49 |
| Premium Monthly | $9.95 | **$9.99** | 📈 +$0.04 |
| Premium Yearly | $119.40 | **$119.99** | 📈 +$0.59 |

### Promo Price Update:
- **WHATSBNI Code** (70% off Premium Yearly):
  - Old: $35.82
  - New: **$36.00**

---

## 🚀 Deploy OTA Update

### Option 1: Deploy to Production Channel (Recommended)

```bash
# Deploy to production channel for all live users
eas update --channel production --message "Update pricing: Premium yearly $119.99, Premium monthly $9.99, Basic yearly $71.99"
```

**Who gets this update:**
- ✅ All users with production builds
- ✅ Updates within seconds to minutes
- ✅ No App Store review required

---

### Option 2: Deploy to Preview Channel (Testing First)

```bash
# Test on preview channel first
eas update --channel preview --message "Test pricing update"

# After testing, deploy to production:
eas update --channel production --message "Update pricing display"
```

---

### Option 3: Automatic with Branch Push

```bash
# Commit changes
git add config/iap-config.ts
git commit -m "Update pricing: Premium yearly $119.99, Basic yearly $71.99"

# Push to main branch
git push origin main

# If you have automatic deployment set up, OTA will trigger automatically
```

---

## ⚠️ Important Notes

### What OTA Updates:
- ✅ **JavaScript code** (pricing display in UI)
- ✅ **Config values** (IAP_CONFIG.PRICING)
- ✅ **React components** (PaywallScreen, PricingCard)

### What OTA DOES NOT Update:
- ❌ **App Store prices** - Must update manually in App Store Connect
- ❌ **Play Store prices** - Must update manually in Play Console
- ❌ **Native code** - Requires new build

---

## 📱 User Experience After OTA

**On next app open:**
1. App checks for OTA update
2. Downloads new pricing config (small, instant)
3. Restarts and shows new prices
4. No user action required

**Timeline:**
- Active users: 1-5 minutes
- Background users: Next app open
- Offline users: When they reconnect

---

## ✅ Verification Checklist

After deploying OTA update:

- [ ] Run: `eas update:list --channel production --limit 1`
- [ ] Verify update shows in dashboard: https://expo.dev
- [ ] Open app on test device
- [ ] Force close and reopen
- [ ] Navigate to Paywall screen
- [ ] Verify new prices display:
  - Basic Yearly: $71.99 ✅
  - Premium Monthly: $9.99 ✅
  - Premium Yearly: $119.99 ✅

---

## 🎯 Next Steps After OTA

### 1. Update App Store Connect Prices

**iOS App Store Connect:**
1. Go to: https://appstoreconnect.apple.com
2. My Apps → WhatsCard → Subscriptions
3. Update existing subscriptions:
   - `whatscard_premium_monthly`: $9.99 (was $9.95)
   - `whatscard_premium_yearly`: $119.99 (was $119.40)
4. When creating Basic plans:
   - `whatscard_basic_monthly`: $5.95
   - `whatscard_basic_yearly`: $71.99

---

### 2. Update Google Play Console Prices

**Android Play Console:**
1. Go to: https://play.google.com/console
2. Select WhatsCard app
3. Monetize → Subscriptions
4. Update existing subscriptions:
   - `monthly_premium_subscription`: $9.99 (was $9.95)
   - `yearly_premium_subscription`: $119.99 (was $119.40)
5. When creating Basic plans:
   - `basic_monthly_subscription`: $5.95
   - `basic_yearly_subscription`: $71.99

---

## 🔍 Troubleshooting

### Users Still See Old Prices

**Solution:**
```bash
# Force clear OTA cache and redeploy
eas update --channel production --clear-cache --message "Force pricing update"
```

**Ask user to:**
1. Force close app completely
2. Reopen app
3. If still old prices, delete and reinstall app

---

### OTA Update Failed

**Check status:**
```bash
# View recent updates
eas update:list --channel production --limit 5

# View update details
eas update:view [update-id]
```

**Common issues:**
- Build channel mismatch (check eas.json)
- User on very old app version (before OTA was enabled)
- Offline users (will update when online)

---

## 📊 Deployment Commands Summary

**Quick Deploy (Copy & Paste):**

```bash
# 1. Verify current channel
eas channel:view production

# 2. Deploy OTA update
eas update --channel production --message "Update pricing to $71.99 (Basic Yearly), $9.99 (Premium Monthly), $119.99 (Premium Yearly)"

# 3. Verify deployment
eas update:list --channel production --limit 1

# 4. Check update status
# Visit: https://expo.dev/accounts/jacobai/projects/namecard-my/updates
```

---

## 🎉 Success Indicators

✅ **Update deployed successfully if:**
- Command shows: "Published 1 update"
- Expo dashboard shows new update
- Update ID shown in terminal
- Timestamp is recent

✅ **Users received update if:**
- New prices display in app
- No App Store update required
- Works immediately after app restart

---

**Ready to deploy? Run this command now:**

```bash
eas update --channel production --message "Update subscription pricing"
```
