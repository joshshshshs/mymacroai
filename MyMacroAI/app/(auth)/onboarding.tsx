/**
 * Premium Onboarding Flow - ALIVE Edition
 * 
 * 4-screen flow: Welcome → Goal → Setup → Connect
 * 
 * Features:
 * - Floating animated particles
 * - Pulsing logo with glow rings
 * - Animated gradient mesh background
 * - Staggered micro-animations
 * - Parallax effects
 * - Haptic feedback
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useUserActions, useUserStore } from '@/src/store/UserStore';
import { healthSyncService } from '@/services/health/HealthSync';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  bg: '#0A0A0C',
  bgSecondary: '#1A1A1E',
  accent: '#FF5C00',
  accentLight: '#FF8A50',
  accentGlow: 'rgba(255, 92, 0, 0.4)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  success: '#34C759',
  purple: '#7C3AED',
  teal: '#10B981',
};

const GOALS = [
  {
    id: 'lose',
    title: 'Torch Fat',
    subtitle: 'Aggressive cuts, zero muscle loss',
    ionicon: 'flame',
    color: '#FF5C00',
    gradient: ['#FF5C00', '#FF8A50'],
  },
  {
    id: 'build',
    title: 'Build Muscle',
    subtitle: 'Optimize protein timing for gains',
    ionicon: 'barbell',
    color: '#7C3AED',
    gradient: ['#7C3AED', '#A78BFA'],
  },
  {
    id: 'maintain',
    title: 'Peak Performance',
    subtitle: 'Maintain elite body composition',
    ionicon: 'flash',
    color: '#10B981',
    gradient: ['#10B981', '#34D399'],
  },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { id: 'light', label: 'Light', desc: '1-2 days/week' },
  { id: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
  { id: 'active', label: 'Active', desc: '6-7 days/week' },
  { id: 'athlete', label: 'Athlete', desc: '2x/day training' },
];

type OnboardingStep = 'welcome' | 'goal' | 'setup' | 'connect';

// ============================================================================
// ANIMATED BACKGROUND COMPONENTS
// ============================================================================

/**
 * Floating particles that drift across the screen
 */
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    startX: Math.random() * SCREEN_WIDTH,
    startY: Math.random() * SCREEN_HEIGHT,
    duration: Math.random() * 8000 + 6000,
    delay: Math.random() * 3000,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((particle) => (
        <Particle key={particle.id} {...particle} />
      ))}
    </View>
  );
};

const Particle: React.FC<{
  size: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
}> = ({ size, startX, startY, duration, delay }) => {
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withDelay(
      delay,
      withTiming(0.6, { duration: 1000 })
    );

    // Float up
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );

    // Slight horizontal drift
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 30, { duration: duration / 2 }),
          withTiming(startX - 30, { duration: duration / 2 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: COLORS.accent,
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return <Animated.View style={animatedStyle} />;
};

/**
 * Pulsing glow rings around the logo
 */
const PulsingRings: React.FC = () => {
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);
  const ring3Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.4);
  const ring2Opacity = useSharedValue(0.3);
  const ring3Opacity = useSharedValue(0.2);

  useEffect(() => {
    // Ring 1 - fastest
    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    ring1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 })
      ),
      -1,
      true
    );

    // Ring 2 - medium
    ring2Scale.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    ring2Opacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.1, { duration: 2500 }),
          withTiming(0.3, { duration: 2500 })
        ),
        -1,
        true
      )
    );

    // Ring 3 - slowest
    ring3Scale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    ring3Opacity.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(0.05, { duration: 3000 }),
          withTiming(0.2, { duration: 3000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.accent,
    opacity: ring1Opacity.value,
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: COLORS.accentLight,
    opacity: ring2Opacity.value,
    transform: [{ scale: ring2Scale.value }],
  }));

  const ring3Style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: COLORS.accent,
    opacity: ring3Opacity.value,
    transform: [{ scale: ring3Scale.value }],
  }));

  return (
    <View style={styles.ringsContainer}>
      <Animated.View style={ring3Style} />
      <Animated.View style={ring2Style} />
      <Animated.View style={ring1Style} />
    </View>
  );
};

