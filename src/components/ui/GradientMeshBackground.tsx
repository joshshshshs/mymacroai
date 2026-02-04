/**
 * GradientMeshBackground - Ambient background for screens
 * Creates a subtle gradient mesh effect
 */

import React from 'react';
import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface GradientMeshBackgroundProps {
  variant?: 'primary' | 'secondary' | 'dark' | 'light' | 'ai' | 'health' | 'nutrition' | 'community' | 'social';
  opacity?: number;
}

export const GradientMeshBackground: React.FC<GradientMeshBackgroundProps> = ({
  variant = 'primary',
  opacity = 1,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getColors = (): [string, string, string] => {
    switch (variant) {
      case 'secondary':
        return isDark
          ? ['#0F1115', '#1A1A2E', '#0F1115']
          : ['#F8F9FA', '#EEF2FF', '#F8F9FA'];
      case 'dark':
        return ['#0F1115', '#1A1A2E', '#0F1115'];
      case 'light':
        return ['#FFFFFF', '#F8F9FA', '#FFFFFF'];
      case 'ai':
        return isDark
          ? ['#0F1115', '#1E1B4B', '#312E81']
          : ['#F5F3FF', '#EDE9FE', '#DDD6FE'];
      case 'health':
        return isDark
          ? ['#0F1115', '#14532D', '#166534']
          : ['#F0FDF4', '#DCFCE7', '#BBF7D0'];
      case 'nutrition':
        return isDark
          ? ['#0F1115', '#7C2D12', '#9A3412']
          : ['#FFF7ED', '#FFEDD5', '#FED7AA'];
      case 'community':
      case 'social':
        return isDark
          ? ['#0F1115', '#581C87', '#6B21A8']
          : ['#FAF5FF', '#F3E8FF', '#E9D5FF'];
      case 'primary':
      default:
        return isDark
          ? ['#0F1115', '#1A1A2E', '#16213E']
          : ['#F0F0F5', '#E8EDFF', '#F0F0F5'];
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle radial glow effect */}
      <View
        style={[
          styles.glow,
          {
            backgroundColor: isDark
              ? 'rgba(255, 69, 0, 0.05)'
              : 'rgba(59, 130, 246, 0.08)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  glow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    top: -width * 0.3,
    right: -width * 0.4,
  },
});

export default GradientMeshBackground;
