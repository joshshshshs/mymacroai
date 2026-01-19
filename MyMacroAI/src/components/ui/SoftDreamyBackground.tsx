import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useCombinedTheme } from '@/src/design-system/theme';

/**
 * SoftDreamyBackground - Dynamic Theme Aware
 * 
 * Now uses the active theme palette to color the ambient blobs,
 * creating a cohesive "branded" atmosphere.
 * 
 * - Light Mode: Soft cream/beige gradient with themed accent blobs
 * - Dark Mode: Deep forest theme with themed bioluminescent accents
 */

const { width, height } = Dimensions.get('window');

export const SoftDreamyBackground: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { colors } = useCombinedTheme();

  if (isDark) {
    // Deep Forest Theme with themed gradient blobs
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0B1410', '#0F1F1A', '#0B1410']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Bioluminescent Bloom 1 - Primary Theme Color */}
        <View style={[styles.bloom, {
          top: -100,
          left: -50,
          backgroundColor: colors.primary,
          opacity: 0.08
        }]} />

        {/* Bioluminescent Bloom 2 - Secondary Theme Color */}
        <View style={[styles.bloom, {
          bottom: -100,
          right: -50,
          backgroundColor: colors.secondary,
          opacity: 0.06
        }]} />

        {/* Subtle accent bloom - center right */}
        <View style={[styles.bloom, {
          top: height * 0.3,
          right: -80,
          backgroundColor: colors.charts[2],
          opacity: 0.04,
          width: width * 0.6,
          height: width * 0.6,
        }]} />

        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  // Light Mode - Zentra-style soft cream/beige with themed accent blobs
  return (
    <View style={styles.container}>
      {/* Main gradient - soft cream to light gray */}
      <LinearGradient
        colors={['#FAF9F6', '#F5F3EF', '#EDE9E3', '#F5F3EF', '#FAF9F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft accent blob - top right - PRIMARY THEME COLOR */}
      <View style={[styles.softBlob, {
        top: -80,
        right: -60,
        backgroundColor: colors.primaryLight,
        opacity: 0.6,
      }]} />

      {/* Soft accent blob - bottom left - SURFACE TINT */}
      <View style={[styles.softBlob, {
        bottom: 100,
        left: -80,
        backgroundColor: colors.primaryLight,
        opacity: 0.5,
      }]} />

      {/* Subtle secondary accent - center right */}
      <View style={[styles.softBlob, {
        top: height * 0.4,
        right: -100,
        backgroundColor: colors.charts[3],
        opacity: 0.4,
        width: width * 0.6,
        height: width * 0.6,
      }]} />

      {/* Gradient glow behind ring area - SECONDARY COLOR */}
      <View style={[styles.glowBlob, {
        top: height * 0.15,
        left: width * 0.1,
        backgroundColor: colors.secondary,
        opacity: 0.08,
      }]} />

      {/* Light blur overlay for dreaminess */}
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF9F6',
    zIndex: -1,
  },
  bloom: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
  },
  softBlob: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
  },
  glowBlob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
  },
});