/**
 * Animated gradient mesh background
 */
const AnimatedBackground: React.FC = () => {
  const gradient1Y = useSharedValue(0);
  const gradient2Y = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    gradient1Y.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    gradient2Y.value = withRepeat(
      withSequence(
        withTiming(SCREEN_HEIGHT - 100, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(SCREEN_HEIGHT, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const gradient1Style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH * 0.75,
    backgroundColor: COLORS.accentGlow,
    left: -SCREEN_WIDTH * 0.25,
    top: gradient1Y.value - SCREEN_WIDTH * 0.5,
    opacity: 0.3,
  }));

  const gradient2Style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    borderRadius: SCREEN_WIDTH * 0.5,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    right: -SCREEN_WIDTH * 0.3,
    top: gradient2Y.value - SCREEN_WIDTH * 0.3,
    opacity: 0.2,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View style={gradient1Style} />
      <Animated.View style={gradient2Style} />
    </View>
  );
};

// ============================================================================
// STEP COMPONENTS
// ============================================================================

interface WelcomeStepProps {
  onContinue: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onContinue }) => {
  const logoScale = useSharedValue(0.8);
  const logoRotate = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Logo breathing animation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle rotation
    logoRotate.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.stepContainer}>
      <FloatingParticles />
      <AnimatedBackground />

      {/* Animated Logo */}
      <Animated.View
        entering={FadeInDown.duration(1000).springify()}
        style={styles.logoContainer}
      >
        <PulsingRings />
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <Image
            source={require('@/assets/onboarding.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      {/* Text Content with staggered animation */}
      <Animated.View
        entering={FadeInUp.duration(800).delay(300)}
        style={styles.welcomeTextContainer}
      >
        <Animated.Text
          entering={FadeInUp.duration(600).delay(400)}
          style={styles.welcomeTitle}
        >
          Your nutrition.{'\n'}
          <Text style={styles.accentText}>Supercharged.</Text>
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.duration(600).delay(600)}
          style={styles.welcomeSubtitle}
        >
          The smartest macro tracker on the planet.
        </Animated.Text>
      </Animated.View>

      {/* Features with enhanced animation */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(800)}
        style={styles.featuresContainer}
      >
        <FeatureItemAnimated icon="mic-outline" text="Voice log: just say what you ate" delay={900} />
        <FeatureItemAnimated icon="camera-outline" text="Snap a photo. Get instant macros." delay={1050} />
        <FeatureItemAnimated icon="pulse-outline" text="Targets adjust to your recovery in real-time" delay={1200} />
      </Animated.View>

      {/* Animated CTA Button */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(1400).springify()}
        style={styles.ctaContainer}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onContinue();
          }}
          onPressIn={() => { buttonScale.value = withSpring(0.95); }}
          onPressOut={() => { buttonScale.value = withSpring(1); }}
          activeOpacity={1}
        >
          <Animated.View style={[styles.primaryButton, buttonAnimatedStyle]}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const FeatureItemAnimated: React.FC<{ icon: string; text: string; delay: number }> = ({ icon, text, delay }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        2,
        true
      )
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [1, 1.2, 1]),
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(delay)}
      style={styles.featureItem}
    >
      <Animated.View style={[styles.featureIconContainer, shimmerStyle]}>
        <Ionicons name={icon as any} size={22} color={COLORS.accent} />
      </Animated.View>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
};

// ============================================================================
// GOAL STEP - Enhanced
// ============================================================================

