/**
 * Premium Paywall Screen - High-Conversion Subscription UI
 *
 * Features:
 * - Glassmorphism design language (bg-white/10, blur-md)
 * - Founder hero card with gold gradient & "BEST VALUE" ribbon
 * - Annual card with "Save 33%" highlight
 * - RevenueCat integration for purchases
 * - Legal links (Apple requirement)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    useColorScheme,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    FadeIn,
    FadeInUp,
} from 'react-native-reanimated';
import { PurchasesPackage } from 'react-native-purchases';

import { revenueCatService } from '@/src/services/paywall/RevenueCat';
import { useEntitlements } from '@/src/hooks/useEntitlements';
import { useHaptics } from '@/hooks/useHaptics';
import { SPACING, RADIUS, COLORS, MOTION } from '@/src/design-system/tokens';
import { TIER_PRICING, RC_PRODUCTS } from '@/src/config/tiers';
import { useUserStore } from '@/src/store/UserStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Feature highlights for each tier
const PRO_FEATURES = [
    { icon: 'chatbubbles', label: 'Unlimited AI Chat' },
    { icon: 'fitness', label: 'Wearable Sync' },
    { icon: 'calendar', label: 'Cycle Optimization' },
    { icon: 'analytics', label: 'HRV & Recovery' },
    { icon: 'body', label: 'Body Scan Analysis' },
    { icon: 'cloud-download', label: 'Export Data' },
];

const FOUNDER_EXCLUSIVE = [
    { icon: 'diamond', label: '2x MacroCoin Rate' },
    { icon: 'ribbon', label: 'Gold Founder Badge' },
    { icon: 'rocket', label: 'Early Feature Access' },
    { icon: 'color-palette', label: 'Exclusive Themes' },
    { icon: 'infinite', label: 'Lifetime Access' },
];

// Animated Crown for Founder
const AnimatedCrown = () => {
    const rotation = useSharedValue(0);
    const glow = useSharedValue(0.5);

    useEffect(() => {
        rotation.value = withRepeat(
            withSequence(
                withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        glow.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const crownStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value,
    }));

    return (
        <View style={styles.crownContainer}>
            <Animated.View style={[styles.crownGlow, glowStyle]} />
            <Animated.View style={crownStyle}>
                <Text style={styles.crownEmoji}>👑</Text>
            </Animated.View>
        </View>
    );
};

// Plan Card Component
interface PlanCardProps {
    title: string;
    price: string;
    period: string;
    features: { icon: string; label: string }[];
    isFounder?: boolean;
    isPopular?: boolean;
    savingsText?: string;
    onSelect: () => void;
    isLoading?: boolean;
    isDark: boolean;
    index: number;
}

const PlanCard: React.FC<PlanCardProps> = ({
    title,
    price,
    period,
    features,
    isFounder,
    isPopular,
    savingsText,
    onSelect,
    isLoading,
    isDark,
    index,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98, MOTION.spring.snappy);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, MOTION.spring.bouncy);
    };

    return (
        <Animated.View
            entering={FadeInUp.delay(index * 150).duration(500)}
            style={[styles.cardWrapper, animatedStyle]}
        >
            <TouchableOpacity
                onPress={onSelect}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={isLoading}
            >
                {/* Card Container */}
                <View
                    style={[
                        styles.planCard,
                        isFounder && styles.founderCard,
                    ]}
                >
                    {/* Glass Blur Background */}
                    <BlurView
                        intensity={isDark ? 20 : 40}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    <View
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(255,255,255,0.7)',
                            },
                        ]}
                    />

                    {/* Founder Gold Glow Border */}
                    {isFounder && (
                        <View style={styles.founderGlowBorder} />
                    )}

                    {/* BEST VALUE Ribbon for Founder */}
                    {isFounder && (
                        <View style={styles.ribbon}>
                            <LinearGradient
                                colors={['#FFD700', '#FFA500']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ribbonGradient}
                            >
                                <Ionicons name="star" size={10} color="#1A1A1A" />
                                <Text style={styles.ribbonText}>BEST VALUE</Text>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Popular Badge */}
                    {isPopular && !isFounder && (
                        <View style={styles.popularBadge}>
                            <LinearGradient
                                colors={[COLORS.gamification.vitaminOrange, '#FF8C00']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.popularGradient}
                            >
                                <Text style={styles.popularText}>POPULAR</Text>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Card Content */}
                    <View style={styles.cardContent}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            {isFounder ? (
                                <AnimatedCrown />
                            ) : (
                                <View
                                    style={[
                                        styles.planIcon,
                                        {
                                            backgroundColor: isDark
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(0,0,0,0.05)',
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="rocket"
                                        size={24}
                                        color={COLORS.gamification.vitaminOrange}
                                    />
                                </View>
                            )}
                            <Text
                                style={[
                                    styles.planTitle,
                                    { color: isDark ? '#FFFFFF' : '#1A1A1A' },
                                    isFounder && styles.founderTitle,
                                ]}
                            >
                                {title}
                            </Text>
                        </View>

                        {/* Price */}
                        <View style={styles.priceContainer}>
                            <Text
                                style={[
                                    styles.priceText,
                                    { color: isDark ? '#FFFFFF' : '#1A1A1A' },
                                    isFounder && styles.founderPrice,
                                ]}
                            >
                                {price}
                            </Text>
                            <Text
                                style={[
                                    styles.periodText,
                                    { color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' },
                                ]}
                            >
                                {period}
                            </Text>
                        </View>

                        {/* Savings Badge */}
                        {savingsText && (
                            <View style={styles.savingsBadge}>
                                <Text style={styles.savingsText}>{savingsText}</Text>
                            </View>
                        )}

                        {/* Features */}
                        <View style={styles.featuresContainer}>
                            {features.map((feature, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <View
                                        style={[
                                            styles.featureIcon,
                                            {
                                                backgroundColor: isFounder
                                                    ? 'rgba(255, 215, 0, 0.15)'
                                                    : isDark
                                                    ? 'rgba(255,255,255,0.1)'
                                                    : 'rgba(0,0,0,0.05)',
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={feature.icon as any}
                                            size={14}
                                            color={
                                                isFounder
                                                    ? '#FFD700'
                                                    : COLORS.gamification.vitaminOrange
                                            }
                                        />
                                    </View>
                                    <Text
                                        style={[
                                            styles.featureText,
                                            { color: isDark ? 'rgba(255,255,255,0.8)' : '#4B5563' },
                                        ]}
                                    >
                                        {feature.label}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* CTA Button */}
                        <TouchableOpacity
                            style={[
                                styles.ctaButton,
                                isFounder && styles.founderCta,
                            ]}
                            onPress={onSelect}
                            disabled={isLoading}
                        >
                            {isFounder ? (
                                <LinearGradient
                                    colors={['#FFD700', '#FFA500']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#1A1A1A" />
                                    ) : (
                                        <>
                                            <Text style={styles.founderCtaText}>
                                                Become a Founder
                                            </Text>
                                            <Ionicons name="arrow-forward" size={18} color="#1A1A1A" />
                                        </>
                                    )}
                                </LinearGradient>
                            ) : (
                                <LinearGradient
                                    colors={[COLORS.gamification.vitaminOrange, '#FF8C00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaGradient}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.ctaText}>Subscribe</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                        </>
                                    )}
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function PremiumScreen() {
    const { medium, triggerPurchaseSuccess } = useHaptics();
    const { tier, hasPremium, isFounder, refresh } = useEntitlements();
    const user = useUserStore((state) => state.user);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [isLoading, setIsLoading] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [packages, setPackages] = useState<{
        monthly: PurchasesPackage | null;
        annual: PurchasesPackage | null;
        founder: PurchasesPackage | null;
    }>({ monthly: null, annual: null, founder: null });

    const colors = {
        bg: isDark ? '#0A0A0C' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280',
        textTertiary: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
        buttonBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    };

    // Load offerings on mount
    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        const offering = await revenueCatService.getOfferings();
        if (offering) {
            const monthly = offering.availablePackages.find(
                (p) => p.product.identifier === RC_PRODUCTS.PRO_MONTHLY
            );
            const annual = offering.availablePackages.find(
                (p) => p.product.identifier === RC_PRODUCTS.PRO_YEARLY
            );
            const founder = offering.availablePackages.find(
                (p) => p.product.identifier === RC_PRODUCTS.FOUNDER_LIFETIME
            );

            setPackages({ monthly: monthly ?? null, annual: annual ?? null, founder: founder ?? null });
        }
    };

    const handlePurchase = useCallback(
        async (planType: 'monthly' | 'annual' | 'founder') => {
            const pkg = packages[planType];
            if (!pkg) {
                Alert.alert('Error', 'This plan is not available at the moment.');
                return;
            }

            medium();
            setLoadingPlan(planType);

            try {
                const result = await revenueCatService.purchasePackage(pkg, user?.id);

                if (result.success) {
                    triggerPurchaseSuccess();
                    await refresh();

                    const tierName = result.tier === 'founder' ? 'Founder' : 'Pro';
                    Alert.alert(
                        'Welcome to MyMacro ' + tierName + '!',
                        result.tier === 'founder'
                            ? "You're now a Founder! Enjoy 2x MacroCoins, exclusive features, and lifetime access."
                            : 'Your subscription is now active. Enjoy unlimited AI, wearable sync, and more!',
                        [{ text: 'Let\'s Go!', onPress: () => router.back() }]
                    );
                } else if (result.userCancelled) {
                    // User cancelled, do nothing
                } else {
                    Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
                }
            } catch (error) {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            } finally {
                setLoadingPlan(null);
            }
        },
        [packages, user?.id, medium, triggerPurchaseSuccess, refresh]
    );

    const handleRestore = useCallback(async () => {
        medium();
        setIsLoading(true);

        try {
            const result = await revenueCatService.restorePurchases(user?.id);

            if (result.hasActiveSubscription) {
                triggerPurchaseSuccess();
                await refresh();
                Alert.alert(
                    'Purchases Restored',
                    `Your ${result.tier === 'founder' ? 'Founder' : 'Pro'} subscription has been restored.`,
                    [{ text: 'Great!', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to restore purchases. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, medium, triggerPurchaseSuccess, refresh]);

    // If already premium, show current status
    if (hasPremium) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={[styles.headerButton, { backgroundColor: colors.buttonBg }]}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.activeContainer}>
                        <View style={styles.activeBadge}>
                            {isFounder ? (
                                <Text style={styles.activeEmoji}>👑</Text>
                            ) : (
                                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                            )}
                        </View>
                        <Text style={[styles.activeTitle, { color: colors.text }]}>
                            {isFounder ? "You're a Founder!" : "You're a Pro!"}
                        </Text>
                        <Text style={[styles.activeSubtitle, { color: colors.textSecondary }]}>
                            {isFounder
                                ? 'Thank you for your support. Enjoy lifetime access and exclusive perks!'
                                : 'Your subscription is active. Enjoy all premium features!'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.manageButton, { backgroundColor: colors.buttonBg }]}
                            onPress={() => router.push('/settings')}
                        >
                            <Text style={[styles.manageButtonText, { color: colors.text }]}>
                                Manage Subscription
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

            {/* Background */}
            <LinearGradient
                colors={isDark ? ['#1A1510', '#0A0A0C'] : ['#FFF9F5', '#F5F5F7']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.4 }}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: colors.buttonBg }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.restoreButton, { backgroundColor: colors.buttonBg }]}
                        onPress={handleRestore}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={colors.text} />
                        ) : (
                            <Text style={[styles.restoreText, { color: colors.text }]}>Restore</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero */}
                    <Animated.View entering={FadeIn.duration(500)} style={styles.heroSection}>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>
                            Unlock Your{'\n'}Full Potential
                        </Text>
                        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                            Get unlimited AI, wearable sync, and advanced health insights
                        </Text>
                    </Animated.View>

                    {/* Founder Card (Hero) */}
                    <PlanCard
                        title="Founder"
                        price={TIER_PRICING.founder.lifetimeDisplay}
                        period="one-time"
                        features={FOUNDER_EXCLUSIVE}
                        isFounder
                        onSelect={() => handlePurchase('founder')}
                        isLoading={loadingPlan === 'founder'}
                        isDark={isDark}
                        index={0}
                    />

                    {/* Annual Card */}
                    <PlanCard
                        title="Pro Annual"
                        price={TIER_PRICING.pro.yearlyDisplay}
                        period="/year"
                        features={PRO_FEATURES}
                        isPopular
                        savingsText={`Save ${TIER_PRICING.pro.yearlySavings}`}
                        onSelect={() => handlePurchase('annual')}
                        isLoading={loadingPlan === 'annual'}
                        isDark={isDark}
                        index={1}
                    />

                    {/* Monthly Card */}
                    <PlanCard
                        title="Pro Monthly"
                        price={TIER_PRICING.pro.monthlyDisplay}
                        period="/month"
                        features={PRO_FEATURES.slice(0, 4)}
                        onSelect={() => handlePurchase('monthly')}
                        isLoading={loadingPlan === 'monthly'}
                        isDark={isDark}
                        index={2}
                    />

                    {/* Legal Links (Apple Requirement) */}
                    <View style={styles.legalSection}>
                        <TouchableOpacity onPress={handleRestore}>
                            <Text style={[styles.legalLink, { color: colors.textSecondary }]}>
                                Restore Purchases
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.legalDivider, { color: colors.textTertiary }]}>•</Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://mymacro.app/terms')}
                        >
                            <Text style={[styles.legalLink, { color: colors.textSecondary }]}>
                                Terms of Use
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.legalDivider, { color: colors.textTertiary }]}>•</Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://mymacro.app/privacy')}
                        >
                            <Text style={[styles.legalLink, { color: colors.textSecondary }]}>
                                Privacy Policy
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Disclaimer */}
                    <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
                        Subscriptions auto-renew unless cancelled at least 24 hours before the end of
                        the current period. Manage subscriptions in your App Store account settings.
                    </Text>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    restoreButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    restoreText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        marginBottom: SPACING.md,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        textAlign: 'center',
        lineHeight: 38,
    },
    heroSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: SPACING.xl,
    },

    // Plan Cards
    cardWrapper: {
        marginBottom: SPACING.lg,
    },
    planCard: {
        borderRadius: RADIUS['2xl'],
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    founderCard: {
        borderWidth: 2,
        borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    founderGlowBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: RADIUS['2xl'],
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
    },
    ribbon: {
        position: 'absolute',
        top: 16,
        right: -28,
        transform: [{ rotate: '45deg' }],
        zIndex: 10,
    },
    ribbonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 32,
        paddingVertical: 4,
    },
    ribbonText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#1A1A1A',
        letterSpacing: 0.5,
    },
    popularBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        borderRadius: 8,
        overflow: 'hidden',
        zIndex: 10,
    },
    popularGradient: {
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    popularText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    cardContent: {
        padding: SPACING.xl,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    planIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crownContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crownGlow: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
    },
    crownEmoji: {
        fontSize: 32,
    },
    planTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    founderTitle: {
        color: '#FFD700',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: SPACING.sm,
    },
    priceText: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    founderPrice: {
        color: '#FFD700',
    },
    periodText: {
        fontSize: 14,
        fontWeight: '500',
    },
    savingsBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: SPACING.md,
    },
    savingsText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10B981',
    },
    featuresContainer: {
        marginBottom: SPACING.lg,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    featureIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
    },
    ctaButton: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    founderCta: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    founderCtaText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    // Legal
    legalSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: SPACING.xl,
    },
    legalLink: {
        fontSize: 12,
        fontWeight: '500',
    },
    legalDivider: {
        fontSize: 12,
    },
    disclaimer: {
        fontSize: 11,
        fontWeight: '400',
        textAlign: 'center',
        marginTop: SPACING.lg,
        lineHeight: 16,
        paddingHorizontal: SPACING.md,
    },

    // Active subscription view
    activeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    activeBadge: {
        marginBottom: SPACING.xl,
    },
    activeEmoji: {
        fontSize: 64,
    },
    activeTitle: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    activeSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 22,
    },
    manageButton: {
        marginTop: SPACING.xl,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: RADIUS.lg,
    },
    manageButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
