# MyMacroAI - App Store Setup Guide

Complete these steps before submitting to the App Store.

---

## 1. REVENUECAT SETUP (In-App Purchases)

### Step 1: Create RevenueCat Account
1. Go to https://app.revenuecat.com/signup
2. Create your account and a new project named "MyMacroAI"

### Step 2: Get API Keys
1. In RevenueCat dashboard, go to **Project Settings > API Keys**
2. Copy the **Public iOS API Key** (starts with `appl_`)
3. Copy the **Public Android API Key** (starts with `goog_`)

### Step 3: Update the Code
Edit `src/services/paywall/RevenueCat.ts`:
```typescript
const API_KEYS = {
    apple: "appl_YOUR_ACTUAL_IOS_KEY_HERE",
    google: "goog_YOUR_ACTUAL_ANDROID_KEY_HERE"
};
```

### Step 4: Configure Products in App Store Connect
1. Go to **App Store Connect > My Apps > MyMacroAI > In-App Purchases**
2. Create products:
   - `mymacro_pro_monthly` - $9.99/month
   - `mymacro_pro_annual` - $79.99/year
   - `mymacro_pro_lifetime` - $199.99 one-time
3. Submit products for review

### Step 5: Configure Offerings in RevenueCat
1. In RevenueCat, go to **Products** and add your App Store product IDs
2. Create an **Offering** called "default"
3. Add packages: Monthly, Annual, Lifetime
4. Create an **Entitlement** called "pro"