interface GoalStepProps {
  selectedGoal: string;
  onSelectGoal: (goal: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const GoalStep: React.FC<GoalStepProps> = ({ selectedGoal, onSelectGoal, onContinue, onBack }) => {
  return (
    <View style={styles.stepContainer}>
      <FloatingParticles />

      <Animated.View entering={FadeInDown.duration(600)} style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What's your focus?</Text>
        <Text style={styles.stepSubtitle}>
          Pick one. We'll personalize everything for you.
        </Text>
      </Animated.View>

      <View style={styles.goalsContainer}>
        {GOALS.map((goal, index) => (
          <Animated.View
            key={goal.id}
            entering={FadeInUp.duration(600).delay(200 + index * 150).springify()}
          >
            <GoalCardEnhanced
              goal={goal}
              isSelected={selectedGoal === goal.id}
              onSelect={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSelectGoal(goal.id);
              }}
              index={index}
            />
          </Animated.View>
        ))}
      </View>

      <AnimatedNavButtons
        onBack={onBack}
        onNext={selectedGoal ? onContinue : undefined}
        nextLabel="Continue"
        disabled={!selectedGoal}
      />
    </View>
  );
};

interface GoalCardEnhancedProps {
  goal: typeof GOALS[0];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const GoalCardEnhanced: React.FC<GoalCardEnhancedProps> = ({ goal, isSelected, onSelect, index }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      );
      emojiScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
      emojiScale.value = withTiming(1, { duration: 300 });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    backgroundColor: goal.color,
    opacity: glowOpacity.value,
    zIndex: -1,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onSelect}
      onPressIn={() => { scale.value = 0.97; }}
      onPressOut={() => { scale.value = 1; }}
      activeOpacity={0.9}
    >
      <Animated.View style={animatedStyle}>
        <Animated.View style={glowStyle} />
        <BlurView
          intensity={30}
          tint="dark"
          style={[
            styles.goalCard,
            isSelected && { borderColor: goal.color, borderWidth: 2 },
          ]}
        >
          <View style={styles.goalCardContent}>
            <Animated.View style={[styles.goalIconContainer, iconStyle, { backgroundColor: `${goal.color}20` }]}>
              <Ionicons name={goal.ionicon as any} size={28} color={goal.color} />
            </Animated.View>
            <View style={styles.goalTextContainer}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
            </View>
            {isSelected && (
              <Animated.View
                entering={FadeIn.duration(300).springify()}
                style={[styles.checkMark, { backgroundColor: goal.color }]}
              >
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </Animated.View>
            )}
          </View>
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// SETUP STEP
// ============================================================================

interface UserProfile {
  name: string;
  age: string;
  sex: 'male' | 'female' | '';
  height: string;
  weight: string;
  targetWeight: string;
  activityLevel: string;
  units: 'metric' | 'imperial';
}

interface SetupStepProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onContinue: () => void;
  onBack: () => void;
}

