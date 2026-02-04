/**
 * Breathing Exercise - Dynamic Guided Breathing
 * Animated visuals that sync with breathing patterns
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORB_SIZE = 200;

// Breathing patterns
const BREATHING_PATTERNS = {
  relaxation: {
    name: '4-7-8 Relaxation',
    description: 'Calming technique for stress and sleep',
    inhale: 4000,
    hold: 7000,
    exhale: 8000,
    cycles: 4,
    gradient: ['#6366F1', '#8B5CF6'],
  },
  focus: {
    name: 'Box Breathing',
    description: 'Focus and mental clarity',
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    holdAfter: 4000,
    cycles: 4,
    gradient: ['#3B82F6', '#06B6D4'],
  },
  energy: {
    name: 'Energizing Breath',
    description: 'Quick energy boost',
    inhale: 2000,
    hold: 0,
    exhale: 2000,
    cycles: 10,
    gradient: ['#F59E0B', '#EF4444'],
  },
  calm: {
    name: 'Deep Calm',
    description: '5-5 equal breathing',
    inhale: 5000,
    hold: 0,
    exhale: 5000,
    cycles: 6,
    gradient: ['#10B981', '#14B8A6'],
  },
};

type PatternKey = keyof typeof BREATHING_PATTERNS;
type PhaseType = 'ready' | 'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'complete';

export default function BreathingExerciseScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const patternKey = (params.pattern as PatternKey) || 'relaxation';
  const pattern = BREATHING_PATTERNS[patternKey];

  const [phase, setPhase] = useState<PhaseType>('ready');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const colors = {
    bg: isDark ? '#0A0A0C' : '#F8F9FA',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    card: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
  };

  // Animation values
  const orbScale = useSharedValue(1);
  const orbOpacity = useSharedValue(0.6);
  const ringScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  const getPhaseText = () => {
    switch (phase) {
      case 'ready': return 'Tap to Begin';
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdAfter': return 'Hold';
      case 'complete': return 'Complete';
      default: return '';
    }
  };

  const updatePhase = useCallback((newPhase: PhaseType) => {
    setPhase(newPhase);
    if (newPhase !== 'ready' && newPhase !== 'complete') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const runBreathingCycle = useCallback(async (cycle: number) => {
    if (cycle >= pattern.cycles) {
      setPhase('complete');
      setIsActive(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    setCurrentCycle(cycle + 1);

    // Inhale
    runOnJS(updatePhase)('inhale');
    orbScale.value = withTiming(1.6, {
      duration: pattern.inhale,
      easing: Easing.inOut(Easing.ease)
    });
    orbOpacity.value = withTiming(1, { duration: pattern.inhale });
    ringScale.value = withTiming(1.4, { duration: pattern.inhale });
    glowOpacity.value = withTiming(0.6, { duration: pattern.inhale });
    await new Promise(resolve => setTimeout(resolve, pattern.inhale));

    if (!isActive) return;

    // Hold (if any)
    if (pattern.hold > 0) {
      runOnJS(updatePhase)('hold');
      await new Promise(resolve => setTimeout(resolve, pattern.hold));
    }

    if (!isActive) return;

    // Exhale
    runOnJS(updatePhase)('exhale');
    orbScale.value = withTiming(1, {
      duration: pattern.exhale,
      easing: Easing.inOut(Easing.ease)
    });
    orbOpacity.value = withTiming(0.6, { duration: pattern.exhale });
    ringScale.value = withTiming(1, { duration: pattern.exhale });
    glowOpacity.value = withTiming(0.3, { duration: pattern.exhale });
    await new Promise(resolve => setTimeout(resolve, pattern.exhale));

    if (!isActive) return;

    // Hold after exhale (for box breathing)
    if (pattern.holdAfter && pattern.holdAfter > 0) {
      runOnJS(updatePhase)('holdAfter');
      await new Promise(resolve => setTimeout(resolve, pattern.holdAfter));
    }

    if (!isActive) return;

    // Next cycle
    runBreathingCycle(cycle + 1);
  }, [pattern, orbScale, orbOpacity, ringScale, glowOpacity, updatePhase, isActive]);

  const startExercise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
    setCurrentCycle(0);
    runBreathingCycle(0);
  }, [runBreathingCycle]);

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setPhase('ready');
    setCurrentCycle(0);
    cancelAnimation(orbScale);
    cancelAnimation(orbOpacity);
    cancelAnimation(ringScale);
    cancelAnimation(glowOpacity);
    orbScale.value = withTiming(1, { duration: 300 });
    orbOpacity.value = withTiming(0.6, { duration: 300 });
    ringScale.value = withTiming(1, { duration: 300 });
    glowOpacity.value = withTiming(0.3, { duration: 300 });
  }, []);

  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    opacity: orbOpacity.value,
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark ? ['#0A0A0C', '#141420', '#0A0A0C'] : ['#F8F9FA', '#E8EEFF', '#F8F9FA']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { stopExercise(); router.back(); }}
            style={[styles.headerButton, { backgroundColor: colors.card }]}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{pattern.name}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {pattern.description}
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Breathing Orb */}
          <View style={styles.orbContainer}>
            {/* Outer glow */}
            <Animated.View style={[styles.orbGlow, glowAnimatedStyle]}>
              <LinearGradient
                colors={pattern.gradient as [string, string]}
                style={styles.orbGlowGradient}
              />
            </Animated.View>

            {/* Pulsing rings */}
            <Animated.View style={[styles.orbRing, ringAnimatedStyle]}>
              <View style={[styles.orbRingInner, { borderColor: pattern.gradient[0] }]} />
            </Animated.View>

            {/* Main orb */}
            <Animated.View style={[styles.orb, orbAnimatedStyle]}>
              <LinearGradient
                colors={pattern.gradient as [string, string]}
                style={styles.orbGradient}
              />
            </Animated.View>
          </View>

          {/* Phase Text */}
          <View style={styles.phaseContainer}>
            <Text style={[styles.phaseText, { color: pattern.gradient[0] }]}>
              {getPhaseText()}
            </Text>
            {isActive && phase !== 'complete' && (
              <Text style={[styles.cycleText, { color: colors.textSecondary }]}>
                Cycle {currentCycle} of {pattern.cycles}
              </Text>
            )}
          </View>

          {/* Control Button */}
          <View style={[styles.controlContainer, { paddingBottom: insets.bottom + 20 }]}>
            {phase === 'ready' ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startExercise}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={pattern.gradient as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startGradient}
                >
                  <Ionicons name="play" size={24} color="#FFF" />
                  <Text style={styles.startText}>Begin Exercise</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : phase === 'complete' ? (
              <View style={styles.completeContainer}>
                <View style={styles.completeIcon}>
                  <Ionicons name="checkmark-circle" size={64} color={pattern.gradient[0]} />
                </View>
                <Text style={[styles.completeText, { color: colors.text }]}>
                  Exercise Complete
                </Text>
                <Text style={[styles.completeSubtext, { color: colors.textSecondary }]}>
                  Great job! You completed {pattern.cycles} breathing cycles.
                </Text>
                <TouchableOpacity
                  style={[styles.againButton, { backgroundColor: `${pattern.gradient[0]}15` }]}
                  onPress={() => { setPhase('ready'); setCurrentCycle(0); }}
                >
                  <Text style={[styles.againText, { color: pattern.gradient[0] }]}>
                    Do Again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: colors.card }]}
                onPress={stopExercise}
                activeOpacity={0.9}
              >
                <Ionicons name="stop" size={20} color={colors.text} />
                <Text style={[styles.stopText, { color: colors.text }]}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbContainer: {
    width: ORB_SIZE * 2,
    height: ORB_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: ORB_SIZE * 1.8,
    height: ORB_SIZE * 1.8,
    borderRadius: ORB_SIZE * 0.9,
    overflow: 'hidden',
  },
  orbGlowGradient: {
    flex: 1,
    borderRadius: ORB_SIZE * 0.9,
    opacity: 0.3,
  },
  orbRing: {
    position: 'absolute',
    width: ORB_SIZE * 1.5,
    height: ORB_SIZE * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: ORB_SIZE * 0.75,
    borderWidth: 2,
    opacity: 0.4,
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
  },
  orbGradient: {
    flex: 1,
    borderRadius: ORB_SIZE / 2,
  },
  phaseContainer: {
    alignItems: 'center',
    marginTop: 48,
    height: 80,
  },
  phaseText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  cycleText: {
    fontSize: 14,
    marginTop: 8,
  },
  controlContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 48,
    gap: 12,
  },
  startText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  stopText: {
    fontSize: 15,
    fontWeight: '600',
  },
  completeContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  completeIcon: {
    marginBottom: 16,
  },
  completeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  completeSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  againButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  againText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
