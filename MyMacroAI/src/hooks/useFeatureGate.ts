/**
 * useFeatureGate - Feature Gating & Usage Tracking Hook
 *
 * Implements the "Missing Tier" strategy:
 * - Free: Limited access with penalized rewards
 * - Pro: Full access with standard rewards
 * - Founder: Full access with 2x rewards + exclusives
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEntitlements } from './useEntitlements';
import {
    SubscriptionTier,
    TierFeatures,
    TierLimits,
    isUnlimited,
    FEATURE_NAMES,
    UsageFeature,
    USAGE_FEATURE_LIMITS,
} from '../config/tiers';

// Storage keys for usage tracking
const USAGE_KEY_PREFIX = '@usage_';
const getUsageKey = (feature: UsageFeature) => `${USAGE_KEY_PREFIX}${feature}`;
const getDateKey = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

interface UsageData {
    count: number;
    date: string;
}

interface FeatureGateResult {
    // Access checks
    canAccess: (feature: keyof TierFeatures) => boolean;
    canUse: (feature: UsageFeature) => Promise<boolean>;

    // Usage tracking
    trackUsage: (feature: UsageFeature) => Promise<void>;
    getUsageCount: (feature: UsageFeature) => Promise<number>;
    getRemainingUses: (feature: UsageFeature) => Promise<number>;

    // Limits
    getLimit: (feature: keyof TierLimits) => number;
    isUnlimitedFeature: (feature: keyof TierLimits) => boolean;

    // Upgrade prompts
    showUpgradePrompt: (feature: string, requiredTier?: SubscriptionTier) => void;

    // Cycle tracking specific
    canUseCycleMacroOptimization: boolean;
    canLogPeriodDates: boolean;

    // AI specific
    aiMessagesRemaining: number;
    isAILimited: boolean;

    // Coin rate
    coinMultiplier: number;
    coinRateDisplay: string;
}

/**
 * Main feature gate hook
 */
export function useFeatureGate(): FeatureGateResult {
    const { tier, limits, features, coinMultiplier, hasPremium, isFounder } = useEntitlements();
    const [aiUsageToday, setAiUsageToday] = useState(0);

    // Load AI usage on mount
    useEffect(() => {
        loadUsage('ai_chat').then(setAiUsageToday);
    }, []);

    /**
     * Check if user can access a boolean feature
     */
    const canAccess = useCallback(
        (feature: keyof TierFeatures): boolean => {
            return features[feature] === true;
        },
        [features]
    );

    /**
     * Check if user can use a usage-limited feature
     * Returns false if limit reached (for free users)
     */
    const canUse = useCallback(
        async (feature: UsageFeature): Promise<boolean> => {
            const limitKey = USAGE_FEATURE_LIMITS[feature];
            const limit = limits[limitKey];

            // Unlimited access
            if (isUnlimited(limit)) return true;

            // Check current usage
            const usage = await loadUsage(feature);
            return usage < limit;
        },
        [limits]
    );

    /**
     * Track usage of a limited feature
     */
    const trackUsage = useCallback(async (feature: UsageFeature): Promise<void> => {
        const key = getUsageKey(feature);
        const today = getDateKey();

        try {
            const stored = await AsyncStorage.getItem(key);
            let data: UsageData = stored ? JSON.parse(stored) : { count: 0, date: today };

            // Reset if new day
            if (data.date !== today) {
                data = { count: 0, date: today };
            }

            data.count += 1;
            await AsyncStorage.setItem(key, JSON.stringify(data));

            // Update local state for AI
            if (feature === 'ai_chat') {
                setAiUsageToday(data.count);
            }
        } catch (error) {
            console.error('[useFeatureGate] Error tracking usage:', error);
        }
    }, []);

    /**
     * Get current usage count for a feature
     */
    const getUsageCount = useCallback(async (feature: UsageFeature): Promise<number> => {
        return loadUsage(feature);
    }, []);

    /**
     * Get remaining uses for a feature (-1 if unlimited)
     */
    const getRemainingUses = useCallback(
        async (feature: UsageFeature): Promise<number> => {
            const limitKey = USAGE_FEATURE_LIMITS[feature];
            const limit = limits[limitKey];

            if (isUnlimited(limit)) return -1;

            const usage = await loadUsage(feature);
            return Math.max(0, limit - usage);
        },
        [limits]
    );

    /**
     * Get limit value for a feature
     */
    const getLimit = useCallback(
        (feature: keyof TierLimits): number => {
            return limits[feature];
        },
        [limits]
    );

    /**
     * Check if a feature is unlimited
     */
    const isUnlimitedFeature = useCallback(
        (feature: keyof TierLimits): boolean => {
            return isUnlimited(limits[feature]);
        },
        [limits]
    );

    /**
     * Show upgrade prompt with paywall navigation
     */
    const showUpgradePrompt = useCallback(
        (feature: string, requiredTier: SubscriptionTier = 'pro') => {
            const tierName = requiredTier === 'founder' ? 'Founder' : 'Pro';

            Alert.alert(
                `Unlock ${feature}`,
                `This feature requires a ${tierName} subscription. Upgrade now to unlock unlimited access and premium features.`,
                [
                    { text: 'Maybe Later', style: 'cancel' },
                    {
                        text: 'View Plans',
                        style: 'default',
                        onPress: () => router.push('/premium'),
                    },
                ]
            );
        },
        []
    );

    // =========================================================================
    // Cycle Tracking (The "Missing Tier" Strategy)
    // =========================================================================

    /**
     * Free: Can log period dates only
     * Pro/Founder: Full cycle-synced macro optimization
     */
    const canLogPeriodDates = true; // Always available
    const canUseCycleMacroOptimization = hasPremium;

    // =========================================================================
    // AI Limits
    // =========================================================================

    const aiLimit = limits.aiChat;
    const isAILimited = !isUnlimited(aiLimit);
    const aiMessagesRemaining = useMemo(() => {
        if (!isAILimited) return -1;
        return Math.max(0, aiLimit - aiUsageToday);
    }, [isAILimited, aiLimit, aiUsageToday]);

    // =========================================================================
    // Coin Rate Display
    // =========================================================================

    const coinRateDisplay = useMemo(() => {
        if (isFounder) return '2x Coins';
        if (hasPremium) return 'Standard';
        return '0.5x Coins';
    }, [isFounder, hasPremium]);

    return {
        canAccess,
        canUse,
        trackUsage,
        getUsageCount,
        getRemainingUses,
        getLimit,
        isUnlimitedFeature,
        showUpgradePrompt,
        canUseCycleMacroOptimization,
        canLogPeriodDates,
        aiMessagesRemaining,
        isAILimited,
        coinMultiplier,
        coinRateDisplay,
    };
}

