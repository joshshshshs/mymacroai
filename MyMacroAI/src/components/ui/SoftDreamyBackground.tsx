import { View, StyleSheet, useColorScheme, Image, Dimensions } from 'react-native';
import { PASTEL_COLORS } from '../../design-system/aesthetics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

/**
 * SoftDreamyBackground
 * - Light Mode: Renders a glassmorphism image background.
 * - Dark Mode: Renders a solid dark background (or gradients if added later).
 */

const { width, height } = Dimensions.get('window');

// Require the asset (ensure it exists at this path from Step 237)
const GLASS_BG_LIGHT = require('../../../assets/glass-bg-light.png');

export const SoftDreamyBackground: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isDark) {
    // Deep Forest Theme (#0B1410) with bioluminescent accents
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

        {/* Blur blending */}
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  // Light Mode (unchanged logic)
  return (
    <View style={styles.container}>
      <Image
        source={GLASS_BG_LIGHT}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000', // Default base
    zIndex: -1,
  },
  image: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bloom: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
  }
});
