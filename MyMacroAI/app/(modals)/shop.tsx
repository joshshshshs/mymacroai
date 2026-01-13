import React, { useState } from 'react';
import { View, ScrollView, Pressable, Dimensions, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { StoreItem } from '@/src/types';
import { MacroCoin } from '@/src/components/ui/icons/MacroCoin';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@/src/design-system/theme'; // [NEW]
import { ThemedText } from '@/src/components/ui/ThemedText'; // [NEW]

const { width: screenWidth } = Dimensions.get('window');

// Mock store items (Same as before)
const STORE_ITEMS: StoreItem[] = [
  { id: 'skin_gold', name: 'Golden Liquid', description: 'Premium gold theme with animated particles', price: 5000, category: 'liquid_skins', rarity: 'legendary', isPurchased: false, effect: 'Unlocks golden theme', icon: '🏆' },
  { id: 'skin_silver', name: 'Silver Stream', description: 'Elegant silver theme with flowing animations', price: 2500, category: 'liquid_skins', rarity: 'epic', isPurchased: false, effect: 'Unlocks silver theme', icon: '💎' },
  { id: 'skin_blue', name: 'Azure Current', description: 'Calm blue theme with water effects', price: 1000, category: 'liquid_skins', rarity: 'rare', isPurchased: false, effect: 'Unlocks blue theme', icon: '🌊' },
  { id: 'dive_analysis', name: 'AI Health Analysis', description: 'Comprehensive AI-powered health report', price: 1500, category: 'deep_dives', rarity: 'epic', isPurchased: false, effect: 'Generates detailed health insights', icon: '🧠' },
  { id: 'dive_trends', name: 'Trend Analysis', description: 'Identify patterns in your health data', price: 800, category: 'deep_dives', rarity: 'rare', isPurchased: false, effect: 'Reveals health trends', icon: '📊' },
  { id: 'freeze_7', name: '7-Day Streak Shield', description: 'Protect your streak for 7 days', price: 2000, category: 'streak_freeze', rarity: 'epic', isPurchased: false, effect: 'Streak protection for 7 days', icon: '🛡️' },
  { id: 'freeze_3', name: '3-Day Safety Net', description: 'Basic streak protection for 3 days', price: 800, category: 'streak_freeze', rarity: 'rare', isPurchased: false, effect: 'Streak protection for 3 days', icon: '🔒' }
];

export default function ShopModal() {
  const theme = useAppTheme(); // [NEW] Hook
  const { colors, dark } = theme;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasedItem, setPurchasedItem] = useState<string | null>(null);

  const macroCoins = useUserStore(state => state.economy?.macroCoins) ?? 1250;
  const purchaseHistory = useUserStore(state => state.purchaseHistory) || [];
  const purchaseItem = useUserStore(state => state.purchaseItem);
  const { triggerPurchaseSuccess, triggerPurchaseFail, light, selection } = useHaptics();

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'liquid_skins', name: 'Liquid Skins', icon: '🎨' },
    { id: 'deep_dives', name: 'Deep Dives', icon: '🔍' },
    { id: 'streak_freeze', name: 'Streak Freeze', icon: '🛡️' }
  ];

  const filteredItems = STORE_ITEMS.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const handlePurchase = async (item: StoreItem) => {
    await light();
    if (macroCoins < item.price) {
      await triggerPurchaseFail();
      return;
    }
    const success = purchaseItem ? purchaseItem(item) : true;
    if (success) {
      setPurchasedItem(item.id);
      await triggerPurchaseSuccess();
      setTimeout(() => setPurchasedItem(null), 2000);
    } else {
      await triggerPurchaseFail();
    }
  };

  const isPurchased = (itemId: string) => purchaseHistory.some(item => item.id === itemId);
  const canAfford = (price: number) => macroCoins >= price;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

      {/* Background: Adaptive based on theme */}
      <View style={StyleSheet.absoluteFill}>
        {/* Only show dream bg in dark mode for pop, or low opacity in light */}
        {dark ? <SoftDreamyBackground /> : null}
        <BlurView
          intensity={dark ? 20 : 0}
          tint={dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* HEADER */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <ThemedText variant="h3">MacroShop</ThemedText>

          {/* Coin Badge */}
          <SoftGlassCard variant="soft" style={styles.coinBadge}>
            <View style={styles.coinContent}>
              <MacroCoin size={18} />
              <ThemedText variant="h3" style={{ fontSize: 14 }}>{macroCoins.toLocaleString()}</ThemedText>
            </View>
          </SoftGlassCard>
        </Animated.View>

        {/* CATEGORY PILLS */}
        <View style={{ height: 60 }}>
          <Animated.ScrollView
            horizontal
            entering={FadeInUp.duration(600).delay(200)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => { selection(); setSelectedCategory(category.id); }}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isActive ? colors.primary : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                      borderColor: isActive ? colors.primary : 'transparent'
                    }
                  ]}
                >
                  <ThemedText
                    variant="label"
                    color={isActive ? colors.primaryForeground : colors.textSecondary}
                    style={{ fontSize: 13 }}
                  >
                    {category.icon} {category.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </Animated.ScrollView>
        </View>

        {/* ITEMS GRID */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {filteredItems.map((item, index) => {
              const purchased = isPurchased(item.id);
              const affordable = canAfford(item.price);

              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.duration(600).delay(index * 100).springify()}
                  style={styles.cardWrapper}
                >
                  <SoftGlassCard
                    variant={dark ? 'soft' : 'prominent'} // Prominent in light mode for visible cards
                    style={styles.card}
                  >
                    <Pressable
                      onPress={() => !purchased && handlePurchase(item)}
                      disabled={purchased || (!affordable && !purchased)}
                      style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}
                    >
                      {/* Icon */}
                      <View style={styles.cardIconContainer}>
                        <View style={[styles.iconGlow, { backgroundColor: colors.primary }]} />
                        <ThemedText style={{ fontSize: 42 }}>{item.icon}</ThemedText>
                      </View>

                      {/* Details */}
                      <View style={{ gap: 4 }}>
                        <ThemedText variant="label" numberOfLines={1}>{item.name}</ThemedText>
                        <ThemedText variant="caption" color={colors.textSecondary} numberOfLines={2}>
                          {item.description}
                        </ThemedText>
                      </View>

                      {/* Action Button */}
                      <View style={{ marginTop: 12 }}>
                        {purchased ? (
                          <View style={[styles.btnBase, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <Ionicons name="checkmark" size={14} color={colors.success} />
                            <ThemedText variant="caption" color={colors.success} weight="600">Owned</ThemedText>
                          </View>
                        ) : (
                          <View style={[
                            styles.btnBase,
                            { backgroundColor: affordable ? colors.primary : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') }
                          ]}>
                            {affordable ? (
                              <>
                                <ThemedText variant="caption" color={colors.primaryForeground} weight="700">Purchase</ThemedText>
                                <View style={styles.priceTag}>
                                  <ThemedText style={{ fontSize: 10 }} color={colors.primaryForeground}>⚡</ThemedText>
                                  <ThemedText variant="caption" color={colors.primaryForeground} weight="700">{item.price}</ThemedText>
                                </View>
                              </>
                            ) : (
                              <>
                                <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
                                <ThemedText variant="caption" color={colors.textMuted} weight="600">{item.price}</ThemedText>
                              </>
                            )}
                          </View>
                        )}
                      </View>

                      {/* Success Feedback Overlay */}
                      {purchasedItem === item.id && (
                        <Animated.View entering={ZoomIn.duration(300)} style={[styles.successOverlay, { backgroundColor: colors.success }]}>
                          <Ionicons name="checkmark-circle" size={48} color="#FFF" />
                        </Animated.View>
                      )}
                    </Pressable>
                  </SoftGlassCard>
                </Animated.View>
              );
            })}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  coinBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  coinContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center'
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 8,
    borderWidth: 1,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  cardWrapper: {
    width: (screenWidth - 48) / 2,
    marginBottom: 16,
  },
  card: {
    height: 200,
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden'
  },
  cardIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  iconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.15,
    transform: [{ scale: 1.5 }]
  },
  btnBase: {
    borderRadius: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36, // Fixed height to prevent collapse
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    zIndex: 20,
    opacity: 0.9,
  }
});
