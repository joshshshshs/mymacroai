import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

/**
 * SoftDreamyBackground - Zentra-style
 * - Light Mode: Soft cream/beige gradient matching the mockup
 * - Dark Mode: Deep forest theme with bioluminescent accents
 */

const { width, height } = Dimensions.get('window');

export const SoftDreamyBackground: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isDark) {
    // Deep Forest Theme with subtle gradients
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0B1410', '#0F1F1A', '#0B1410']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Bioluminescent Bloom 1 (Teal) */}
        <View style={[styles.bloom, {
          top: -100,
          left: -50,
          backgroundColor: '#2DD4BF',
          opacity: 0.08
        }]} />

        {/* Bioluminescent Bloom 2 (Violet) */}
        <View style={[styles.bloom, {
          bottom: -100,
          right: -50,
          backgroundColor: '#A78BFA',
          opacity: 0.06
        }]} />

        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  // Light Mode - Zentra-style soft cream/beige gradient (matching mockup)
  return (
    <View style={styles.container}>
      {/* Main gradient - soft cream to light gray */}
      <LinearGradient
        colors={['#FAF9F6', '#F5F3EF', '#EDE9E3', '#F5F3EF', '#FAF9F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft warm accent blob - top right */}
      <View style={[styles.softBlob, {
        top: -80,
        right: -60,
        backgroundColor: '#FFE4C4',
        opacity: 0.4,
      }]} />

      {/* Soft cool accent blob - bottom left */}
      <View style={[styles.softBlob, {
        bottom: 100,
        left: -80,
        backgroundColor: '#E8E4F0',
        opacity: 0.5,
      }]} />

      {/* Subtle pink accent - center */}
      <View style={[styles.softBlob, {
        top: height * 0.4,
        right: -100,
        backgroundColor: '#FFE4E8',
        opacity: 0.3,
        width: width * 0.6,
        height: width * 0.6,
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
});
