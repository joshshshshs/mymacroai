/**
 * Tier Configuration - Premium Feature Definitions
 *
 * Defines usage limits and feature access for each subscription tier
 */

export type SubscriptionTier = 'free' | 'pro' | 'founder';

export interface TierLimits {
    // AI Features
    aiChat: number;           // messages per day (-1 = unlimited)
    photoEstimate: number;    // per day
    voiceLog: number;         // per day
    barcodeScan: number;      // per day

    // Social Features
    recipesPublish: number;   // per month
    friendsMax: number;       // total

    // Data & Storage
    historyDays: number;      // data retention days
    wearables: number;        // connected devices
    progressPhotos: number;   // max stored

    // Rewards
    macroCoinRate: number;    // multiplier (1.0 = 100%)
    streakFreezes: number;    // free per month
}

export interface TierFeatures {
    // Health Features
    hrvAnalysis: boolean;
    stressTracking: boolean;
    sleepPhases: boolean;
    cycleTracking: boolean;
    recoveryScore: boolean;

    // Body Composition
    bodyScan: boolean;
    progressVault: boolean;
    aiBodyAnalysis: boolean;

    // Squad Features
    createChallenges: boolean;
    privateSquads: boolean;
    unlimitedFriends: boolean;

    // Data Features
    exportData: boolean;
    unlimitedHistory: boolean;

    // Experience
    adFree: boolean;
    prioritySupport: boolean;
    priorityAI: boolean;

    // Founder Exclusive
    founderBadge: boolean;
    earlyAccess: boolean;
    exclusiveThemes: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
    free: {
        aiChat: 20,
        photoEstimate: 3,
        voiceLog: 5,
        barcodeScan: 10,
        recipesPublish: 2,
        friendsMax: 10,
        historyDays: 30,
        wearables: 1,
        progressPhotos: 5,
        macroCoinRate: 0.5,
        streakFreezes: 0,
    },
    pro: {
        aiChat: -1,
        photoEstimate: -1,
        voiceLog: -1,
        barcodeScan: -1,
        recipesPublish: -1,
        friendsMax: -1,
        historyDays: -1,
        wearables: -1,
        progressPhotos: -1,
        macroCoinRate: 1.0,
        streakFreezes: 1,
    },
    founder: {
        aiChat: -1,
        photoEstimate: -1,
        voiceLog: -1,
        barcodeScan: -1,
        recipesPublish: -1,
        friendsMax: -1,
        historyDays: -1,
        wearables: -1,
        progressPhotos: -1,
        macroCoinRate: 2.0,
        streakFreezes: 3,
    },
};

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
    free: {
        hrvAnalysis: false,
        stressTracking: false,
        sleepPhases: false,
        cycleTracking: false,
        recoveryScore: false,
        bodyScan: false,
        progressVault: false,
        aiBodyAnalysis: false,
        createChallenges: false,
        privateSquads: false,
        unlimitedFriends: false,
        exportData: false,
        unlimitedHistory: false,
        adFree: false,
        prioritySupport: false,
        priorityAI: false,
        founderBadge: false,
        earlyAccess: false,
        exclusiveThemes: false,
    },
    pro: {
        hrvAnalysis: true,
        stressTracking: true,
        sleepPhases: true,
        cycleTracking: true,
        recoveryScore: true,
        bodyScan: true,
        progressVault: true,
        aiBodyAnalysis: true,
        createChallenges: true,
        privateSquads: true,
        unlimitedFriends: true,
        exportData: true,
        unlimitedHistory: true,
        adFree: true,
        prioritySupport: true,
        priorityAI: true,
        founderBadge: false,
        earlyAccess: false,
        exclusiveThemes: false,
    },
    founder: {
        hrvAnalysis: true,
        stressTracking: true,
        sleepPhases: true,
        cycleTracking: true,
        recoveryScore: true,
        bodyScan: true,
        progressVault: true,
        aiBodyAnalysis: true,
        createChallenges: true,
        privateSquads: true,
        unlimitedFriends: true,
        exportData: true,
        unlimitedHistory: true,
        adFree: true,
        prioritySupport: true,
        priorityAI: true,
        founderBadge: true,
        earlyAccess: true,
        exclusiveThemes: true,
    },
};

