/**
 * SoftGlassCard - Ultra-soft glassmorphic card
 * Inspired by modern health app aesthetics
 * Features: soft blur, gradient overlays, inner glow, gentle shadows
 */

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, Pressable, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SOFT_RADIUS, SOFT_BLUR, PASTEL_COLORS } from '../../design-system/aesthetics';
import { MOTION } from '../../design-system/tokens';

interface SoftGlassCardProps {
  children: React.ReactNode;
  variant?: 'ultra-soft' | 'soft' | 'medium' | 'prominent' | 'alpha';
  gradient?: keyof typeof PASTEL_COLORS.gradients;
  glowColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SoftGlassCard: React.FC<SoftGlassCardProps> = ({
  children,
  variant = 'soft',
  gradient,
  glowColor,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);

  // Blur intensity based on variant
  const blurIntensity = {
    'ultra-soft': SOFT_BLUR.light,
    'soft': SOFT_BLUR.medium,
    'medium': SOFT_BLUR.heavy,
    'prominent': SOFT_BLUR.ultra,
    'alpha': 25, // Spec: ~12px blur
  }[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.98, MOTION.spring.snappy);
  };

  const handlePressOut = () => {
    if (onPress) scale.value = withSpring(1, MOTION.spring.bouncy);
  };

  const Container = onPress ? AnimatedPressable : Animated.View;

  // Gradient overlay colors
  const gradientColors = (gradient && PASTEL_COLORS.gradients[gradient])
    ? PASTEL_COLORS.gradients[gradient]
    : ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.15)'];

  // Alpha Variant specific styles
  const isAlpha = variant === 'alpha';
  const alphaShadowStyle = isAlpha ? {
    shadowColor: '#1F2687', // Deep blue/cool grey
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8, // Android approximation
  } : {};

  const alphaBgColor = isAlpha ? 'rgba(255, 255, 255, 0.25)' : PASTEL_COLORS.glass.light;

  return (
    <Container
      style={[
        styles.container,
        style,
        animatedStyle,
        alphaShadowStyle
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* Blur Layer */}
      <BlurView
        intensity={blurIntensity}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      {/* Gradient Overlay (Skip for Alpha to maintain pure glass spec, or keep subtle?) 
          Spec says "Background: Use a pure white fill with high transparency".
          Let's use the alphaBgColor instead of gradient for strict adherence, 
          OR overlay the gradient very subtly. 
          Existing code layers gradient THEN white tint. 
          Let's disable standard gradient for Alpha and just use the solid tint layer we define below.
      */}
      {!isAlpha && (
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* White tint / Background Fill */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: alphaBgColor },
        ]}
      />

      {/* Border with subtle elevation effect */}
      <View
        style={[
          styles.border,
          {
            borderColor: 'rgba(255, 255, 255, 0.3)', // Spec: 0.3
            borderWidth: 1,
          },
          glowColor && {
            borderColor: glowColor,
            borderWidth: 1.5,
          },
        ]}
      />

      {/* Top highlight (simulates light reflection) - Skip for Alpha to keep it flat/clean per spec */}
      {!isAlpha && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
          style={[StyleSheet.absoluteFill, { borderRadius: SOFT_RADIUS.xl }]}
          pointerEvents="none"
        />
      )}

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SOFT_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SOFT_RADIUS.xl,
    zIndex: 1,
    pointerEvents: 'none',
  },
  content: {
    zIndex: 2,
  },
});
