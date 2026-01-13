/**
 * ProtrudingTabBar - Bottom Navigation with Protruding Center AI Log Button
 * Features:
 * - 5 tabs: Dashboard, Nutrition, AI Hub (center), Health, Squad
 * - Center button protrudes above bar with curved notch
 * - Glass/frosted appearance
 * - Semantic glow on active tab
 */

import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, useColorScheme, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, MOTION } from '../../design-system/tokens';
import { PASTEL_COLORS } from '../../design-system/aesthetics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 80;
const CENTER_BUTTON_SIZE = 70;
const CENTER_BUTTON_PROTRUSION = 28; // How much it sticks out above the bar
const NOTCH_WIDTH = 120; // Width of the curved notch
const BOTTOM_INSET = 20; // Fixed distance from bottom
// Note: We will largely ignore insets.bottom to get that 'flush' look if needed, 
// or subtract a bit. Let's try absolute positioning relative to screen bottom.
const HORIZONTAL_INSET = 20; // Distance from sides

interface Tab {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

const TABS: Tab[] = [
  { name: 'dashboard', label: 'Dashboard', icon: 'home-outline', iconFilled: 'home' },
  { name: 'nutrition', label: 'Nutrition', icon: 'nutrition-outline', iconFilled: 'nutrition' },
  { name: 'ai-hub', label: 'AI Hub', icon: 'sparkles-outline', iconFilled: 'sparkles' }, // Center
  { name: 'health', label: 'Health', icon: 'heart-outline', iconFilled: 'heart' },
  { name: 'squad', label: 'Squad', icon: 'people-outline', iconFilled: 'people' },
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

  const centerButtonScale = useSharedValue(1);
  const centerButtonGlow = useSharedValue(1);

  // Pulsing glow animation for AI button
  useEffect(() => {
    centerButtonGlow.value = withRepeat(
      withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const handleTabPress = (tabName: string) => {
    if (tabName === 'ai-hub') {
      // Special animation for center button
      centerButtonScale.value = withSpring(0.9, MOTION.spring.snappy);
      setTimeout(() => {
        centerButtonScale.value = withSpring(1, MOTION.spring.bouncy);
      }, 100);
    }
    onTabPress(tabName);
  };

  const centerButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerButtonScale.value }],
  }));

  const centerButtonGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerButtonGlow.value }],
    opacity: 0.6,
  }));

  const tabBarBg = isDark ? 'rgba(26, 26, 26, 0.85)' : 'rgba(255, 255, 255, 0.85)';
  const activeColor = PASTEL_COLORS.accents.primary; // Popping blue
  const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

  const floatingWidth = SCREEN_WIDTH - (HORIZONTAL_INSET * 2);

  return (
    <View style={[styles.container, { bottom: BOTTOM_INSET }]}>
      {/* Floating Background with Rounded Corners */}
      <View style={[styles.backgroundContainer, { width: floatingWidth, backgroundColor: 'transparent' }]}>
        <BlurView
          intensity={40}
          tint="light"
          style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
        />

        {/* Curved Notch Cutout (using SVG) */}
        <Svg
          width={floatingWidth}
          height={TAB_BAR_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={`
              M 0 0
              L ${floatingWidth / 2 - 50} 0
              C ${floatingWidth / 2 - 40} 0 ${floatingWidth / 2 - 45} 40 ${floatingWidth / 2} 40
              C ${floatingWidth / 2 + 45} 40 ${floatingWidth / 2 + 40} 0 ${floatingWidth / 2 + 50} 0
              L ${floatingWidth} 0
              L ${floatingWidth} ${TAB_BAR_HEIGHT}
              L 0 ${TAB_BAR_HEIGHT}
              Z
            `}
            fill={tabBarBg}
          />
        </Svg>

        {/* Border */}
        <View style={[styles.border, { borderColor: PASTEL_COLORS.glass.border, borderRadius: 28 }]} />
      </View>

      {/* Tab Items Flex Container */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.name;
          const isCenter = index === 2;

          if (isCenter) {
            // Spacer to push tabs apart, creating the gap for the button
            return <View key="spacer" style={{ width: 80 }} />;
          }

          // Regular Tab
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(tab.name)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={isActive ? tab.iconFilled : tab.icon}
                  size={26} // Reduced from 26 slightly for cleaner look? No keep 26.
                  color={isActive ? activeColor : inactiveColor}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? activeColor : inactiveColor,
                      fontWeight: isActive ? '500' : '400',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Absolute Center Button Overlay */}
      <Animated.View style={[styles.centerButtonContainer, centerButtonStyle]}>
        {/* Pulsing glow background */}
        <Animated.View
          style={[
            styles.centerButtonGlow,
            centerButtonGlowStyle,
            {
              backgroundColor: PASTEL_COLORS.accents.primary,
              opacity: 0.3,
            },
          ]}
        />
        <TouchableOpacity
          style={[
            styles.centerButton,
            {
              backgroundColor: PASTEL_COLORS.accents.primary,
            },
          ]}
          onPress={() => handleTabPress('ai-hub')}
          activeOpacity={0.9}
        >
          <Ionicons name="sparkles" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: HORIZONTAL_INSET,
    right: HORIZONTAL_INSET,
    height: TAB_BAR_HEIGHT,
  },
  backgroundContainer: {
    position: 'absolute', // Taking it out of flow
    top: 0,
    left: 0,
    right: 0, // Ensure filling width
    height: TAB_BAR_HEIGHT,
    // Ensure the dock feels grounded
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
    borderRadius: 28,
    zIndex: 0, // Behind tabs
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    zIndex: -1,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center', // Vertically center within the 80px
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    zIndex: 10,
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center', // Ensure content is centered
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -35, // Half of 70, so center aligns with top edge (0)
    left: (SCREEN_WIDTH - HORIZONTAL_INSET * 2) / 2 - CENTER_BUTTON_SIZE / 2,
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    zIndex: 100, // Highest priority
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonGlow: {
    position: 'absolute',
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: 'transparent',
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