### Step 6: Connect App Store to RevenueCat
1. In RevenueCat, go to **Integrations > App Store Connect**
2. Add your App Store Connect API key (create at https://appstoreconnect.apple.com/access/api)
3. Enable server notifications

---

## 2. SUPABASE DATABASE SETUP

### Step 1: Apply Migration
Run this command from the `MyMacroAI` directory:
```bash
npx supabase db push
```

Or apply manually in Supabase Dashboard > SQL Editor, run the contents of:
- `supabase/migrations/20240114_create_app_tables.sql`

### Step 2: Verify Tables Created
Confirm these tables exist:
- `recovery_data`
- `cycle_tracking`
- `squad_members`
- `squads`
- `reactions`
- `founders`

### Step 3: Deploy Edge Function
```bash
npx supabase functions deploy ai-proxy
```

---

## 3. ENVIRONMENT VARIABLES

### Step 1: Create `.env` file
Create a `.env` file in the `MyMacroAI` directory:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_KEY_HERE

# Gemini AI (for Edge Function)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_YOUR_KEY
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_YOUR_KEY
```

### Step 2: Add Secrets to Supabase
```bash
npx supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Where to Get Keys:
- **Supabase**: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
- **Gemini API**: https://aistudio.google.com/app/apikey
- **RevenueCat**: https://app.revenuecat.com (see Section 1)

---

## 4. SOUND ASSETS

### Step 1: Create Assets Directory
```bash
mkdir -p assets/sounds
```

### Step 2: Add Sound Files
Add these audio files (MP3 or WAV, ~50-100KB each):
- `assets/sounds/thock.mp3` - Deep satisfying click (for logging actions)
- `assets/sounds/whoosh.mp3` - Smooth transition (for navigation)
- `assets/sounds/success.mp3` - Success chime (for completed actions)
- `assets/sounds/error.mp3` - Error beep (for failures)
- `assets/sounds/pop.mp3` - Light popup sound (for dialogs)
- `assets/sounds/swipe.mp3` - Swipe gesture sound

### Step 3: Update SoundEffectsService
Edit `src/services/audio/SoundEffectsService.ts`, replace line 95-99:
```typescript
private getSoundFile(type: SoundEffectType) {
  switch (type) {
    case 'thock': return require('../../../assets/sounds/thock.mp3');
    case 'whoosh': return require('../../../assets/sounds/whoosh.mp3');
    case 'success': return require('../../../assets/sounds/success.mp3');
    case 'error': return require('../../../assets/sounds/error.mp3');
    case 'pop': return require('../../../assets/sounds/pop.mp3');
    case 'swipe': return require('../../../assets/sounds/swipe.mp3');
  }
}

// Then update createTone method:
private async createTone(type: SoundEffectType): Promise<{ sound: Audio.Sound }> {
  const { sound } = await Audio.Sound.createAsync(
    this.getSoundFile(type),
    { shouldPlay: false, volume: this.volume }
  );
  return { sound };
}
```

### Recommended Sound Sources:
- https://freesound.org (free, attribution)
- https://www.zapsplat.com (free with account)
- https://audiojungle.net (paid, commercial)

---

## 5. WEARABLE OAUTH SETUP

### Oura Ring Integration
1. Go to https://cloud.ouraring.com/oauth/applications
2. Create application:
   - Name: MyMacroAI
   - Redirect URI: `mymacroai://oauth/oura`
3. Note your Client ID and Client Secret
4. Add to environment:
```env
OURA_CLIENT_ID=your_client_id
OURA_CLIENT_SECRET=your_client_secret
```

### Whoop Integration
1. Apply at https://developer.whoop.com
2. Once approved, create application
3. Redirect URI: `mymacroai://oauth/whoop`
4. Add to environment:
```env
WHOOP_CLIENT_ID=your_client_id
WHOOP_CLIENT_SECRET=your_client_secret
```

### Garmin Integration
1. Apply at https://developer.garmin.com/gc-developer-program/
2. This requires business verification (takes 2-4 weeks)
3. Redirect URI: `mymacroai://oauth/garmin`

### Implementation Notes:
The OAuth flows need to be implemented in the WearableAdapter service. The current code has placeholder functions for `fetchOuraData`, `fetchWhoopData`, and `fetchGarminData`.

---

## 6. HEALTHKIT WRITE PERMISSIONS

Already configured in `app.json`. No additional setup needed.

The app requests these permissions:
- **Read**: Steps, Heart Rate, Sleep, Active Energy
- **Write**: Water intake, Body weight, Body fat percentage

To add more write permissions, update `app.json`:
```json
{
  "ios": {
    "infoPlist": {
      "NSHealthShareUsageDescription": "...",
      "NSHealthUpdateUsageDescription": "..."
    }
  }
}
```

---

## 7. APP ICONS & SPLASH SCREEN

### Step 1: Create Icons
You need these image files:

| File | Size | Notes |
|------|------|-------|
| `assets/icon.png` | 1024x1024 | App Store icon |
| `assets/adaptive-icon.png` | 1024x1024 | Android adaptive icon (foreground) |
| `assets/splash-icon.png` | 512x512 | Splash screen logo |
| `assets/favicon.png` | 48x48 | Web favicon |

### Step 2: Design Requirements
- No transparency for iOS App Store icon
- Keep important content in center 66% for adaptive icons
- Use your brand colors (#06B6D4 cyan, #0F172A dark blue)

### Step 3: Update app.json (Optional)
Change background colors if needed:
```json
{
  "expo": {
    "splash": {
      "backgroundColor": "#0F172A"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0F172A"
      }
    }
  }
}
```

### Tools for Creating Icons:
- https://www.figma.com (design)
- https://appicon.co (resize to all required sizes)
- https://maskable.app (test Android adaptive icons)

---

## 8. PRIVACY POLICY

### Step 1: Create Privacy Policy
Create a privacy policy that covers:
- Data collected (health data, food logs, biometrics)
- How data is used (AI analysis, personalization)
- Third-party services (Supabase, RevenueCat, Gemini AI)
- Data retention and deletion
- User rights (GDPR/CCPA compliance)

### Step 2: Host Privacy Policy
Options:
1. Your website: `https://yourdomain.com/privacy`
2. GitHub Pages: Free, easy setup
3. Notion public page: Quick but less professional

### Step 3: Update app.json
Add the privacy policy URL:
```json
{
  "expo": {
    "ios": {
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": []
      }
    }
  }
}
```

### Step 4: App Store Connect
1. Go to **App Store Connect > My Apps > MyMacroAI > App Privacy**
2. Complete the privacy questionnaire
3. Add your Privacy Policy URL

---

## 9. ANALYTICS SETUP (Optional but Recommended)

### Mixpanel
1. Create account at https://mixpanel.com
2. Get Project Token from Project Settings
3. Install: `npx expo install mixpanel-react-native`
4. Add tracking code (see Mixpanel docs)

### Amplitude
1. Create account at https://amplitude.com
2. Get API Key from project settings
3. Install: `npx expo install @amplitude/analytics-react-native`

---

## 10. PUSH NOTIFICATIONS (Optional)

### Step 1: Configure Expo Push
Already set up if using Expo. Get push tokens via `expo-notifications`.

### Step 2: For APNs (iOS)
1. Create APNs key in Apple Developer Portal
2. Upload to Expo dashboard or your notification service
3. Configure in `app.json`:
```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": false
    },
    "notification": {
      "icon": "./assets/notification-icon.png"
    }
  }
}
```

---

## 11. BUNDLE IDENTIFIER UPDATE

Before submission, update the bundle identifier from placeholder:

### In app.json:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.mymacroai"
    },
    "android": {
      "package": "com.yourcompany.mymacroai"
    }
  }
}
```

---

## PRE-SUBMISSION CHECKLIST

- [ ] RevenueCat API keys configured
- [ ] Supabase tables created and edge function deployed
- [ ] Environment variables set (.env file)
- [ ] Sound assets added
- [ ] App icons created (1024x1024)
- [ ] Splash screen configured
- [ ] Privacy policy created and hosted
- [ ] Privacy policy URL added to App Store Connect
- [ ] Bundle identifier updated from "com.anonymous.MyMacroAI"
- [ ] Test in-app purchases in sandbox mode
- [ ] Test HealthKit permissions on real device
- [ ] Remove any remaining console.logs (already done)
- [ ] Error boundaries added (already done)

---

## BUILD & SUBMIT

### Development Build
```bash
npx expo prebuild
npx expo run:ios
```

### Production Build
```bash
eas build --platform ios --profile production
```

### Submit to App Store
```bash
eas submit --platform ios
```

---

## SUPPORT

If you encounter issues:
1. Check Expo documentation: https://docs.expo.dev
2. RevenueCat support: https://community.revenuecat.com
3. Supabase support: https://supabase.com/docs
