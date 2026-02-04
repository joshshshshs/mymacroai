/**
 * Animation Presets - Consistent Animation Helpers
 * 
 * Provides standardized animation configurations for:
 * - Page transitions
 * - Component enters/exits
 * - Interactive feedback
 * - List staggering
 */

import {
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import {
  FadeIn,
  FadeOut,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOutUp,
  FadeOutDown,
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideOutUp,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  Layout,
  Keyframe,
} from 'react-native-reanimated';

// ============================================================================
// SPRING CONFIGS
// ============================================================================

export const SPRING_CONFIGS = {
  // Snappy - Quick responsive interactions
  snappy: {
    damping: 15,
    stiffness: 200,
    mass: 0.6,
  },
  
  // Bouncy - Playful elements
  bouncy: {
    damping: 12,
    stiffness: 150,
    mass: 0.8,
  },
  
  // Smooth - Large transitions
  smooth: {
    damping: 20,
    stiffness: 120,
    mass: 1.0,
  },
  
  // Gentle - Subtle movements
  gentle: {
    damping: 25,
    stiffness: 100,
    mass: 1.0,
  },
  
  // Heavy - Slow, weighty feel
  heavy: {
    damping: 30,
    stiffness: 80,
    mass: 1.2,
  },
  
  // Viscous - Liquid-like motion
  viscous: {
    damping: 25,
    stiffness: 100,
    mass: 1.2,
  },
};

// Legacy exports for backward compatibility
export const VISCOUS_SPRING = SPRING_CONFIGS.viscous;
export const SNAPPY_SPRING = SPRING_CONFIGS.snappy;
export const BOUNCY_SPRING = SPRING_CONFIGS.bouncy;
export const SMOOTH_SPRING = SPRING_CONFIGS.smooth;

// ============================================================================
// TIMING CONFIGS
// ============================================================================

export const TIMING_CONFIGS = {
  // Micro - Button taps, toggles
  micro: {
    duration: 120,
    easing: Easing.out(Easing.ease),
  },
  
  // Short - Quick transitions
  short: {
    duration: 200,
    easing: Easing.out(Easing.ease),
  },
  
  // Medium - Screen transitions
  medium: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },
  
  // Long - Modal presentations
  long: {
    duration: 400,
    easing: Easing.inOut(Easing.ease),
  },
  
  // Slow - Ambient animations
  slow: {
    duration: 600,
    easing: Easing.linear,
  },
};

// ============================================================================
// ENTERING ANIMATIONS
// ============================================================================

export const ENTER_ANIMATIONS = {
  // Fade
  fadeIn: FadeIn.duration(300),
  fadeInFast: FadeIn.duration(150),
  fadeInSlow: FadeIn.duration(500),
  
  // Fade + Slide
  fadeInUp: FadeInUp.duration(300).springify().damping(15),
  fadeInDown: FadeInDown.duration(300).springify().damping(15),
  fadeInLeft: FadeInLeft.duration(300).springify().damping(15),
  fadeInRight: FadeInRight.duration(300).springify().damping(15),
  
  // Slide
  slideInUp: SlideInUp.springify().damping(15),
  slideInDown: SlideInDown.springify().damping(15),
  slideInLeft: SlideInLeft.springify().damping(15),
  slideInRight: SlideInRight.springify().damping(15),
  
  // Zoom
  zoomIn: ZoomIn.duration(300).springify().damping(12),
  
  // Bounce
  bounceIn: BounceIn.duration(400),
};

// ============================================================================
// EXITING ANIMATIONS
// ============================================================================

export const EXIT_ANIMATIONS = {
  // Fade
  fadeOut: FadeOut.duration(200),
  fadeOutFast: FadeOut.duration(100),
  
  // Fade + Slide
  fadeOutUp: FadeOutUp.duration(200),
  fadeOutDown: FadeOutDown.duration(200),
  
  // Slide
  slideOutUp: SlideOutUp.duration(200),
  slideOutDown: SlideOutDown.duration(200),
  
  // Zoom
  zoomOut: ZoomOut.duration(200),
  
  // Bounce
  bounceOut: BounceOut.duration(300),
};

// ============================================================================
// LIST ANIMATIONS
// ============================================================================

/**
 * Creates staggered entering animation for list items
 */
export const staggeredEnter = (index: number, baseDelay: number = 50) => {
  return FadeInUp
    .delay(index * baseDelay)
    .duration(300)
    .springify()
    .damping(15);
};

/**
 * Creates staggered fade in for list items
 */
export const staggeredFadeIn = (index: number, baseDelay: number = 30) => {
  return FadeIn
    .delay(index * baseDelay)
    .duration(200);
};

