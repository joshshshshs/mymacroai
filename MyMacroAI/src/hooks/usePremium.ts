/**
 * usePremium Hook - Premium Status & Feature Access
 *
 * Provides subscription status, feature checks, and usage tracking
 */

import { useCallback, useEffect, useState } from 'react';
import { useUserStore } from '../store/UserStore';
import { revenueCatService } from '../services/paywall/RevenueCat';
import { supabase } from '../lib/supabase';
import {
    SubscriptionTier,
    TierFeatures,
    TierLimits,
    TIER_LIMITS,
    TIER_FEATURES,
    UsageFeature,
    USAGE_FEATURE_LIMITS,
    isUnlimited,
} from '../config/tiers';

interface UsageStatus {
    used: number;
    limit: number;
    remaining: number;
    isLimited: boolean;
    percentUsed: number;
}

interface PremiumState {
    tier: SubscriptionTier;
    isLoading: boolean;
    isPro: boolean;
    isFounder: boolean;
    isFree: boolean;
    limits: TierLimits;
    features: TierFeatures;
    expiresAt: Date | null;
    isTrialing: boolean;
    trialEndsAt: Date | null;
}

interface UsePremiumReturn extends PremiumState {
    /** Check if user has access to a specific feature */
    hasFeature: (feature: keyof TierFeatures) => boolean;
    /** Get usage status for a limited feature */
    getUsageStatus: (feature: UsageFeature) => Promise<UsageStatus>;
    /** Check if user can use a feature (under limit) */
    canUse: (feature: UsageFeature) => Promise<boolean>;
    /** Record usage of a feature */
    recordUsage: (feature: UsageFeature) => Promise<boolean>;
    /** Refresh subscription status from RevenueCat */
    refreshStatus: () => Promise<void>;
    /** Get remaining uses for a feature */
    getRemainingUses: (feature: UsageFeature) => Promise<number>;
}

/**
 * Hook for accessing premium status and feature gating
 */
export function usePremium(): UsePremiumReturn {
    const isPro = useUserStore((s) => s.isPro);
    const founderStatus = useUserStore((s) => s.founderStatus);
    const setIsPro = useUserStore((s) => s.setIsPro);
    const userId = useUserStore((s) => s.id);

    const [isLoading, setIsLoading] = useState(true);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [isTrialing, setIsTrialing] = useState(false);
    const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);

    // Determine tier
    const tier: SubscriptionTier = founderStatus?.isFounder
        ? 'founder'
        : isPro
            ? 'pro'
            : 'free';

    const limits = TIER_LIMITS[tier];
    const features = TIER_FEATURES[tier];

    // Sync with RevenueCat on mount
    useEffect(() => {
        refreshStatus();
    }, []);

    /**
     * Refresh subscription status from RevenueCat
     */
    const refreshStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const hasProEntitlement = await revenueCatService.checkEntitlement('pro');
            const hasFounderEntitlement = await revenueCatService.checkEntitlement('founder');

            if (hasFounderEntitlement) {
                setIsPro(true);
                // Founder status should be set separately via founder claim
            } else if (hasProEntitlement) {
                setIsPro(true);
            } else {
                setIsPro(false);
            }

            // Get subscription details
            const subInfo = await revenueCatService.getSubscriptionInfo();
            if (subInfo) {
                setExpiresAt(subInfo.expirationDate ? new Date(subInfo.expirationDate) : null);
            }
        } catch (error) {
            if (__DEV__) console.error('[usePremium] Error refreshing status:', error);
        } finally {
            setIsLoading(false);
        }
    }, [setIsPro]);

    /**
     * Check if user has access to a feature
     */
    const hasFeature = useCallback(
        (feature: keyof TierFeatures): boolean => {
            return features[feature];
        },
        [features]
    );

    /**
     * Get current usage status for a feature
     */
    const getUsageStatus = useCallback(
        async (feature: UsageFeature): Promise<UsageStatus> => {
            const limitKey = USAGE_FEATURE_LIMITS[feature];
            const limit = limits[limitKey];

            // Unlimited features
            if (isUnlimited(limit)) {
                return {
                    used: 0,
                    limit: -1,
                    remaining: -1,
                    isLimited: false,
                    percentUsed: 0,
                };
            }

            // Get today's usage from Supabase
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('usage_tracking')
                .select('count')
                .eq('user_id', userId)
                .eq('feature', feature)
                .gte('period_start', today.toISOString().split('T')[0])
                .single();

            const used = error || !data ? 0 : data.count;
            const remaining = Math.max(0, limit - used);

            return {
                used,
                limit,
                remaining,
                isLimited: true,
                percentUsed: (used / limit) * 100,
            };
        },
        [limits, userId]
    );

    /**
     * Check if user can use a feature (under limit)
     */
    const canUse = useCallback(
        async (feature: UsageFeature): Promise<boolean> => {
            const status = await getUsageStatus(feature);
            return !status.isLimited || status.remaining > 0;
        },
        [getUsageStatus]
    );

    /**
     * Record usage of a feature
     */
    const recordUsage = useCallback(
        async (feature: UsageFeature): Promise<boolean> => {
            const limitKey = USAGE_FEATURE_LIMITS[feature];
            const limit = limits[limitKey];

            // Don't track unlimited features
            if (isUnlimited(limit)) {
                return true;
            }

            const today = new Date().toISOString().split('T')[0];

            // Upsert usage record
            const { error } = await supabase.rpc('increment_usage', {
                p_user_id: userId,
                p_feature: feature,
                p_period_start: today,
            });

            if (error) {
                if (__DEV__) console.error('[usePremium] Error recording usage:', error);
                return false;
            }

            return true;
        },
        [limits, userId]
    );

    /**
     * Get remaining uses for a feature
     */
    const getRemainingUses = useCallback(
        async (feature: UsageFeature): Promise<number> => {
            const status = await getUsageStatus(feature);
            return status.remaining;
        },
        [getUsageStatus]
    );

    return {
        tier,
        isLoading,
        isPro: tier === 'pro' || tier === 'founder',
        isFounder: tier === 'founder',
        isFree: tier === 'free',
        limits,
        features,
        expiresAt,
        isTrialing,
        trialEndsAt,
        hasFeature,
        getUsageStatus,
        canUse,
        recordUsage,
        refreshStatus,
        getRemainingUses,
    };
}

/**
 * Simple hook to check if user is premium (for quick checks)
 */
export function useIsPremium(): boolean {
    const isPro = useUserStore((s) => s.isPro);
    const founderStatus = useUserStore((s) => s.founderStatus);
    return isPro || founderStatus?.isFounder === true;
}

/**
 * Hook to get current tier
 */
export function useTier(): SubscriptionTier {
    const isPro = useUserStore((s) => s.isPro);
    const founderStatus = useUserStore((s) => s.founderStatus);

    if (founderStatus?.isFounder) return 'founder';
    if (isPro) return 'pro';
    return 'free';
}

export default usePremium;
