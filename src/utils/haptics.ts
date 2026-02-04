/**
 * Haptics Utility - Consistent Haptic Feedback
 * 
 * Provides standardized haptic patterns for:
 * - Button interactions
 * - Success/error states
 * - Navigation events
 * - Gamification moments
 * 
 * Respects user's haptic preference setting.
 */

import * as Haptics from 'expo-haptics';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// CORE HAPTICS
// ============================================================================

/**
 * Check if haptics are enabled in user preferences
 */
const isHapticsEnabled = (): boolean => {
  const preferences = useUserStore.getState().preferences;
  return preferences?.haptics !== false;
};

/**
 * Base haptic wrapper - only triggers if enabled
 */
const safeHaptic = async (fn: () => Promise<void>) => {
  if (isHapticsEnabled()) {
    try {
      await fn();
    } catch (e) {
      // Silently fail on devices without haptic support
    }
  }
};

// ============================================================================
// HAPTIC PATTERNS
// ============================================================================

export const haptics = {
  // ===========================================================================
  // IMPACT FEEDBACK
  // ===========================================================================
  
  /**
   * Light - Subtle hint
   * Use for: Toggle switches, list reordering, minor interactions
   */
  light: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Medium - Standard feedback
   * Use for: Button presses, card taps, navigation
   */
  medium: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /**
   * Heavy - Prominent feedback
   * Use for: Important actions, confirmations, "lock-in" events
   */
  heavy: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

  // ===========================================================================
  // NOTIFICATION FEEDBACK
  // ===========================================================================

  /**
   * Success - Celebratory double pulse
   * Use for: Completed actions, achievements, positive feedback
   */
  success: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /**
   * Warning - Attention-getting
   * Use for: Warnings, approaching limits, caution states
   */
  warning: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /**
   * Error - Distinct error pattern
   * Use for: Errors, failed actions, invalid inputs
   */
  error: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),

  // ===========================================================================
  // SELECTION FEEDBACK
  // ===========================================================================

  /**
   * Selection - Subtle tick
   * Use for: Pickers, sliders, scroll ticks
   */
  selection: () => safeHaptic(() => Haptics.selectionAsync()),

  // ===========================================================================
  // COMPOSITE PATTERNS
  // ===========================================================================

  /**
   * Tab Switch - Light tap for tab navigation
   */
  tabSwitch: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Modal Open - Medium impact for modal presentation
   */
  modalOpen: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /**
   * Pull to Refresh - Selection tick
   */
  pullToRefresh: () => safeHaptic(() => Haptics.selectionAsync()),

  /**
   * Delete - Heavy with warning feel
   */
  delete: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /**
   * Achievement - Celebratory success burst
   */
  achievement: async () => {
    if (!isHapticsEnabled()) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Streak - Multi-pulse celebration
   */
  streak: async () => {
    if (!isHapticsEnabled()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(r => setTimeout(r, 50));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise(r => setTimeout(r, 50));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Coin Earn - Light celebration
   */
  coinEarn: async () => {
    if (!isHapticsEnabled()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(r => setTimeout(r, 60));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Countdown Tick - Selection for countdowns
   */
  countdownTick: () => safeHaptic(() => Haptics.selectionAsync()),

  /**
   * Button Press - Standard button feedback
   */
  buttonPress: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Primary Button - More prominent button feedback
   */
  primaryButton: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /**
   * Destructive Action - Warning before destructive
   */
  destructive: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

  /**
   * Slider Change - Selection tick for slider value changes
   */
  sliderChange: () => safeHaptic(() => Haptics.selectionAsync()),

  /**
   * Toggle - Light feedback for toggle switches
   */
  toggle: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Long Press - Heavy feedback for long press trigger
   */
  longPress: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

  /**
   * Swipe Action - Medium feedback for swipe gestures
   */
  swipeAction: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

  /**
   * Refresh Complete - Success feedback after refresh
   */
  refreshComplete: () => safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

  /**
   * Input Error - Subtle error for invalid input
   */
  inputError: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Navigation - Light feedback for navigation
   */
  navigation: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

  /**
   * Menu Open - Medium feedback for menu/dropdown open
   */
  menuOpen: () => safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for using haptics with automatic preference checking
 */
export function useHaptics() {
  const hapticsEnabled = useUserStore(s => s.preferences?.haptics !== false);

  const triggerHaptic = (type: keyof typeof haptics) => {
    if (hapticsEnabled) {
      haptics[type]();
    }
  };

  return {
    ...haptics,
    isEnabled: hapticsEnabled,
    trigger: triggerHaptic,
    
    // Convenient aliases
    impactLight: haptics.light,
    impactMedium: haptics.medium,
    impactHeavy: haptics.heavy,
    notificationSuccess: haptics.success,
    notificationWarning: haptics.warning,
    notificationError: haptics.error,
  };
}

export default haptics;
