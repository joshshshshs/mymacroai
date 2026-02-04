/**
 * MacroCoins Shop - Premium Redesign
 * Features:
 * - Animated coin header with glow effects
 * - Top-up button with web discount note
 * - Glass morphism product cards
 * - Theme selector integration
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
  interpolate,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { ThemeSelector } from '@/src/components/shop/ThemeSelector';
import { useUserStore, useMacroCoins } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { SPACING, RADIUS, COLORS, MOTION } from '@/src/design-system/tokens';
import { StoreItem } from '@/src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Shop Catalog - All existing products preserved
const SHOP_CATALOG: StoreItem[] = [
  {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    description: 'Protects your streak for 1 missed day.',
    price: 500,
    category: 'utility',
    icon: 'snow',
    rarity: 'common',
    isPurchased: false,
  },
  {
    id: 'streak_restore',
    name: 'Streak Restore',
    description: 'Recover a broken streak from the last 48 hours.',
    price: 2500,
    category: 'utility',
    icon: 'refresh',
    rarity: 'epic',
    isPurchased: false,
  },
  {
    id: 'ghost_mode',
    name: 'Ghost Mode',
    description: 'Hide your activity from friends for 24 hours.',
    price: 200,
    category: 'social',
    icon: 'eye-off',
    rarity: 'common',
    isPurchased: false,
  },
  {
    id: 'pro_pass_24h',
    name: 'Pro Pass (24h)',
    description: 'Unlock all AI Pro features for one day.',
    price: 800,
    category: 'utility',
    icon: 'trophy',
    rarity: 'rare',
    isPurchased: false,
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    description: 'Unlock the Obsidian Dark Theme permanently.',
    price: 1500,
    category: 'cosmetic',
    icon: 'moon',
    rarity: 'legendary',
    isPurchased: false,
  },
];

// Rarity colors
const RARITY_COLORS = {
  common: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9CA3AF', border: 'rgba(107, 114, 128, 0.3)' },
  rare: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
  epic: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.3)' },
  legendary: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
};

// Item icon colors
const getItemIcon = (id: string): { name: keyof typeof Ionicons.glyphMap; color: string; bgColor: string } => {
  if (id.includes('freeze')) return { name: 'snow', color: '#0EA5E9', bgColor: 'rgba(14, 165, 233, 0.15)' };
  if (id.includes('restore')) return { name: 'refresh', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' };
  if (id.includes('ghost')) return { name: 'eye-off', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' };
  if (id.includes('pro')) return { name: 'trophy', color: '#EAB308', bgColor: 'rgba(234, 179, 8, 0.15)' };
  if (id.includes('dark')) return { name: 'moon', color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.15)' };
  return { name: 'cube', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)' };
};

// Animated Coin Component
const AnimatedCoin = () => {
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0.5);
  const float = useSharedValue(0);

  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Float animation
    float.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const coinStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotation.value}deg` },
      { translateY: float.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: interpolate(glow.value, [0.5, 1], [1, 1.3]) }],
  }));

  return (
    <View style={styles.coinWrapper}>
      {/* Glow Effect */}
      <Animated.View style={[styles.coinGlow, glowStyle]} />

      {/* 3D Coin */}
      <Animated.View style={[styles.coinContainer, coinStyle]}>
        <LinearGradient
          colors={['#FFD700', '#FFC700', '#FFB700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coin}
        >
          <View style={styles.coinInner}>
            <Text style={styles.coinLetter}>M</Text>
          </View>
          <View style={styles.coinReflection} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

// Product Card Component
const ProductCard = ({
  item,
  canAfford,
  onPurchase,
  isDark,
  index
}: {
  item: StoreItem;
  canAfford: boolean;
  onPurchase: (item: StoreItem) => void;
  isDark: boolean;
  index: number;
}) => {
  const scale = useSharedValue(1);
  const iconData = getItemIcon(item.id);
  const rarityData = RARITY_COLORS[item.rarity || 'common'];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, MOTION.spring.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, MOTION.spring.bouncy);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={[styles.cardWrapper, animatedStyle]}
    >
      <TouchableOpacity
        style={[
          styles.productCard,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
          !canAfford && styles.cardDisabled,
        ]}
        onPress={() => onPurchase(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Rarity Badge */}
        {item.rarity && item.rarity !== 'common' && (
          <View style={[styles.rarityBadge, { backgroundColor: rarityData.bg, borderColor: rarityData.border }]}>
            <Text style={[styles.rarityText, { color: rarityData.text }]}>
              {item.rarity.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconData.bgColor }]}>
          <Ionicons name={iconData.name} size={28} color={iconData.color} />
        </View>

        {/* Info */}
        <Text style={[styles.itemName, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          style={[styles.itemDescription, { color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280' }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <View style={[
            styles.pricePill,
            {
              backgroundColor: canAfford
                ? (isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)')
                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
            }
          ]}>
            <Text style={[
              styles.priceText,
              { color: canAfford ? '#FBBF24' : (isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF') }
            ]}>
              {item.price.toLocaleString()}
            </Text>
            <View style={[styles.miniCoin, { opacity: canAfford ? 1 : 0.4 }]}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.miniCoinGradient}
              >
                <Text style={styles.miniCoinText}>M</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ShopScreen() {
  const { triggerPurchaseSuccess, medium } = useHaptics();
  const macroCoins = useMacroCoins() ?? 0;
  const purchaseItem = useUserStore((state) => state.purchaseItem);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    bg: isDark ? '#0A0A0C' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280',
    textTertiary: isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF',
    buttonBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    cardBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  };

  const handlePurchase = (item: StoreItem) => {
    if (macroCoins < item.price) {
      medium();
      Alert.alert(
        'Insufficient Coins',
        `You need ${(item.price - macroCoins).toLocaleString()} more MacroCoins to purchase ${item.name}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get More', onPress: () => router.push('/macrocoin-topup') },
        ]
      );
      return;
    }

    Alert.alert(
      `Purchase ${item.name}?`,
      `This will cost ${item.price.toLocaleString()} MacroCoins.\n\n${item.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          style: 'default',
          onPress: () => {
            const success = purchaseItem(item);
            if (success) {
              triggerPurchaseSuccess();
              Alert.alert('Purchase Complete!', `${item.name} has been added to your inventory.`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#1A1A1E', '#0A0A0C'] : ['#FFF9F5', '#FFFFFF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Gold accent glow for dark mode */}
      {isDark && (
        <View style={styles.accentGlow}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.15)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
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
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.buttonBg }]}
            onPress={() => Alert.alert('Purchase History', 'Coming soon!')}
          >
            <Ionicons name="time-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section - Balance */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
            <AnimatedCoin />

            <Text style={[styles.balanceText, { color: colors.text }]}>
              {macroCoins.toLocaleString()}
            </Text>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
              MacroCoins Available
            </Text>

            {/* Top Up Button */}
            <TouchableOpacity
              style={styles.topUpButton}
              onPress={() => router.push('/macrocoin-topup')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topUpGradient}
              >
                <Ionicons name="add-circle" size={20} color="#1A1A1A" />
                <Text style={styles.topUpText}>Top Up MacroCoins</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Web Discount Note */}
            <View style={styles.discountNote}>
              <Ionicons name="gift-outline" size={14} color={COLORS.gamification.vitaminOrange} />
              <Text style={[styles.discountText, { color: colors.textSecondary }]}>
                Get <Text style={styles.discountHighlight}>20% off</Text> at{' '}
                <Text style={styles.discountLink}>mymacro.app/shop</Text>
              </Text>
            </View>
          </Animated.View>

          {/* Theme Skins Section */}
          <ThemeSelector
            onThemeChange={() => { }}
            onPurchase={() => { }}
          />

          {/* Power-Ups Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionEmoji]}>🛒</Text>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Power-Ups</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Boost your journey
              </Text>
            </View>
          </View>

          <View style={styles.grid}>
            {SHOP_CATALOG.map((item, index) => (
              <ProductCard
                key={item.id}
                item={item}
                canAfford={macroCoins >= item.price}
                onPurchase={handlePurchase}
                isDark={isDark}
                index={index}
              />
            ))}
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
  accentGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  coinWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  coinGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  coinContainer: {},
  coin: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 200, 0, 0.5)',
  },
  coinInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(139, 105, 20, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  coinLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: '#8B6914',
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coinReflection: {
    position: 'absolute',
    top: 6,
    left: 10,
    right: 10,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  balanceText: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
    textShadowColor: 'rgba(255, 215, 0, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  topUpButton: {
    marginTop: SPACING.xl,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  topUpGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  topUpText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  discountNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 92, 0, 0.08)',
    borderRadius: RADIUS.md,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  discountHighlight: {
    color: COLORS.gamification.vitaminOrange,
    fontWeight: '700',
  },
  discountLink: {
    color: COLORS.gamification.vitaminOrange,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionEmoji: {
    fontSize: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  productCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    minHeight: 180,
    position: 'relative',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  rarityBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: SPACING.md,
    flex: 1,
  },
  priceRow: {
    marginTop: 'auto',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  miniCoin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
  },
  miniCoinGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCoinText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8B6914',
  },
});