// Pricing (in cents for precision)
export const TIER_PRICING = {
    pro: {
        monthly: 999,      // $9.99/month
        yearly: 7999,      // $79.99/year (33% savings)
        monthlyDisplay: '$9.99',
        yearlyDisplay: '$79.99',
        yearlySavings: '33%',
    },
    founder: {
        lifetime: 14999,   // $149.99 one-time
        lifetimeDisplay: '$149.99',
        spotsTotal: 500,
    },
};

// RevenueCat Product IDs
export const RC_PRODUCTS = {
    PRO_MONTHLY: 'mymacro_pro_monthly',
    PRO_YEARLY: 'mymacro_pro_yearly',
    FOUNDER_LIFETIME: 'mymacro_founder_lifetime',
};

// MacroCoin Consumable Products (for top-up purchases)
export const RC_COIN_PRODUCTS = {
    COINS_500: 'mymacro_coins_500',
    COINS_1200: 'mymacro_coins_1200',
    COINS_3000: 'mymacro_coins_3000',
    COINS_7500: 'mymacro_coins_7500',
    COINS_20000: 'mymacro_coins_20000',
};

// Coin package definitions (matches product IDs)
export interface CoinPackageConfig {
    id: string;
    productId: string;
    coins: number;
    price: number;
    bonus?: string;
    popular?: boolean;
    bestValue?: boolean;
}

export const COIN_PACKAGES: CoinPackageConfig[] = [
    { id: 'coins_500', productId: RC_COIN_PRODUCTS.COINS_500, coins: 500, price: 0.99 },
    { id: 'coins_1200', productId: RC_COIN_PRODUCTS.COINS_1200, coins: 1200, price: 1.99, bonus: '+20%' },
    { id: 'coins_3000', productId: RC_COIN_PRODUCTS.COINS_3000, coins: 3000, price: 4.99, bonus: '+50%', popular: true },
    { id: 'coins_7500', productId: RC_COIN_PRODUCTS.COINS_7500, coins: 7500, price: 9.99, bonus: '+87%' },
    { id: 'coins_20000', productId: RC_COIN_PRODUCTS.COINS_20000, coins: 20000, price: 19.99, bonus: '+100%', bestValue: true },
];

// RevenueCat Entitlements
export const RC_ENTITLEMENTS = {
    PRO: 'pro',
    FOUNDER: 'founder',
};

/**
 * Check if a limit is unlimited (-1)
 */
export const isUnlimited = (limit: number): boolean => limit === -1;

/**
 * Get display text for a limit
 */
export const getLimitDisplay = (limit: number): string => {
    if (limit === -1) return 'Unlimited';
    return limit.toString();
};

/**
 * Feature names for display
 */
export const FEATURE_NAMES: Record<keyof TierFeatures, string> = {
    hrvAnalysis: 'HRV Analysis',
    stressTracking: 'Stress Tracking',
    sleepPhases: 'Sleep Phase Analysis',
    cycleTracking: 'Cycle & Hormone Tracking',
    recoveryScore: 'Recovery Scoring',
    bodyScan: '3-Angle Body Scan',
    progressVault: 'Progress Photo Vault',
    aiBodyAnalysis: 'AI Body Composition',
    createChallenges: 'Create Squad Challenges',
    privateSquads: 'Private Squads',
    unlimitedFriends: 'Unlimited Friends',
    exportData: 'Export Your Data',
    unlimitedHistory: 'Unlimited History',
    adFree: 'Ad-Free Experience',
    prioritySupport: 'Priority Support',
    priorityAI: 'Priority AI Access',
    founderBadge: 'Founder Badge',
    earlyAccess: 'Early Feature Access',
    exclusiveThemes: 'Exclusive Themes',
};

/**
 * Usage feature keys (for tracking)
 */
export type UsageFeature =
    | 'ai_chat'
    | 'photo_estimate'
    | 'voice_log'
    | 'barcode_scan'
    | 'recipe_publish';

export const USAGE_FEATURE_LIMITS: Record<UsageFeature, keyof TierLimits> = {
    ai_chat: 'aiChat',
    photo_estimate: 'photoEstimate',
    voice_log: 'voiceLog',
    barcode_scan: 'barcodeScan',
    recipe_publish: 'recipesPublish',
};
