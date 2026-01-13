/**
 * AppHeader - Minimal Global Header with Soft Glass Pills
 * Clean header with MacroCoins/Streak (left) and Profile (right)
 * Ultra-soft glassmorphic pills with pastel aesthetic
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../../design-system/tokens';
import { PASTEL_COLORS } from '../../design-system/aesthetics';
import { useUserStore } from '@/src/store/UserStore';

export const AppHeader: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Get user data from store
  const coins = useUserStore((state) => state.coins) || 1250;
  const streak = useUserStore((state) => state.streak) || 14;
  // profileImage removed as it's not in store currently

  const handleCoinsPress = () => {
    // Open MacroShop
    router.push('/(modals)/shop');
  };

  const handleStreakPress = () => {
    // Open Streak Hub
    router.push('/(modals)/streak');
  };

  const handleProfilePress = () => {
    // Open profile drawer/settings
    // Using existing route if available, otherwise just log
    router.push('/(modals)/profile');
  };

  const textColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)';

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.md }]}>
      <View style={styles.content}>
        {/* Left Cluster: Coins + Streak */}
        <View style={styles.leftCluster}>
          {/* MacroCoins */}
          <TouchableOpacity
            onPress={handleCoinsPress}
            activeOpacity={0.7}
            style={{ backgroundColor: 'transparent' }}
          >
            <View style={styles.pillContainer}>
              <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              <View style={[styles.pillOverlay, { backgroundColor: PASTEL_COLORS.glass.light }]} />
              <View style={styles.pillContent}>
                <Text style={styles.coinIcon}>🪙</Text>
                <Text style={[styles.pillText, { color: textColor }]}>{coins}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Streak */}
          <TouchableOpacity
            onPress={handleStreakPress}
            activeOpacity={0.7}
            style={{ backgroundColor: 'transparent' }}
          >
            <View style={styles.pillContainer}>
              <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              <View style={[styles.pillOverlay, { backgroundColor: PASTEL_COLORS.glass.light }]} />
              <View style={styles.pillContent}>
                <Text style={styles.flameIcon}>🔥</Text>
                <Text style={[styles.pillText, { color: textColor }]}>{streak}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right Cluster: Profile Avatar */}
        <TouchableOpacity
          onPress={handleProfilePress}
          activeOpacity={0.8}
          style={{ backgroundColor: 'transparent' }}
        >
          <View style={styles.avatarContainer}>
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[styles.pillOverlay, { backgroundColor: PASTEL_COLORS.glass.light }]} />
            {/* Profile Avatar */}
            <View style={styles.avatarContent}>
              <Ionicons name="person" size={20} color={textColor} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCluster: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PASTEL_COLORS.glass.border,
  },
  pillOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  coinIcon: {
    fontSize: 16,
  },
  flameIcon: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PASTEL_COLORS.glass.border,
  },
  avatarContent: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
