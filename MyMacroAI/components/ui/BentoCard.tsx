import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

interface BentoCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  scale?: number;
}

const SPRING_CONFIG: WithSpringConfig = {
  damping: 15,
  mass: 0.5,
  stiffness: 150,
  overshootClamping: false,
};

/**
 * BentoCard - 支持缩放动画的模糊卡片组件
 * 使用expo-blur创建毛玻璃效果，支持按压缩放交互
 */
export default function BentoCard({
  children,
  onPress,
  style,
  intensity = 80,
  tint = 'default',
  scale = 0.98,
}: BentoCardProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withSpring(scale, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, SPRING_CONFIG);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.container,
        style,
      ]}
    >
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <BlurView
          intensity={intensity}
          tint={tint}
          style={styles.blurContainer}
        >
          {children}
        </BlurView>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  animatedContainer: {
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    padding: 16,
  },
});