/**
 * SegmentedControl - iOS-style segmented control
 * Used for tab switching (Today / History / Pantry)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, MOTION, RADIUS } from '../../../design-system/tokens';

interface SegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  activeIndex,
  onChange,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const segmentWidth = 100 / segments.length;

  const slidePosition = useSharedValue(activeIndex * segmentWidth);

  React.useEffect(() => {
    slidePosition.value = withSpring(activeIndex * segmentWidth, MOTION.spring.smooth);
  }, [activeIndex]);

  const animatedSliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slidePosition.value }],
  }));

  const bgColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';
  const activeTextColor = isDark ? '#FFFFFF' : '#000000';
  const inactiveTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Animated Slider */}
      <Animated.View
        style={[
          styles.slider,
          {
            width: `${segmentWidth}%`,
            backgroundColor: isDark ? COLORS.forest.elevated : '#FFFFFF',
          },
          animatedSliderStyle,
        ]}
      />

      {/* Segments */}
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          style={styles.segment}
          onPress={() => onChange(index)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: activeIndex === index ? activeTextColor : inactiveTextColor,
                fontWeight: activeIndex === index ? '600' : '400',
              },
            ]}
          >
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 2,
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    left: 0,
    top: 2,
    bottom: 2,
    borderRadius: RADIUS.md - 2,
  },
  segment: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  segmentText: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
});
