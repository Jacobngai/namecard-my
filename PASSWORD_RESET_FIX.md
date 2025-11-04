# Password Reset Fix - Deep Linking Configuration

## ✅ **What Was Fixed**

The password reset email link wasn't working because it was pointing to a website (`https://namecard.my/reset-password`) instead of opening your mobile app.

### Changes Made:

1. **Added Deep Linking Scheme** (`app.json`)
   - Added `"scheme": "whatscard"` to enable deep linking

2. **Updated Redirect URLs** (`services/supabase.ts`)
   - Password Reset: `whatscard://reset-password`
   - Email Confirmation: `whatscard://auth-confirm`

## 🔧 **Required: Configure Supabase Dashboard**

**CRITICAL STEP - You must do this for password reset to work!**

1. Go to your Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/wvahortlayplumgrcmvi/auth/url-configuration
   ```

2. Scroll to **"Redirect URLs"** section

3. Add these URLs to the **"Additional Redirect URLs"** field:
   ```
   whatscard://reset-password
   whatscard://auth-confirm
   whatscard://**
   ```

4. Click **Save**

### Screenshot Guide:

Navigate to: **Authentication → URL Configuration**

In the "Additional Redirect URLs" textarea, add:
```
whatscard://reset-password
whatscard://auth-confirm
whatscard://**
```

The `**` wildcard allows any deep link from your app.

## 📱 **How It Works Now**

### Before (Broken):
1. User clicks "Forgot Password"
2. Email sent with link to `https://namecard.my/reset-password`
3. Opens browser (doesn't work - no website exists)
4. ❌ User stuck

### After (Fixed):
1. User clicks "Forgot Password"
2. Email sent with link to `whatscard://reset-password?token=...`
3. Opens WhatsCard app directly
4. ✅ App handles password reset

## 🧪 **Testing the Fix**

### Test Password Reset Flow:

1. **Rebuild your app** (important - scheme change requires rebuild):
   ```bash
   cd NamecardMobile
   npm run start:clear
   ```
   Then press 'a' for Android or 'i' for iOS

2. **Trigger password reset**:
   - Open app
   - Tap "Forgot Password?"
   - Enter your email
   - Tap "Send Reset Link"

3. **Check your email**:
   - Open the password reset email
   - Click the "Reset Password" link
   - **Should open the app** (not a browser)

4. **Verify deep link**:
   - The app should receive the deep link
   - Currently shows the app (AuthScreen or main app)
   - In future, we can add a dedicated password reset screen

## 🚨 **Important Notes**

### For Development (Expo Go):

If using Expo Go, test with:
```bash
npx uri-scheme open whatscard://reset-password --ios
# or
npx uri-scheme open whatscard://reset-password --android
```

### For Production Build:

When you build standalone apps, the deep linking will work automatically with the `scheme` we added.

### Email Template Configuration:

The password reset email template in Supabase uses:
```html
<a href="{{ .ConfirmationURL }}">Reset Password</a>
```

The `{{ .ConfirmationURL }}` variable automatically uses the `redirectTo` parameter we set in the code (`whatscard://reset-password`).

## 🎯 **Next Steps (Optional Enhancement)**

Currently, when users click the reset link, the app opens but doesn't show a password reset form. To add this:

1. Create a `ResetPasswordScreen.tsx`
2. Add deep link handling in `App.tsx`
3. Parse the token from the URL
4. Show a form to enter new password
5. Call `supabase.auth.updateUser({ password: newPassword })`

For now, the app opening is progress - the deep link is working!

## 🔍 **Debugging Deep Links**

If the link doesn't open the app:

1. **Check Supabase Dashboard**:
   - Verify `whatscard://reset-password` is in Redirect URLs
   - Verify `whatscard://**` wildcard is added

2. **Check App Scheme**:
   ```bash
   cat NamecardMobile/app.json | grep scheme
   ```
   Should show: `"scheme": "whatscard",`

3. **Test Deep Link Manually**:
   ```bash
   # iOS
   xcrun simctl openurl booted whatscard://reset-password

   # Android
   adb shell am start -a android.intent.action.VIEW -d "whatscard://reset-password"
   ```

4. **Check Console Logs**:
   - Look for deep link events in Metro bundler console
   - Check for URL handling logs

## 📋 **Checklist**

- [x] Added `"scheme": "whatscard"` to `app.json`
- [x] Updated `resetPassword()` redirect URL
- [x] Updated `signUp()` redirect URL
- [x] Updated `resendVerificationEmail()` redirect URL
- [ ] **YOU MUST DO**: Add redirect URLs to Supabase Dashboard
- [ ] Test password reset email in real device/simulator
- [ ] (Optional) Create password reset screen

## ⚡ **Quick Fix Summary**

**Problem**: Password reset link opened browser instead of app

**Solution**:
1. Added deep linking with `whatscard://` scheme
2. Changed redirect URLs from website to app scheme
3. Must configure Supabase Dashboard to allow these URLs

**Action Required**:
👉 **Add the redirect URLs to Supabase Dashboard NOW!**

---

## 🆘 **Still Not Working?**

If after adding redirect URLs to Supabase Dashboard, the link still doesn't work:

1. Clear Supabase cache:
   - Dashboard → Project Settings → API → Restart Project

2. Rebuild app completely:
   ```bash
   cd NamecardMobile
   npm run clean:all
   npm install
   npm run start:clear
   ```

3. Test with a fresh password reset request (old emails have old links)

4. Check email source to verify the link uses `whatscard://` not `https://`
