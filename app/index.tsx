import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { setupDemoData } from '@/src/utils/demoData';

const { width } = Dimensions.get('window');

// Enable demo mode for App Store screenshots
const DEMO_MODE = true;

export default function AppLaunchScreen() {
  const router = useRouter();

  // Animation States
  const scale = useSharedValue(0.3); // Start small
  const opacity = useSharedValue(0);
  const bgOpacity = useSharedValue(1);

  useEffect(() => {
    // Setup demo data for screenshots if enabled
    if (DEMO_MODE) {
      setupDemoData();
    }

    // Phase 1: The "Wake Up" (Entrance)
    // Soft fade in and spring bounce
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withSpring(1, { damping: 10, stiffness: 80 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Phase 2: The "Vitality Pulse" (Breathing effect)
    // Starts after 1.2s, pulses twice to show the app is 'thinking'
    const pulseTimeout = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        2,
        true
      );
    }, 1200);

    // Phase 3: The "Breach" (Zoom into Dashboard)
    // Logo scales to 40x its size, flying past the user
    const breachTimeout = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      scale.value = withTiming(
        40,
        {
          duration: 900,
          easing: Easing.bezier(0.7, 0, 0.84, 0),
        },
        () => {
          runOnJS(navigateToWelcome)();
        }
      );

      opacity.value = withTiming(0, { duration: 400 });
      bgOpacity.value = withTiming(0, { duration: 800 });
    }, 3800);

    return () => {
      clearTimeout(pulseTimeout);
      clearTimeout(breachTimeout);
    };
  }, []);

  const navigateToWelcome = () => {
    router.replace('/(tabs)/dashboard');
  };

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.Image
        source={require('@/assets/2.png')}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6E8', // Warm cream to match logo background
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
});