/**
 * RevenueCat Service - Premium Subscription Management
 * Handles all in-app purchase and subscription logic
 */

import Purchases, { PurchasesPackage, PurchasesOffering, LOG_LEVEL, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../../lib/supabase';
import { RC_ENTITLEMENTS, RC_PRODUCTS, SubscriptionTier } from '../../config/tiers';

// Environment-based API keys
const API_KEYS = {
    ios: process.env.EXPO_PUBLIC_RC_IOS_KEY || Constants.expoConfig?.extra?.rcIosKey || '',
    android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY || Constants.expoConfig?.extra?.rcAndroidKey || '',
};

// Entitlement identifiers
const ENTITLEMENT_PRO = RC_ENTITLEMENTS.PRO;
const ENTITLEMENT_FOUNDER = RC_ENTITLEMENTS.FOUNDER;

// Validate configuration
const validateConfig = () => {
    const key = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
    if (!key || key.includes('...') || key.startsWith('appl_') && key.length < 20) {
        if (__DEV__) {
            console.warn('[RevenueCat] API key not configured. Set EXPO_PUBLIC_RC_IOS_KEY or EXPO_PUBLIC_RC_ANDROID_KEY in .env');
        }
        return false;
    }
    return true;
};

class RevenueCatService {
    private isConfigured = false;

    /**
     * Initialize RevenueCat with platform-specific API key
     * Call this early in app lifecycle (e.g., in _layout.tsx)
     */
    async configure(): Promise<boolean> {
        if (this.isConfigured) return true;

        if (!validateConfig()) {
            return false;
        }

        try {
            // Set log level based on environment
            if (__DEV__) {
                Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            } else {
                Purchases.setLogLevel(LOG_LEVEL.ERROR);
            }

            const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;

            await Purchases.configure({ apiKey });
            this.isConfigured = true;

            return true;
        } catch (error) {
            if (__DEV__) {
                console.error('[RevenueCat] Configuration failed:', error);
            }
            return false;
        }
    }

    /**
     * Identify user for cross-device subscription sync
     */
    async identifyUser(userId: string): Promise<void> {
        if (!this.isConfigured) await this.configure();

        try {
            await Purchases.logIn(userId);
        } catch (error) {
            if (__DEV__) {
                console.error('[RevenueCat] User identification failed:', error);
            }
        }
    }

    /**
     * Log out current user (for account switching)
     */
    async logOut(): Promise<void> {
        try {
            await Purchases.logOut();
        } catch (error) {
            // Anonymous user or not logged in
        }
    }

    /**
     * Get available subscription offerings
     */
    async getOfferings(): Promise<PurchasesOffering | null> {
        if (!this.isConfigured) {
            const configured = await this.configure();
            if (!configured) return null;
        }

        try {
            const offerings = await Purchases.getOfferings();
            return offerings.current ?? null;
        } catch (error) {
            if (__DEV__) {
                console.error('[RevenueCat] Error fetching offerings:', error);
            }
            return null;
        }
    }

    /**
     * Check if user has a specific entitlement
     * @param entitlement - The entitlement to check ('pro' or 'founder')
     */
    async checkEntitlement(entitlement: string = ENTITLEMENT_PRO): Promise<boolean> {
        if (!this.isConfigured) {
            const configured = await this.configure();
            if (!configured) return false;
        }

        try {
            const customerInfo = await Purchases.getCustomerInfo();
            return entitlement in customerInfo.entitlements.active;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get user's current tier based on entitlements
     */
    async getCurrentTier(): Promise<SubscriptionTier> {
        if (!this.isConfigured) {
            const configured = await this.configure();
            if (!configured) return 'free';
        }

        try {
            const customerInfo = await Purchases.getCustomerInfo();

            if (ENTITLEMENT_FOUNDER in customerInfo.entitlements.active) {
                return 'founder';
            }
            if (ENTITLEMENT_PRO in customerInfo.entitlements.active) {
                return 'pro';
            }
            return 'free';
        } catch (error) {
            return 'free';
        }
    }

    /**
     * Sync subscription status with Supabase
     */
    async syncWithSupabase(userId: string): Promise<void> {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const tier = await this.getCurrentTier();

            let expiresAt: string | null = null;
            let rcEntitlement: string | null = null;

            if (tier === 'founder') {
                rcEntitlement = ENTITLEMENT_FOUNDER;
                // Founder is lifetime, no expiration
            } else if (tier === 'pro') {
                rcEntitlement = ENTITLEMENT_PRO;
                const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_PRO];
                expiresAt = proEntitlement?.expirationDate || null;
            }

            // Update Supabase
            const { error } = await supabase.rpc('update_subscription', {
                p_user_id: userId,
                p_tier: tier,
                p_rc_customer_id: customerInfo.originalAppUserId,
                p_rc_entitlement: rcEntitlement,
                p_expires_at: expiresAt,
            });

            if (error && __DEV__) {
                console.error('[RevenueCat] Supabase sync error:', error);
            }
        } catch (error) {
            if (__DEV__) {
                console.error('[RevenueCat] Sync error:', error);
            }
        }
    }

    /**
     * Get detailed subscription info
     */
    async getSubscriptionInfo(): Promise<{
        isActive: boolean;
        tier: SubscriptionTier;
        expirationDate: string | null;
        willRenew: boolean;
        productId: string | null;
        isLifetime: boolean;
    }> {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const tier = await this.getCurrentTier();

            // Check founder first (lifetime)
            const founderEntitlement = customerInfo.entitlements.active[ENTITLEMENT_FOUNDER];
            if (founderEntitlement) {
                return {
                    isActive: true,
                    tier: 'founder',
                    expirationDate: null, // Lifetime
                    willRenew: false,
                    productId: founderEntitlement.productIdentifier,
                    isLifetime: true,
                };
            }

            // Check pro
            const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_PRO];
            if (proEntitlement) {
                return {
                    isActive: true,
                    tier: 'pro',
                    expirationDate: proEntitlement.expirationDate,
                    willRenew: proEntitlement.willRenew ?? false,
                    productId: proEntitlement.productIdentifier,
                    isLifetime: false,
                };
            }

            return {
                isActive: false,
                tier: 'free',
                expirationDate: null,
                willRenew: false,
                productId: null,
                isLifetime: false,
            };
        } catch (error) {
            return {
                isActive: false,
                tier: 'free',
                expirationDate: null,
                willRenew: false,
                productId: null,
                isLifetime: false,
            };
        }
    }

    /**
     * Purchase a subscription package
     * @param pack - The package to purchase
     * @param userId - Optional user ID for Supabase sync
     */
    async purchasePackage(pack: PurchasesPackage, userId?: string): Promise<{
        success: boolean;
        tier?: SubscriptionTier;
        error?: string;
        userCancelled?: boolean;
    }> {
        if (!this.isConfigured) {
            const configured = await this.configure();
            if (!configured) {
                return { success: false, error: 'RevenueCat not configured' };
            }
        }

        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);

            // Determine what tier they now have
            let tier: SubscriptionTier = 'free';
            if (ENTITLEMENT_FOUNDER in customerInfo.entitlements.active) {
                tier = 'founder';
            } else if (ENTITLEMENT_PRO in customerInfo.entitlements.active) {
                tier = 'pro';
            }

            const isActive = tier !== 'free';

            // Sync with Supabase if we have a user ID
            if (isActive && userId) {
                await this.syncWithSupabase(userId);

                // Track subscription event
                await supabase.from('subscription_events').insert({
                    user_id: userId,
                    event_type: 'subscribed',
                    from_tier: 'free',
                    to_tier: tier,
                    metadata: { product_id: pack.identifier },
                });
            }

            return { success: isActive, tier };
        } catch (error: unknown) {
            const purchaseError = error as { userCancelled?: boolean; message?: string };
            if (purchaseError.userCancelled) {
                return { success: false, userCancelled: true };
            }

            if (__DEV__) {
                console.error('[RevenueCat] Purchase error:', error);
            }

            return {
                success: false,
                error: purchaseError.message || 'Purchase failed'
            };
        }
    }

    /**
     * Restore previous purchases
     * @param userId - Optional user ID for Supabase sync
     */
    async restorePurchases(userId?: string): Promise<{
        success: boolean;
        hasActiveSubscription: boolean;
        tier: SubscriptionTier;
        error?: string;
    }> {
        if (!this.isConfigured) {
            const configured = await this.configure();
            if (!configured) {
                return { success: false, hasActiveSubscription: false, tier: 'free', error: 'RevenueCat not configured' };
            }
        }

        try {
            const customerInfo = await Purchases.restorePurchases();

            // Determine tier
            let tier: SubscriptionTier = 'free';
            if (ENTITLEMENT_FOUNDER in customerInfo.entitlements.active) {
                tier = 'founder';
            } else if (ENTITLEMENT_PRO in customerInfo.entitlements.active) {
                tier = 'pro';
            }

            const hasActive = tier !== 'free';

            // Sync with Supabase if we have a user ID and active subscription
            if (hasActive && userId) {
                await this.syncWithSupabase(userId);
            }

            return {
                success: true,
                hasActiveSubscription: hasActive,
                tier,
            };
        } catch (error: unknown) {
            const restoreError = error as { message?: string };
            if (__DEV__) {
                console.error('[RevenueCat] Restore error:', error);
            }

            return {
                success: false,
                hasActiveSubscription: false,
                tier: 'free',
                error: restoreError.message || 'Restore failed'
            };
        }
    }

    /**
     * Set up listener for subscription changes
     * @param userId - User ID for Supabase sync
     * @param onUpdate - Callback when subscription status changes
     */
    setupListener(userId: string, onUpdate: (tier: SubscriptionTier) => void): () => void {
        const listener = async (customerInfo: CustomerInfo) => {
            let tier: SubscriptionTier = 'free';
            if (ENTITLEMENT_FOUNDER in customerInfo.entitlements.active) {
                tier = 'founder';
            } else if (ENTITLEMENT_PRO in customerInfo.entitlements.active) {
                tier = 'pro';
            }

            // Sync with Supabase
            await this.syncWithSupabase(userId);

            // Notify caller
            onUpdate(tier);
        };

        Purchases.addCustomerInfoUpdateListener(listener);

        // Return unsubscribe function
        return () => {
            Purchases.removeCustomerInfoUpdateListener(listener);
        };
    }

    /**
     * Get available offerings by name
     */
    async getOfferingByName(name: string): Promise<PurchasesOffering | null> {
        if (!this.isConfigured) {
            const configured = await this.configure();
            if (!configured) return null;
        }

        try {
            const offerings = await Purchases.getOfferings();
            return offerings.all[name] ?? null;
        } catch (error) {
            if (__DEV__) {
                console.error('[RevenueCat] Error fetching offering:', error);
            }
            return null;
        }
    }

    /**
     * Check if RevenueCat is properly configured
     */
    isReady(): boolean {
        return this.isConfigured;
    }
}

export const revenueCatService = new RevenueCatService();
