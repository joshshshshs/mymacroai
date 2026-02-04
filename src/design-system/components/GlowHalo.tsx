/**
 * GlowHalo Component
 * Semantic glow wrapper for health category elements
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { GLOWS } from '../tokens';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

type GlowCategory = keyof typeof GLOWS;

interface GlowHaloProps {
  category: GlowCategory;
  children: React.ReactNode;
  active?: boolean;
  pulse?: boolean; // Enable pulsing animation
  isDark?: boolean;
}

export const GlowHalo: React.FC<GlowHaloProps> = ({
  category,
  children,
  active = false,
  pulse = false,
  isDark = false,
}) => {
  const glowConfig = GLOWS[category];
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (pulse && active) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite
        false
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [pulse, active]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    if (!active) return { opacity: 0 };

    return {
      opacity: pulseOpacity.value,
    };
  });

  const baseOpacity = isDark ? glowConfig.opacityDark : glowConfig.opacityLight;

  // iOS: Use shadowColor for glow effect
  const iosGlowStyle = Platform.OS === 'ios'
    ? {
        shadowColor: glowConfig.color,
        shadowRadius: glowConfig.radius,
        shadowOpacity: active ? baseOpacity : 0,
        shadowOffset: { width: 0, height: 0 },
      }
    : {};

  // Android: Use a blurred background view (simpler approach)
  const AndroidGlow = () => {
    if (Platform.OS !== 'android' || !active) return null;

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: glowConfig.color,
            opacity: baseOpacity * 0.3, // Lower for Android
            borderRadius: glowConfig.radius,
            transform: [{ scale: 1.1 }], // Slightly larger
          },
          animatedGlowStyle,
        ]}
        pointerEvents="none"
      />
    );
  };

  return (
    <View style={styles.container}>
      <AndroidGlow />
      <Animated.View style={[iosGlowStyle, active && animatedGlowStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
