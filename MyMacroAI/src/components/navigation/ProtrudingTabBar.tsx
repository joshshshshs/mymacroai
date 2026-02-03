/**
 * ProtrudingTabBar - Floating bottom nav with protruding center AI button
 * Features:
 * - 5 tabs: Home, Food, AI (center/protruding), Health, Social
 * - Animated circular highlight that slides to the active tab
 * - Large protruding center button with MyMacro AI logo
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, MOTION, COLORS, MATERIALS } from '../../design-system/tokens';
import { useTabBarStore } from '@/src/store/tabBarStore';

// AI tab logo assets
const AI_LOGO_LIGHT = require('../../../assets/white bkg.png');
const AI_LOGO_DARK = require('../../../assets/black bkg.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_BAR_WIDTH = 350;
const BAR_HEIGHT = 72;
const BAR_PADDING = 10;
const INDICATOR_SIZE = 52;
const HORIZONTAL_MARGIN = 20;

// Center AI button dimensions
const CENTER_BUTTON_SIZE = 67; // 20% smaller center button
const CENTER_BUTTON_PROTRUSION = 24; // Proportional protrusion

interface Tab {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

const TABS: Tab[] = [
  { name: 'dashboard', label: 'Home', icon: 'home-outline', iconFilled: 'home' },
  { name: 'nutrition', label: 'Food', icon: 'restaurant-outline', iconFilled: 'restaurant' },
  { name: 'ai-hub', label: 'AI', icon: 'sparkles-outline', iconFilled: 'sparkles' },
  { name: 'health', label: 'Health', icon: 'heart-outline', iconFilled: 'heart' },
  { name: 'squad', label: 'Social', icon: 'people-outline', iconFilled: 'people' },
];

interface ProtrudingTabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export const ProtrudingTabBar: React.FC<ProtrudingTabBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isVisible = useTabBarStore((state) => state.isVisible);

  const barWidth = Math.min(MAX_BAR_WIDTH, SCREEN_WIDTH - HORIZONTAL_MARGIN * 2);
  const tabSlotWidth = useMemo(() => (barWidth - BAR_PADDING * 2) / TABS.length, [barWidth]);

  const activeIndex = Math.max(0, TABS.findIndex((tab) => tab.name === activeTab));
  const indicatorX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const moveIndicator = useCallback((index: number) => {
    // Don't move indicator for center button (AI tab)
    if (index === 2) return;
    const targetX = BAR_PADDING + tabSlotWidth * index + (tabSlotWidth - INDICATOR_SIZE) / 2;
    indicatorX.value = withSpring(targetX, MOTION.spring.snappy);
  }, [indicatorX, tabSlotWidth]);

  useEffect(() => {
    if (activeIndex !== 2) {
      moveIndicator(activeIndex);
    }
  }, [activeIndex, moveIndicator]);

  // Animate tab bar visibility
  useEffect(() => {
    translateY.value = withSpring(isVisible ? 0 : 150, {
      damping: 20,
      stiffness: 300,
    });
  }, [isVisible, translateY]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Theme-aware glass background with proper contrast
  const barBackground = isDark
    ? MATERIALS.frosted.fallbackDark
    : 'rgba(255, 255, 255, 0.85)';
  // Improved inactive icon visibility
  const inactiveColor = isDark
    ? 'rgba(255, 255, 255, 0.65)'
    : 'rgba(0, 0, 0, 0.5)';
  const activeIconColor = '#FFFFFF';

  // Is AI tab active?
  const isAiActive = activeIndex === 2;

  return (
    <Animated.View style={[styles.container, { bottom: Math.max(insets.bottom, SPACING.lg) }, containerAnimatedStyle]}>
      {/* Protruding Center AI Button - rendered first so bar covers bottom */}
      <View style={styles.centerButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.centerButton,
            {
              backgroundColor: isDark ? '#1A1A1E' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
            },
            isAiActive && styles.centerButtonActive,
          ]}
          onPress={() => onTabPress('ai-hub')}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="AI"
        >
          <Image
            source={isDark ? AI_LOGO_DARK : AI_LOGO_LIGHT}
            style={styles.centerButtonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Main Bar */}
      <View style={[styles.bar, { width: barWidth, backgroundColor: barBackground }]}>
        <BlurView intensity={MATERIALS.frosted.intensity} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} pointerEvents="none" />

        {/* Sliding indicator - hidden for center tab */}
        {activeIndex !== 2 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              indicatorStyle,
              {
                width: INDICATOR_SIZE,
                height: INDICATOR_SIZE,
                borderRadius: INDICATOR_SIZE / 2,
              },
            ]}
          />
        )}

        <View style={styles.tabsRow}>
          {TABS.map((tab, index) => {
            const isActive = index === activeIndex;
            const isCenter = index === 2;

            // Center tab is handled by the protruding button
            if (isCenter) {
              return (
                <View key={tab.name} style={[styles.tabButton, { width: tabSlotWidth }]} />
              );
            }

            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tabButton, { width: tabSlotWidth }]}
                onPress={() => {
                  moveIndicator(index);
                  onTabPress(tab.name);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <Ionicons
                  name={isActive ? tab.iconFilled : tab.icon}
                  size={24}
                  color={isActive ? activeIconColor : inactiveColor}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    alignItems: 'center',
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: 999,
    paddingHorizontal: BAR_PADDING,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    backgroundColor: COLORS.gamification.vitaminOrange,
    shadowColor: COLORS.gamification.vitaminOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Center protruding button
  centerButtonWrapper: {
    position: 'absolute',
    top: -CENTER_BUTTON_PROTRUSION,
    alignSelf: 'center',
    zIndex: 10,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  centerButtonActive: {
    borderColor: COLORS.gamification.vitaminOrange,
    shadowColor: COLORS.gamification.vitaminOrange,
    shadowOpacity: 0.4,
  },
  centerButtonImage: {
    width: CENTER_BUTTON_SIZE * 0.95,
    height: CENTER_BUTTON_SIZE * 0.95,
    borderRadius: (CENTER_BUTTON_SIZE * 0.95) / 2,
  },
});