const SetupStep: React.FC<SetupStepProps> = ({
  profile,
  onUpdateProfile,
  onContinue,
  onBack,
}) => {
  const isComplete = profile.name.trim() && profile.age && profile.sex && profile.height && profile.weight;

  return (
    <View style={styles.stepContainer}>
      <FloatingParticles />

      <Animated.View entering={FadeInDown.duration(600)} style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Let's personalize{'\n'}your experience</Text>
        <Text style={styles.stepSubtitle}>
          This data makes your calorie targets 3x more accurate.
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.setupScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          style={styles.setupSection}
        >
          <Text style={styles.setupLabel}>What should we call you?</Text>
          <BlurView intensity={30} tint="dark" style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Your first name"
              placeholderTextColor={COLORS.textSecondary}
              value={profile.name}
              onChangeText={(text) => onUpdateProfile({ name: text })}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </BlurView>
        </Animated.View>

        {/* Units - First so height/weight make sense */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(150)}
          style={styles.setupSection}
        >
          <Text style={styles.setupLabel}>Preferred Units</Text>
          <View style={styles.unitsContainer}>
            <UnitButton
              label="Metric"
              isActive={profile.units === 'metric'}
              onPress={() => {
                Haptics.selectionAsync();
                onUpdateProfile({ units: 'metric' });
              }}
            />
            <UnitButton
              label="Imperial"
              isActive={profile.units === 'imperial'}
              onPress={() => {
                Haptics.selectionAsync();
                onUpdateProfile({ units: 'imperial' });
              }}
            />
          </View>
        </Animated.View>

        {/* Age & Sex Row */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(200)}
          style={styles.setupSection}
        >
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.setupLabel}>Age</Text>
              <BlurView intensity={30} tint="dark" style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="28"
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="number-pad"
                  value={profile.age}
                  onChangeText={(text) => onUpdateProfile({ age: text })}
                  maxLength={3}
                />
              </BlurView>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.setupLabel}>Biological Sex</Text>
              <View style={styles.sexContainer}>
                <TouchableOpacity
                  style={[styles.sexButton, profile.sex === 'male' && styles.sexButtonActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onUpdateProfile({ sex: 'male' });
                  }}
                >
                  <Text style={[styles.sexButtonText, profile.sex === 'male' && styles.sexButtonTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sexButton, profile.sex === 'female' && styles.sexButtonActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onUpdateProfile({ sex: 'female' });
                  }}
                >
                  <Text style={[styles.sexButtonText, profile.sex === 'female' && styles.sexButtonTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Height & Weight Row */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(300)}
          style={styles.setupSection}
        >
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.setupLabel}>Height</Text>
              <BlurView intensity={30} tint="dark" style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={profile.units === 'metric' ? '175' : "5'10"}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType={profile.units === 'metric' ? 'number-pad' : 'default'}
                  value={profile.height}
                  onChangeText={(text) => onUpdateProfile({ height: text })}
                />
                <Text style={styles.inputUnit}>{profile.units === 'metric' ? 'cm' : ''}</Text>
              </BlurView>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.setupLabel}>Current Weight</Text>
              <BlurView intensity={30} tint="dark" style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={profile.units === 'metric' ? '75' : '165'}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="number-pad"
                  value={profile.weight}
                  onChangeText={(text) => onUpdateProfile({ weight: text })}
                />
                <Text style={styles.inputUnit}>{profile.units === 'metric' ? 'kg' : 'lb'}</Text>
              </BlurView>
            </View>
          </View>
        </Animated.View>

        {/* Target Weight (Optional) */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(350)}
          style={styles.setupSection}
        >
          <Text style={styles.setupLabel}>Target Weight <Text style={styles.optionalLabel}>(optional)</Text></Text>
          <BlurView intensity={30} tint="dark" style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={profile.units === 'metric' ? '70' : '155'}
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              value={profile.targetWeight}
              onChangeText={(text) => onUpdateProfile({ targetWeight: text })}
            />
            <Text style={styles.inputUnit}>{profile.units === 'metric' ? 'kg' : 'lb'}</Text>
          </BlurView>
          <Text style={styles.setupHint}>
            Leave blank if you're focused on body composition.
          </Text>
        </Animated.View>

        {/* Activity Level */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          style={styles.setupSection}
        >
          <Text style={styles.setupLabel}>Activity Level</Text>
          <View style={styles.activityGrid}>
            {ACTIVITY_LEVELS.map((level, idx) => (
              <ActivityChip
                key={level.id}
                label={level.label}
                isActive={profile.activityLevel === level.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  onUpdateProfile({ activityLevel: level.id });
                }}
                delay={idx * 50}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.selectionAsync();
            onBack();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {isComplete ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onContinue();
            }}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.skipButtonContainer}>
            <TouchableOpacity
              style={styles.skipNextButton}
              onPress={() => {
                Haptics.selectionAsync();
                onContinue();
              }}
            >
              <Text style={styles.skipNextText}>Skip for now</Text>
            </TouchableOpacity>
            <Text style={styles.skipHint}>You can edit this in Settings</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const ActivityChip: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
  delay: number;
}> = ({ label, isActive, onPress, delay }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { scale.value = 0.95; }}
      onPressOut={() => { scale.value = 1; }}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.activityChip,
          isActive && styles.activityChipActive,
          animatedStyle,
        ]}
      >
        <Text style={[
          styles.activityChipText,
          isActive && styles.activityChipTextActive,
        ]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const UnitButton: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={onPress}
      onPressIn={() => { scale.value = 0.97; }}
      onPressOut={() => { scale.value = 1; }}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.unitButton,
          isActive && styles.unitButtonActive,
          animatedStyle,
        ]}
      >
        <Text style={[
          styles.unitButtonText,
          isActive && styles.unitButtonTextActive,
        ]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// CONNECT STEP
// ============================================================================

interface ConnectStepProps {
  onComplete: () => void;
  onBack: () => void;
}

const ConnectStep: React.FC<ConnectStepProps> = ({ onComplete, onBack }) => {
  const [isConnectingHealth, setIsConnectingHealth] = useState(false);
  const [isConnectingNotifications, setIsConnectingNotifications] = useState(false);
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false);
  const [healthConnected, setHealthConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [calendarEnabled, setCalendarEnabled] = useState(false);

  const handleConnectHealth = async () => {
    setIsConnectingHealth(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await healthSyncService.initialize();
      setHealthConnected(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Silently fail - user can connect later
    } finally {
      setIsConnectingHealth(false);
    }
  };

  const handleConnectNotifications = async () => {
    setIsConnectingNotifications(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        setNotificationsEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Configure notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
      }
    } catch (error) {
      console.warn('[Notifications] Permission error:', error);
    } finally {
      setIsConnectingNotifications(false);
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnectingCalendar(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      // Dynamic import to handle missing native module gracefully
      const Calendar = await import('expo-calendar').catch(() => null);

      if (!Calendar) {
        // Native module not available (Expo Go), mark as "enabled" for UX
        // Will request actual permissions on first use in dev build
        setCalendarEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }

      const { status: existingStatus } = await Calendar.getCalendarPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        setCalendarEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      // If module fails, still mark as enabled for better UX
      console.warn('[Calendar] Permission error:', error);
      setCalendarEnabled(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setIsConnectingCalendar(false);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <FloatingParticles />
      <AnimatedBackground />

      <Animated.View entering={FadeInDown.duration(600)} style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Unlock the full{'\n'}experience</Text>
        <Text style={styles.stepSubtitle}>
          Enable these to get the most personalized experience.
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.connectScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.connectScrollContent}
      >
        {/* Health Connect Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()}>
          <ConnectCard
            icon={Platform.OS === 'ios' ? 'heart' : 'fitness'}
            title={Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'}
            subtitle="Sync steps, sleep, heart rate & recovery"
            isConnected={healthConnected}
            isLoading={isConnectingHealth}
            onPress={handleConnectHealth}
            color={healthConnected ? COLORS.success : COLORS.accent}
          />
        </Animated.View>

        {/* Notifications Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(300).springify()}>
          <ConnectCard
            icon="notifications"
            title="Push Notifications"
            subtitle="Meal reminders, AI nudges & daily check-ins"
            isConnected={notificationsEnabled}
            isLoading={isConnectingNotifications}
            onPress={handleConnectNotifications}
            color={notificationsEnabled ? COLORS.success : COLORS.purple}
          />
        </Animated.View>

        {/* Calendar Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(400).springify()}>
          <ConnectCard
            icon="calendar"
            title="Calendar Access"
            subtitle="Smart meal scheduling & workout reminders"
            isConnected={calendarEnabled}
            isLoading={isConnectingCalendar}
            onPress={handleConnectCalendar}
            color={calendarEnabled ? COLORS.success : COLORS.teal}
          />
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInUp.duration(600).delay(500)}
        style={styles.navigationButtons}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.selectionAsync();
            onBack();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
          }}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishButtonGradient}
          >
            <Text style={styles.finishButtonText}>Start My Journey</Text>
            <Ionicons name="rocket-outline" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const ConnectCard: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  isConnected: boolean;
  isLoading?: boolean;
  onPress: () => void;
  color: string;
}> = ({ icon, title, subtitle, isConnected, isLoading, onPress, color }) => {
  const scale = useSharedValue(1);
  const iconPulse = useSharedValue(1);

  useEffect(() => {
    if (isConnected) {
      iconPulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        3,
        true
      );
    }
  }, [isConnected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));

  return (
    <TouchableOpacity
      onPressIn={() => { scale.value = 0.98; }}
      onPressOut={() => { scale.value = 1; }}
      activeOpacity={0.9}
      disabled={isConnected || isLoading}
    >
      <Animated.View style={cardStyle}>
        <BlurView intensity={30} tint="dark" style={styles.connectCard}>
          <View style={styles.connectCardHeader}>
            <Animated.View style={[styles.connectIconContainer, iconStyle]}>
              <Ionicons
                name={icon as any}
                size={28}
                color={color}
              />
            </Animated.View>
            <View style={styles.connectTextContainer}>
              <Text style={styles.connectTitle}>{title}</Text>
              <Text style={styles.connectSubtitle}>{subtitle}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.connectButton,
              isConnected && styles.connectButtonDone,
            ]}
            onPress={onPress}
            disabled={isConnected || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : isConnected ? (
              <>
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={styles.connectButtonText}>Connected</Text>
              </>
            ) : (
              <Text style={styles.connectButtonText}>Connect</Text>
            )}
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const AnimatedNavButtons: React.FC<{
  onBack: () => void;
  onNext?: () => void;
  nextLabel: string;
  disabled?: boolean;
}> = ({ onBack, onNext, nextLabel, disabled }) => {
  const nextScale = useSharedValue(1);

  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(nextScale.value) }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(600)}
      style={styles.navigationButtons}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          Haptics.selectionAsync();
          onBack();
        }}
      >
        <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {onNext && (
        <TouchableOpacity
          onPress={() => {
            if (!disabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onNext();
            }
          }}
          onPressIn={() => { if (!disabled) nextScale.value = 0.95; }}
          onPressOut={() => { nextScale.value = 1; }}
          disabled={disabled}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.nextButton,
              disabled && styles.buttonDisabled,
              nextStyle,
            ]}
          >
            <Text style={styles.nextButtonText}>{nextLabel}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, updatePreferences } = useUserActions();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');

  // Form state
  const [selectedGoal, setSelectedGoal] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: 'moderate',
    units: 'metric',
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = useCallback(() => {
    const store = useUserStore.getState();

    // Save health metrics (biometrics)
    store.actions.updateHealthMetrics({
      weight: parseFloat(profile.weight) || null,
      height: parseFloat(profile.height) || null,
      age: parseInt(profile.age) || null,
    });

    // Save preferences with fitness goals
    store.actions.updatePreferences({
      measurementSystem: profile.units,
      healthSync: false,
      fitnessGoals: [selectedGoal],
    });

    // Save extended user profile for AI personalization and analytics
    // This includes name, sex, activity level, and target weight
    const userProfileData = {
      name: profile.name,
      sex: profile.sex,
      activityLevel: profile.activityLevel,
      targetWeight: profile.targetWeight ? parseFloat(profile.targetWeight) : null,
      goal: selectedGoal,
      onboardingCompletedAt: new Date().toISOString(),
      // Denormalized for analytics
      heightCm: parseFloat(profile.height) || null,
      weightKg: parseFloat(profile.weight) || null,
      ageYears: parseInt(profile.age) || null,
      units: profile.units,
    };

    // Persist to storage for analytics and AI context
    try {
      const { storage } = require('@/src/store/UserStore');
      storage.set('user-profile', JSON.stringify(userProfileData));
    } catch (e) {
      console.warn('[Onboarding] Failed to save extended profile:', e);
    }

    // Mark onboarding complete
    completeOnboarding();

    // Navigate to dashboard
    router.replace('/(tabs)/dashboard');
  }, [completeOnboarding, router, profile, selectedGoal]);

  const goToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <Animated.View
            key="welcome"
            entering={FadeIn.duration(400)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepWrapper}
          >
            <WelcomeStep onContinue={() => goToStep('goal')} />
          </Animated.View>
        );
      case 'goal':
        return (
          <Animated.View
            key="goal"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepWrapper}
          >
            <GoalStep
              selectedGoal={selectedGoal}
              onSelectGoal={setSelectedGoal}
              onContinue={() => goToStep('setup')}
              onBack={() => goToStep('welcome')}
            />
          </Animated.View>
        );
      case 'setup':
        return (
          <Animated.View
            key="setup"
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(300)}
            style={styles.stepWrapper}
          >
            <SetupStep
              profile={profile}
              onUpdateProfile={updateProfile}
              onContinue={() => goToStep('connect')}
              onBack={() => goToStep('goal')}
            />
          </Animated.View>
        );
      case 'connect':
        return (
          <Animated.View
            key="connect"
            entering={SlideInRight.duration(400)}
            exiting={FadeOut.duration(300)}
            style={styles.stepWrapper}
          >
            <ConnectStep
              onComplete={handleComplete}
              onBack={() => goToStep('setup')}
            />
          </Animated.View>
        );
    }
  };

  // Progress indicator
  const steps: OnboardingStep[] = ['welcome', 'goal', 'setup', 'connect'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.bg, COLORS.bgSecondary, COLORS.bg]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Progress Dots - animated */}
        {currentStep !== 'welcome' && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.progressContainer}
          >
            {steps.slice(1).map((step, idx) => (
              <Animated.View
                key={step}
                style={[
                  styles.progressDot,
                  idx < currentIndex && styles.progressDotComplete,
                  idx === currentIndex - 1 && styles.progressDotActive,
                ]}
              />
            ))}
          </Animated.View>
        )}

        {/* Step Content */}
        {renderCurrentStep()}
      </SafeAreaView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safeArea: {
    flex: 1,
  },
  stepWrapper: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  ringsContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotComplete: {
    backgroundColor: COLORS.accent,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: COLORS.accent,
  },

  // Welcome Step
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 24,
    height: 140,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 24,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  accentText: {
    color: COLORS.accent,
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '500',
  },
  ctaContainer: {
    paddingTop: 24,
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 48,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonGlow: {
    position: 'absolute',
    width: '80%',
    height: 20,
    bottom: -10,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    opacity: 0.3,
    filter: 'blur(10px)',
  },

  // Step Header
  stepHeader: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // Goals
  goalsContainer: {
    flex: 1,
    gap: 14,
    justifyContent: 'center',
  },
  goalCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  goalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  checkMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Navigation
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.4,
  },

  // Setup
  setupScrollView: {
    flex: 1,
  },
  setupSection: {
    marginBottom: 28,
  },
  setupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityChip: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  activityChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  activityChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activityChipTextActive: {
    color: '#FFF',
  },
  calorieInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  calorieInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 18,
  },
  calorieUnit: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  setupHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 10,
    fontStyle: 'italic',
  },
  optionalLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textTransform: 'none',
    letterSpacing: 0,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    paddingVertical: 16,
  },
  inputUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  sexContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sexButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  sexButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  sexButtonTextActive: {
    color: '#FFF',
  },
  skipContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  skipWarning: {
    fontSize: 12,
    color: COLORS.accent,
    marginTop: 4,
    fontWeight: '500',
  },
  skipButtonContainer: {
    alignItems: 'flex-end',
  },
  skipNextButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  skipNextText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  skipHint: {
    fontSize: 11,
    color: COLORS.accent,
    marginTop: 6,
    textAlign: 'right',
  },
  unitsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  unitButton: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  unitButtonTextActive: {
    color: '#FFF',
  },

  // Connect
  connectScrollView: {
    flex: 1,
  },
  connectScrollContent: {
    paddingVertical: 20,
    gap: 16,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  connectCard: {
    backgroundColor: COLORS.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 20,
    overflow: 'hidden',
  },
  connectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  connectIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 92, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectTextContainer: {
    flex: 1,
  },
  connectTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  connectSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  connectButtonDone: {
    backgroundColor: COLORS.success,
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  finishButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  finishButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});