/**
 * useEntitlements - RevenueCat Subscription State Hook
 *
 * Returns the user's current subscription tier and derived states.
 * Source of truth for all premium feature access.
 */

import { useState, useEffect, useCallback } from 'react';
import { revenueCatService } from '../services/paywall/RevenueCat';
import {
    SubscriptionTier,
    TIER_LIMITS,
    TIER_FEATURES,
    TierLimits,
    TierFeatures,
} from '../config/tiers';
import { useUserStore } from '../store/UserStore';

export interface EntitlementState {
    // Core tier info
    tier: SubscriptionTier;
    isLoading: boolean;
    error: string | null;

    // Convenience booleans
    isFree: boolean;
    isPro: boolean;
    isFounder: boolean;
    hasPremium: boolean; // isPro || isFounder

    // MacroCoin multiplier
    coinMultiplier: number;

    // Subscription details
    expirationDate: string | null;
    willRenew: boolean;
    isLifetime: boolean;
    productId: string | null;

    // Tier config access
    limits: TierLimits;
    features: TierFeatures;

    // Actions
    refresh: () => Promise<void>;
}

/**
 * Main entitlements hook - use this throughout the app
 */
export function useEntitlements(): EntitlementState {
    const [tier, setTier] = useState<SubscriptionTier>('free');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subscriptionDetails, setSubscriptionDetails] = useState<{
        expirationDate: string | null;
        willRenew: boolean;
        isLifetime: boolean;
        productId: string | null;
    }>({
        expirationDate: null,
        willRenew: false,
        isLifetime: false,
        productId: null,
    });

    // Get user ID for listener setup
    const user = useUserStore((state) => state.user);
    const setProStatus = useUserStore((state) => state.setProStatus);

    const fetchEntitlements = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const info = await revenueCatService.getSubscriptionInfo();

            setTier(info.tier);
            setSubscriptionDetails({
                expirationDate: info.expirationDate,
                willRenew: info.willRenew,
                isLifetime: info.isLifetime,
                productId: info.productId,
            });

            // Sync with UserStore
            setProStatus(info.tier !== 'free');
        } catch (err) {
            setError('Failed to fetch subscription status');
            console.error('[useEntitlements] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [setProStatus]);

    // Initial fetch
    useEffect(() => {
        fetchEntitlements();
    }, [fetchEntitlements]);

    // Set up listener for real-time updates
    useEffect(() => {
        if (!user?.id) return;

        const unsubscribe = revenueCatService.setupListener(user.id, (newTier) => {
            setTier(newTier);
            setProStatus(newTier !== 'free');

            // Refresh full details
            fetchEntitlements();
        });

        return unsubscribe;
    }, [user?.id, setProStatus, fetchEntitlements]);

    // Derived states
    const isFree = tier === 'free';
    const isPro = tier === 'pro';
    const isFounder = tier === 'founder';
    const hasPremium = isPro || isFounder;

    // Get tier-specific config
    const limits = TIER_LIMITS[tier];
    const features = TIER_FEATURES[tier];
    const coinMultiplier = limits.macroCoinRate;

    return {
        tier,
        isLoading,
        error,
        isFree,
        isPro,
        isFounder,
        hasPremium,
        coinMultiplier,
        expirationDate: subscriptionDetails.expirationDate,
        willRenew: subscriptionDetails.willRenew,
        isLifetime: subscriptionDetails.isLifetime,
        productId: subscriptionDetails.productId,
        limits,
        features,
        refresh: fetchEntitlements,
    };
}

/**
 * Lightweight hook for just checking if user has premium
 * Use this when you only need a simple premium check
 */
export function useHasPremium(): boolean {
    const { hasPremium } = useEntitlements();
    return hasPremium;
}

/**
 * Hook for getting the MacroCoin multiplier
 */
export function useCoinMultiplier(): number {
    const { coinMultiplier } = useEntitlements();
    return coinMultiplier;
}

/**
 * Hook for checking founder status
 */
export function useIsFounder(): boolean {
    const { isFounder } = useEntitlements();
    return isFounder;
}

/**
 * Hook for getting tier limits
 */
export function useTierLimits(): TierLimits {
    const { limits } = useEntitlements();
    return limits;
}

/**
 * Hook for getting tier features
 */
export function useTierFeatures(): TierFeatures {
    const { features } = useEntitlements();
    return features;
}

export default useEntitlements;
