import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Circle, G, Svg, Text, LinearGradient, Stop, Defs } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  WithSpringConfig,
  interpolate,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface LiquidGaugeProps {
  value: number; // 0-100 百分比
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientColors?: string[];
  showValue?: boolean;
  unit?: string;
  label?: string;
  maxValue?: number;
}

const SPRING_CONFIG: WithSpringConfig = {
  damping: 20,
  mass: 1,
  stiffness: 90,
  overshootClamping: false,
};

/**
 * LiquidGauge - 液体计量器组件
 * 使用SVG和Reanimated创建流畅的圆形进度动画
 */
export default function LiquidGauge({
  value,
  size = 120,
  strokeWidth = 12,
  color = '#007AFF',
  gradientColors = ['#007AFF', '#5AC8FA'],
  showValue = true,
  unit = '%',
  label,
  maxValue = 100,
}: LiquidGaugeProps) {
  const animatedValue = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * value) / maxValue;

  useEffect(() => {
    animatedValue.value = withSpring(value, SPRING_CONFIG);
  }, [value]);

  const animatedCircleProps = useAnimatedProps(() => {
    const progress = animatedValue.value / maxValue;
    const offset = circumference - circumference * progress;
    return {
      strokeDashoffset: offset,
    };
  });

  const animatedTextProps = useAnimatedProps(() => {
    return {
      children: `${Math.round(animatedValue.value)}${unit}`,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>
        
        {/* 背景圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* 进度圆环 */}
        <AnimatedCircle
          animatedProps={animatedCircleProps}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
        
        {/* 中心文本 */}
        {showValue && (
          <AnimatedText
            animatedProps={animatedTextProps}
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dy="0.3em"
            fill="white"
            fontSize={size * 0.2}
            fontWeight="bold"
          />
        )}
        
        {/* 标签文本 */}
        {label && (
          <Text
            x={size / 2}
            y={size / 2 + size * 0.15}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize={size * 0.08}
          >
            {label}
          </Text>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});