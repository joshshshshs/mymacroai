/**
 * MacroCoin Top-Up - In-App Purchase Screen
 * Features:
 * - Tiered coin packages with best value indicators
 * - Web discount promotion (20% off at mymacro.app/shop)
 * - Animated coin visuals
 * - Full light/dark mode support
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Alert,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  FadeIn,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';

import { useMacroCoins, useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { SPACING, RADIUS, COLORS, MOTION } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Coin Packages
interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  popular?: boolean;
  bestValue?: boolean;
}

const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'starter',
    coins: 500,
    price: 0.99,
  },
  {
    id: 'basic',
    coins: 1200,
    price: 1.99,
    badge: '+20%',
  },
  {
    id: 'popular',
    coins: 3000,
    price: 4.99,
    badge: '+50%',
    popular: true,
  },
  {
    id: 'pro',
    coins: 7500,
    price: 9.99,
    badge: '+87%',
  },
  {
    id: 'elite',
    coins: 20000,
    price: 19.99,
    badge: '+100%',
    bestValue: true,
  },
];

// Animated Coin Stack Component
const CoinStack = ({ count }: { count: number }) => {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  // Calculate visual coin count (max 5 for display)
  const visualCount = Math.min(Math.ceil(count / 4000), 5);

  return (
    <Animated.View style={[styles.coinStack, animatedStyle]}>
      {[...Array(visualCount)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.stackedCoin,
            { bottom: i * 6, zIndex: visualCount - i },
          ]}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.stackedCoinGradient}
          >
            <Text style={styles.stackedCoinText}>M</Text>
          </LinearGradient>
        </View>
      ))}
    </Animated.View>
  );
};

// Package Card Component
const PackageCard = ({
  pkg,
  isDark,
  onPurchase,
  index,
}: {
  pkg: CoinPackage;
  isDark: boolean;
  onPurchase: (pkg: CoinPackage) => void;
  index: number;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, MOTION.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, MOTION.spring.bouncy);
  };

  const isHighlighted = pkg.popular || pkg.bestValue;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={[
          styles.packageCard,
          {
            backgroundColor: isDark
              ? isHighlighted ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255,255,255,0.06)'
              : isHighlighted ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255,255,255,0.95)',
            borderColor: isHighlighted
              ? 'rgba(255, 215, 0, 0.3)'
              : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
          },
        ]}
        onPress={() => onPurchase(pkg)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Badges */}
        {pkg.popular && (
          <View style={styles.popularBadge}>
            <LinearGradient
              colors={[COLORS.gamification.vitaminOrange, '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.popularBadgeGradient}
            >
              <Ionicons name="flame" size={12} color="#FFF" />
              <Text style={styles.popularBadgeText}>POPULAR</Text>
            </LinearGradient>
          </View>
        )}

        {pkg.bestValue && (
          <View style={styles.bestValueBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bestValueBadgeGradient}
            >
              <Ionicons name="star" size={12} color="#1A1A1A" />
              <Text style={styles.bestValueBadgeText}>BEST VALUE</Text>
            </LinearGradient>
          </View>
        )}

        {/* Left Side - Coins */}
        <View style={styles.packageLeft}>
          <CoinStack count={pkg.coins} />
          <View style={styles.coinInfo}>
            <Text style={[styles.coinCount, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
              {pkg.coins.toLocaleString()}
            </Text>
            <Text style={[styles.coinLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }]}>
              MacroCoins
            </Text>
          </View>
        </View>

        {/* Bonus Badge */}
        {pkg.badge && (
          <View style={[
            styles.bonusBadge,
            {
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
            }
          ]}>
            <Text style={styles.bonusBadgeText}>{pkg.badge}</Text>
          </View>
        )}

        {/* Right Side - Price */}
        <View style={styles.packageRight}>
          <Text style={[styles.priceText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
            ${pkg.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function MacroCoinTopUpScreen() {
  const { medium, triggerPurchaseSuccess } = useHaptics();
  const macroCoins = useMacroCoins() ?? 0;
  const addCoins = useUserStore((state) => state.addCoins);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    bg: isDark ? '#0A0A0C' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
    buttonBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
  };

  const handlePurchase = (pkg: CoinPackage) => {
    medium();
    Alert.alert(
      `Purchase ${pkg.coins.toLocaleString()} MacroCoins`,
      `You'll be charged $${pkg.price.toFixed(2)} for this purchase.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          style: 'default',
          onPress: () => {
            // In production, this would trigger RevenueCat/StoreKit
            // For now, simulate purchase
            addCoins(pkg.coins);
            triggerPurchaseSuccess();
            Alert.alert(
              'Purchase Complete!',
              `${pkg.coins.toLocaleString()} MacroCoins have been added to your account.`,
              [{ text: 'Awesome!', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  const openWebShop = () => {
    medium();
    Alert.alert(
      'Save 20% on the Web',
      'You can get 20% more MacroCoins when purchasing through our website at mymacro.app/shop.\n\nWould you like to open it now?',
      [
        { text: 'Stay Here', style: 'cancel' },
        {
          text: 'Open Website',
          style: 'default',
          onPress: () => Linking.openURL('https://mymacro.app/shop'),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      {/* Background */}
      <LinearGradient
        colors={isDark ? ['#1A1510', '#0A0A0C'] : ['#FFF9F5', '#FFFFFF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Gold shimmer effect */}
      {isDark && (
        <View style={styles.shimmerOverlay}>
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.08)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.buttonBg }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>Top Up</Text>

          <View style={styles.currentBalance}>
            <Text style={[styles.currentBalanceText, { color: '#FBBF24' }]}>
              {macroCoins.toLocaleString()}
            </Text>
            <View style={styles.miniCoin}>
              <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.miniCoinGradient}>
                <Text style={styles.miniCoinText}>M</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Get More MacroCoins
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Unlock power-ups, themes, and exclusive features
            </Text>
          </Animated.View>

          {/* Web Discount Banner */}
          <Animated.View entering={SlideInRight.delay(200).duration(500)}>
            <TouchableOpacity
              style={styles.webDiscountBanner}
              onPress={openWebShop}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.gamification.vitaminOrange, '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.webDiscountGradient}
              >
                <View style={styles.webDiscountContent}>
                  <View style={styles.webDiscountLeft}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>-20%</Text>
                    </View>
                    <View>
                      <Text style={styles.webDiscountTitle}>Save on the Web!</Text>
                      <Text style={styles.webDiscountSubtitle}>
                        mymacro.app/shop
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="open-outline" size={20} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Section Label */}
          <View style={styles.sectionLabel}>
            <Text style={[styles.sectionLabelText, { color: colors.textSecondary }]}>
              IN-APP PURCHASE
            </Text>
          </View>

          {/* Packages */}
          <View style={styles.packages}>
            {COIN_PACKAGES.map((pkg, index) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                isDark={isDark}
                onPurchase={handlePurchase}
                index={index}
              />
            ))}
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={[styles.disclaimerText, { color: colors.textTertiary }]}>
              Purchases are processed through the App Store. MacroCoins have no cash value
              and cannot be refunded. Prices may vary by region.
            </Text>
          </View>

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
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  currentBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currentBalanceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  miniCoin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  miniCoinGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCoinText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#8B6914',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },

  // Web Discount Banner
  webDiscountBanner: {
    marginBottom: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.gamification.vitaminOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  webDiscountGradient: {
    padding: SPACING.lg,
  },
  webDiscountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webDiscountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discountBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  webDiscountTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  webDiscountSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Section
  sectionLabel: {
    marginBottom: SPACING.md,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Packages
  packages: {
    gap: SPACING.md,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: RADIUS.md,
    overflow: 'hidden',
  },
  popularBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: RADIUS.md,
    overflow: 'hidden',
  },
  bestValueBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bestValueBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  packageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  coinStack: {
    width: 44,
    height: 50,
    position: 'relative',
  },
  stackedCoin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    left: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  stackedCoinGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 200, 0, 0.5)',
    borderRadius: 18,
  },
  stackedCoinText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8B6914',
  },
  coinInfo: {},
  coinCount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  coinLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  bonusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  bonusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  packageRight: {},
  priceText: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Disclaimer
  disclaimer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  disclaimerText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
});
