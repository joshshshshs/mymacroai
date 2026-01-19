/**
 * MacroCoins Store - "Clean Commerce"
 * Supports both light and dark mode
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  useColorScheme,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ProductCard } from '@/src/components/shop';
import { ThemeSelector } from '@/src/components/shop/ThemeSelector';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { SPACING } from '@/src/design-system/tokens';
import { StoreItem } from '@/src/types';

const COIN_ICON = require('../../assets/coin_gold.png');

// Data Catalog - Literal Names
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

export default function ShopScreen() {
  const { triggerPurchaseSuccess } = useHaptics();
  const macroCoins = useUserStore((state) => state.economy?.macroCoins) ?? 1450;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    bg: isDark ? '#0A0A0C' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280',
    buttonBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
  };

  // Basic purchase handler
  const handlePurchase = (item: StoreItem) => {
    console.log('Purchase requested:', item.name);
    triggerPurchaseSuccess();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      {/* Background Gradient */}
      {isDark ? (
        <LinearGradient
          colors={['#1A1A1E', '#0A0A0C']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.3 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <LinearGradient
          colors={['#FFF5F0', '#FFFFFF']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.3 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <SafeAreaView style={styles.safeArea}>
        {/* Header - Transparent & Centered */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.buttonBg }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.walletContainer}>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceText, { color: colors.text }]}>
                {macroCoins.toLocaleString()}
              </Text>
              <Image source={COIN_ICON} style={styles.headerCoin} />
            </View>
            <Text style={[styles.balanceSubtext, { color: colors.textSecondary }]}>
              MacroCoins Available
            </Text>
          </View>

          <TouchableOpacity style={[styles.historyButton, { backgroundColor: colors.buttonBg }]}>
            <Ionicons name="time-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scroll Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Theme Skins Section */}
          <ThemeSelector
            onThemeChange={(id) => console.log('Theme equipped:', id)}
            onPurchase={(id) => console.log('Theme purchased:', id)}
          />

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🛒 Power-Ups</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Boost your journey
            </Text>
          </View>

          <View style={styles.grid}>
            {SHOP_CATALOG.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                canAfford={macroCoins >= item.price}
                onPress={handlePurchase}
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  historyButton: {
    padding: 8,
    borderRadius: 20,
  },
  walletContainer: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerCoin: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  balanceSubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
