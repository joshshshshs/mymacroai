/**
 * MacroCoins Store - "Clean Commerce"
 * Light mode, performance-focused marketplace
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { ProductCard } from '@/src/components/shop';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { SPACING, SHADOWS } from '@/src/design-system/tokens';
import { StoreItem } from '@/src/types';

const COIN_ICON = require('../../assets/coin_gold.png');
const { width } = Dimensions.get('window');

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

  // Basic purchase handler
  const handlePurchase = (item: StoreItem) => {
    // In a real app, show bottom sheet confirmation here
    console.log('Purchase requested:', item.name);
    triggerPurchaseSuccess();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#FFF5F0', '#FFFFFF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header - Transparent & Centered */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#1A1A1A" />
          </TouchableOpacity>

          <View style={styles.walletContainer}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceText}>{macroCoins.toLocaleString()}</Text>
              <Image source={COIN_ICON} style={styles.headerCoin} />
            </View>
            <Text style={styles.balanceSubtext}>MacroCoins Available</Text>
          </View>

          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="time-outline" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Scroll Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  historyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
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
    color: '#1A1A1A',
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
    color: '#6B7280',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