/**
 * Layout animation for list changes
 */
export const listLayout = Layout.springify().damping(15);

// ============================================================================
// INTERACTIVE ANIMATIONS
// ============================================================================

/**
 * Press animation - scales down on press
 */
export const animatePress = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSpring(0.95, SPRING_CONFIGS.snappy, () => {
    scale.value = withSpring(1, SPRING_CONFIGS.snappy);
  });
};

/**
 * Bounce animation - bounces once
 */
export const animateBounce = (scale: SharedValue<number>) => {
  'worklet';
  scale.value = withSequence(
    withSpring(1.1, SPRING_CONFIGS.snappy),
    withSpring(1, SPRING_CONFIGS.bouncy)
  );
};

/**
 * Shake animation - horizontal shake
 */
export const animateShake = (translateX: SharedValue<number>) => {
  'worklet';
  translateX.value = withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
};

/**
 * Pulse animation - subtle scale pulse
 */
export const animatePulse = (scale: SharedValue<number>, intensity: number = 1.05) => {
  'worklet';
  scale.value = withSequence(
    withTiming(intensity, { duration: 150 }),
    withTiming(1, { duration: 150 })
  );
};

/**
 * Success animation - checkmark appear
 */
export const animateSuccess = (scale: SharedValue<number>, opacity: SharedValue<number>) => {
  'worklet';
  scale.value = 0;
  opacity.value = 0;
  
  scale.value = withSpring(1, SPRING_CONFIGS.bouncy);
  opacity.value = withTiming(1, { duration: 200 });
};

/**
 * Error animation - shake and red flash
 */
export const animateError = (translateX: SharedValue<number>) => {
  'worklet';
  translateX.value = withSequence(
    withTiming(-8, { duration: 40 }),
    withTiming(8, { duration: 40 }),
    withTiming(-6, { duration: 40 }),
    withTiming(6, { duration: 40 }),
    withTiming(-4, { duration: 40 }),
    withTiming(4, { duration: 40 }),
    withTiming(0, { duration: 40 })
  );
};

// ============================================================================
// KEYFRAME ANIMATIONS
// ============================================================================

/**
 * Breathing animation keyframe
 */
export const breathingKeyframe = new Keyframe({
  0: { transform: [{ scale: 1 }], opacity: 1 },
  50: { transform: [{ scale: 1.03 }], opacity: 0.8 },
  100: { transform: [{ scale: 1 }], opacity: 1 },
}).duration(2000);

/**
 * Glow pulse keyframe
 */
export const glowPulseKeyframe = new Keyframe({
  0: { opacity: 0.3 },
  50: { opacity: 0.6 },
  100: { opacity: 0.3 },
}).duration(1500);

/**
 * Floating animation keyframe
 */
export const floatingKeyframe = new Keyframe({
  0: { transform: [{ translateY: 0 }] },
  50: { transform: [{ translateY: -8 }] },
  100: { transform: [{ translateY: 0 }] },
}).duration(3000);

// ============================================================================
// PAGE TRANSITION PRESETS
// ============================================================================

export const PAGE_TRANSITIONS = {
  // Modal - slides up
  modal: {
    entering: SlideInUp.springify().damping(18),
    exiting: SlideOutDown.duration(200),
  },
  
  // Drawer - slides from right
  drawer: {
    entering: SlideInRight.springify().damping(20),
    exiting: FadeOut.duration(150),
  },
  
  // Stack - fade + scale
  stack: {
    entering: FadeIn.duration(200).delay(50),
    exiting: FadeOut.duration(150),
  },
  
  // Tab - fade only
  tab: {
    entering: FadeIn.duration(150),
    exiting: FadeOut.duration(100),
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a delayed spring animation
 */
export const delayedSpring = (
  delay: number,
  toValue: number,
  config = SPRING_CONFIGS.smooth
) => {
  'worklet';
  return withDelay(delay, withSpring(toValue, config));
};

/**
 * Creates a sequence of spring animations
 */
export const springSequence = (
  values: number[],
  config = SPRING_CONFIGS.snappy
) => {
  'worklet';
  const sequence = values.map(v => withSpring(v, config));
  return withSequence(...sequence);
};

export default {
  SPRING_CONFIGS,
  TIMING_CONFIGS,
  ENTER_ANIMATIONS,
  EXIT_ANIMATIONS,
  staggeredEnter,
  staggeredFadeIn,
  listLayout,
  animatePress,
  animateBounce,
  animateShake,
  animatePulse,
  animateSuccess,
  animateError,
  PAGE_TRANSITIONS,
};
