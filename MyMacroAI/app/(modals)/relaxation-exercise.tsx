/**
 * Relaxation Exercise - Guided Muscle Relaxation & Meditation
 * Progressive muscle relaxation with visual guidance
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
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
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Relaxation exercises
const RELAXATION_EXERCISES = {
  progressive: {
    name: 'Progressive Muscle Relaxation',
    duration: '10 min',
    description: 'Systematically tense and release muscle groups',
    gradient: ['#6366F1', '#8B5CF6'],
    icon: 'body',
    steps: [
      { title: 'Feet & Toes', instruction: 'Curl your toes tightly for 5 seconds, then release and feel the relaxation flow.', duration: 30 },
      { title: 'Calves', instruction: 'Point your toes toward your head to tense your calves, hold, then release.', duration: 30 },
      { title: 'Thighs', instruction: 'Squeeze your thigh muscles tightly, hold for 5 seconds, then let go.', duration: 30 },
      { title: 'Abdomen', instruction: 'Tighten your stomach muscles like bracing for impact, then relax.', duration: 30 },
      { title: 'Chest', instruction: 'Take a deep breath, hold it to tense your chest, then exhale slowly.', duration: 30 },
      { title: 'Hands & Arms', instruction: 'Make fists and tense your forearms, hold, then open and relax.', duration: 30 },
      { title: 'Shoulders', instruction: 'Shrug your shoulders up to your ears, hold, then drop them down.', duration: 30 },
      { title: 'Face', instruction: 'Scrunch your face tightly, hold, then let all the tension melt away.', duration: 30 },
      { title: 'Full Body', instruction: 'Take a moment to feel the relaxation throughout your entire body.', duration: 60 },
    ],
  },
  bodyScan: {
    name: 'Body Scan Meditation',
    duration: '8 min',
    description: 'Mindful awareness of each body part',
    gradient: ['#10B981', '#14B8A6'],
    icon: 'scan',
    steps: [
      { title: 'Ground Yourself', instruction: 'Close your eyes. Feel the weight of your body. Take three deep breaths.', duration: 45 },
      { title: 'Feet Awareness', instruction: 'Bring attention to your feet. Notice any sensations without judgment.', duration: 40 },
      { title: 'Legs', instruction: 'Move your awareness up through your legs. Feel heaviness or lightness.', duration: 40 },
      { title: 'Hips & Pelvis', instruction: 'Notice sensations in your hips. Let any tension dissolve.', duration: 40 },
      { title: 'Abdomen', instruction: 'Feel your belly rise and fall with each breath.', duration: 40 },
      { title: 'Chest & Heart', instruction: 'Bring warmth to your heart center. Feel gratitude.', duration: 45 },
      { title: 'Arms & Hands', instruction: 'Notice sensations in your arms, down to your fingertips.', duration: 40 },
      { title: 'Neck & Face', instruction: 'Release tension in your neck, jaw, and facial muscles.', duration: 40 },
      { title: 'Integration', instruction: 'Feel your whole body as one unified, relaxed presence.', duration: 50 },
    ],
  },
  quickRelax: {
    name: 'Quick Stress Relief',
    duration: '3 min',
    description: 'Fast relaxation for busy moments',
    gradient: ['#F59E0B', '#FBBF24'],
    icon: 'flash',
    steps: [
      { title: 'Pause', instruction: 'Stop what you are doing. Close your eyes if possible.', duration: 15 },
      { title: 'Deep Breath', instruction: 'Take a slow, deep breath in through your nose.', duration: 20 },
      { title: 'Slow Exhale', instruction: 'Exhale slowly through your mouth, releasing tension.', duration: 25 },
      { title: 'Shoulder Drop', instruction: 'Let your shoulders drop away from your ears.', duration: 20 },
      { title: 'Jaw Release', instruction: 'Unclench your jaw. Let your tongue rest on the roof of your mouth.', duration: 20 },
      { title: 'Present Moment', instruction: 'Notice 3 things you can hear right now.', duration: 30 },
      { title: 'Gratitude', instruction: 'Think of one thing you are grateful for.', duration: 25 },
      { title: 'Ready', instruction: 'Open your eyes. You are calm and present.', duration: 15 },
    ],
  },
};

type ExerciseKey = keyof typeof RELAXATION_EXERCISES;

export default function RelaxationExerciseScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const exerciseKey = (params.exercise as ExerciseKey) || 'progressive';
  const exercise = RELAXATION_EXERCISES[exerciseKey];

  const [currentStep, setCurrentStep] = useState(-1);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const colors = {
    bg: isDark ? '#0A0A0C' : '#F8F9FA',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
    textMuted: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
    card: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
    cardBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
  };

  // Animations
  const progressWidth = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (isActive) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && currentStep >= 0 && currentStep < exercise.steps.length) {
      const step = exercise.steps[currentStep];
      setTimeRemaining(step.duration);

      progressWidth.value = withTiming(100, {
        duration: step.duration * 1000,
        easing: Easing.linear,
      });

      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next step
            if (currentStep < exercise.steps.length - 1) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentStep(currentStep + 1);
              progressWidth.value = 0;
            } else {
              // Exercise complete
              setIsActive(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, currentStep]);

  const startExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
    setCurrentStep(0);
    progressWidth.value = 0;
  };

  const stopExercise = () => {
    setIsActive(false);
    setCurrentStep(-1);
    progressWidth.value = 0;
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const isComplete = !isActive && currentStep >= exercise.steps.length - 1 && currentStep !== -1;

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>{exercise.name}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {exercise.duration}
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {!isActive && currentStep === -1 ? (
            // Pre-exercise screen
            <Animated.View entering={FadeIn.duration(400)}>
              <View style={[styles.introCard, { backgroundColor: `${exercise.gradient[0]}15`, borderColor: `${exercise.gradient[0]}25` }]}>
                <LinearGradient
                  colors={exercise.gradient as [string, string]}
                  style={styles.introIcon}
                >
                  <Ionicons name={exercise.icon as any} size={32} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.introText, { color: colors.textSecondary }]}>
                  {exercise.description}
                </Text>
                <Text style={[styles.stepCount, { color: colors.textMuted }]}>
                  {exercise.steps.length} guided steps
                </Text>
              </View>

              {/* Step preview */}
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>WHAT TO EXPECT</Text>
              {exercise.steps.map((step, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(index * 50).springify()}
                  style={[styles.stepPreview, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <View style={[styles.stepNumber, { backgroundColor: `${exercise.gradient[0]}20` }]}>
                    <Text style={[styles.stepNumberText, { color: exercise.gradient[0] }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    <Text style={[styles.stepDuration, { color: colors.textMuted }]}>{step.duration}s</Text>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          ) : isComplete ? (
            // Completion screen
            <View style={styles.completeContainer}>
              <Ionicons name="checkmark-circle" size={80} color={exercise.gradient[0]} />
              <Text style={[styles.completeTitle, { color: colors.text }]}>Session Complete</Text>
              <Text style={[styles.completeSubtext, { color: colors.textSecondary }]}>
                You have completed {exercise.name}. Take a moment to notice how you feel.
              </Text>
              <TouchableOpacity
                style={[styles.againButton, { backgroundColor: `${exercise.gradient[0]}15` }]}
                onPress={() => { setCurrentStep(-1); }}
              >
                <Text style={[styles.againText, { color: exercise.gradient[0] }]}>Start Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Active exercise
            <Animated.View entering={FadeIn.duration(300)} style={styles.activeContainer}>
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                <Text style={[styles.stepLabel, { color: colors.textMuted }]}>
                  Step {currentStep + 1} of {exercise.steps.length}
                </Text>
                <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Animated.View style={[styles.progressFill, progressStyle]}>
                    <LinearGradient
                      colors={exercise.gradient as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                </View>
              </View>

              {/* Current step card */}
              <Animated.View style={[styles.activeCard, pulseStyle, { borderColor: `${exercise.gradient[0]}30` }]}>
                <LinearGradient
                  colors={[`${exercise.gradient[0]}20`, `${exercise.gradient[1]}10`]}
                  style={styles.activeCardBg}
                />
                <Text style={[styles.activeTitle, { color: exercise.gradient[0] }]}>
                  {exercise.steps[currentStep]?.title}
                </Text>
                <Text style={[styles.activeInstruction, { color: colors.text }]}>
                  {exercise.steps[currentStep]?.instruction}
                </Text>
                <View style={styles.timerContainer}>
                  <Ionicons name="time-outline" size={20} color={colors.textMuted} />
                  <Text style={[styles.timerText, { color: colors.textMuted }]}>
                    {timeRemaining}s remaining
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.bg }]}>
          {!isActive && currentStep === -1 ? (
            <TouchableOpacity style={styles.startButton} onPress={startExercise} activeOpacity={0.9}>
              <LinearGradient
                colors={exercise.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startGradient}
              >
                <Ionicons name="play" size={22} color="#FFF" />
                <Text style={styles.startText}>Begin Session</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : isActive ? (
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: colors.card }]}
              onPress={stopExercise}
            >
              <Ionicons name="stop" size={20} color={colors.text} />
              <Text style={[styles.stopText, { color: colors.text }]}>End Session</Text>
            </TouchableOpacity>
          ) : null}
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  introCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
  },
  introIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  introText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  stepCount: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginLeft: 4,
  },
  stepPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  stepDuration: {
    fontSize: 12,
  },
  activeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: 32,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  activeCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  activeCardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  activeInstruction: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '500',
  },
  completeContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  completeTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  completeSubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
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
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  startButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  startText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  stopText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
