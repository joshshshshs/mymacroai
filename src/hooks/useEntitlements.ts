/**
 * useEntitlements - Hook for checking user entitlements/subscriptions
 */

import { useCallback } from 'react';
import { useUserStore } from '@/src/store/UserStore';
import {
  SubscriptionTier,
  TierFeatures,
  TierLimits,
  TIER_LIMITS,
  TIER_FEATURES,
} from '../config/tiers';

export interface Entitlements {
  isPro: boolean;
  isFounder: boolean;
  hasPremium: boolean;
  tier: SubscriptionTier;
  limits: TierLimits;
  features: TierFeatures;
  coinMultiplier: number;
  canAccessFeature: (feature: string) => boolean;
  refresh: () => Promise<void>;
}

export function useEntitlements(): Entitlements {
  const isPro = useUserStore((s) => s.isPro);
  const isFounder = useUserStore((s) => s.founderStatus?.isFounder ?? false);

  const tier: SubscriptionTier = isFounder ? 'founder' : isPro ? 'pro' : 'free';
  const hasPremium = isPro || isFounder;

  const limits: TierLimits = TIER_LIMITS[tier];
  const features: TierFeatures = TIER_FEATURES[tier];
  const coinMultiplier = limits.macroCoinRate;

  const canAccessFeature = useCallback((feature: string): boolean => {
    // Pro/Founder users can access all features
    if (hasPremium) return true;
    
    // Check if it's a boolean feature
    if (feature in features) {
      return features[feature as keyof TierFeatures] === true;
    }
    
    // Free features available to everyone
    const freeFeatures = [
      'dashboard', 
      'basic_logging', 
      'basic_stats',
      'water_tracking',
      'basic_ai_chat',
    ];
    return freeFeatures.includes(feature);
  }, [hasPremium, features]);

  const refresh = useCallback(async (): Promise<void> => {
    // In a real app, this would refresh entitlements from the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  return {
    isPro,
    isFounder,
    hasPremium,
    tier,
    limits,
    features,
    coinMultiplier,
    canAccessFeature,
    refresh,
  };
}

export default useEntitlements;