// =========================================================================
// Helper Functions
// =========================================================================

async function loadUsage(feature: UsageFeature): Promise<number> {
    const key = getUsageKey(feature);
    const today = getDateKey();

    try {
        const stored = await AsyncStorage.getItem(key);
        if (!stored) return 0;

        const data: UsageData = JSON.parse(stored);

        // Reset if new day
        if (data.date !== today) {
            return 0;
        }

        return data.count;
    } catch (error) {
        return 0;
    }
}

// =========================================================================
// Specialized Hooks
// =========================================================================

/**
 * Hook for AI message gating
 */
export function useAIGate() {
    const { canUse, trackUsage, aiMessagesRemaining, isAILimited, showUpgradePrompt } =
        useFeatureGate();

    const checkAndTrack = useCallback(async (): Promise<boolean> => {
        const canSend = await canUse('ai_chat');

        if (!canSend) {
            showUpgradePrompt('Unlimited AI Messages');
            return false;
        }

        await trackUsage('ai_chat');
        return true;
    }, [canUse, trackUsage, showUpgradePrompt]);

    return {
        canSendMessage: checkAndTrack,
        messagesRemaining: aiMessagesRemaining,
        isLimited: isAILimited,
    };
}

/**
 * Hook for cycle tracking feature gate
 */
export function useCycleGate() {
    const { canUseCycleMacroOptimization, canLogPeriodDates, showUpgradePrompt } = useFeatureGate();

    const checkMacroOptimization = useCallback((): boolean => {
        if (!canUseCycleMacroOptimization) {
            showUpgradePrompt('Cycle-Synced Macro Optimization');
            return false;
        }
        return true;
    }, [canUseCycleMacroOptimization, showUpgradePrompt]);

    return {
        canLogPeriod: canLogPeriodDates,
        canOptimizeMacros: canUseCycleMacroOptimization,
        checkMacroOptimization,
    };
}

/**
 * Hook for body scan feature gate
 */
export function useBodyScanGate() {
    const { canAccess, showUpgradePrompt } = useFeatureGate();

    const canUseBodyScan = canAccess('bodyScan');
    const canUseAIAnalysis = canAccess('aiBodyAnalysis');
    const canUseVault = canAccess('progressVault');

    const checkBodyScan = useCallback((): boolean => {
        if (!canUseBodyScan) {
            showUpgradePrompt('3-Angle Body Scan');
            return false;
        }
        return true;
    }, [canUseBodyScan, showUpgradePrompt]);

    return {
        canUseBodyScan,
        canUseAIAnalysis,
        canUseVault,
        checkBodyScan,
    };
}

/**
 * Hook for wearable sync feature gate
 */
export function useWearableGate() {
    const { limits, hasPremium, showUpgradePrompt } = useFeatureGate();

    const maxDevices = limits.wearables;
    const canSyncUnlimited = isUnlimited(maxDevices);

    const checkWearableSync = useCallback(
        (currentDevices: number): boolean => {
            if (canSyncUnlimited) return true;

            if (currentDevices >= maxDevices) {
                showUpgradePrompt('Unlimited Wearable Sync');
                return false;
            }
            return true;
        },
        [canSyncUnlimited, maxDevices, showUpgradePrompt]
    );

    return {
        maxDevices,
        canSyncUnlimited,
        checkWearableSync,
        hasPremium,
    };
}

export default useFeatureGate;
