/**
 * ProtrudingTabBar - Floating bottom nav with moving selection orb
 * Features:
 * - 5 tabs: Home, Food, AI, Health, Social
 * - Animated circular highlight that slides to the active tab
 * - Glassy dark bar matching the provided design
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, MOTION } from '../../design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_BAR_WIDTH = 350;
const BAR_HEIGHT = 72;
const BAR_PADDING = 10;
const INDICATOR_SIZE = 52;
const HORIZONTAL_MARGIN = 20;

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

  const barWidth = Math.min(MAX_BAR_WIDTH, SCREEN_WIDTH - HORIZONTAL_MARGIN * 2);
  const tabSlotWidth = useMemo(() => (barWidth - BAR_PADDING * 2) / TABS.length, [barWidth]);

  const activeIndex = Math.max(0, TABS.findIndex((tab) => tab.name === activeTab));
  const indicatorX = useSharedValue(0);

  const moveIndicator = useCallback((index: number) => {
    const targetX = BAR_PADDING + tabSlotWidth * index + (tabSlotWidth - INDICATOR_SIZE) / 2;
    indicatorX.value = withSpring(targetX, MOTION.spring.snappy);
  }, [indicatorX, tabSlotWidth]);

  useEffect(() => {
    moveIndicator(activeIndex);
  }, [activeIndex, moveIndicator]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const barBackground = 'rgba(18, 18, 18, 0.9)';  // Glass nav dark background
  const inactiveColor = 'rgba(255, 255, 255, 0.5)';
  const activeIconColor = '#FFFFFF';  // Active icons white on orange background

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, SPACING.lg) }]}>
      <View style={[styles.bar, { width: barWidth, backgroundColor: barBackground }]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} pointerEvents="none" />

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

        <View style={styles.tabsRow}>
          {TABS.map((tab, index) => {
            const isActive = index === activeIndex;
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
    </View>
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
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#FF4500',  // Orange accent for active tab
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
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
});
