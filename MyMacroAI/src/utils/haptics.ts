import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback wrapper for strict design system consistency.
 * Uses expo-haptics.
 */
export const haptics = {
    /**
     * Subtle hint, used for minor interactions like toggle switches or list reordering
     */
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

    /**
     * Standard feedback, used for button presses and card interactions
     */
    medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

    /**
     * Prominent feedback, used for significant actions or "lock-in" events
     */
    heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

    /**
     * Success notification (usually two light pulses)
     */
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

    /**
     * Warning notification
     */
    warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

    /**
     * Error notification (usually distinct vibration pattern)
     */
    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

    /**
     * Selection feedback, used for pickers and scroll ticks
     */
    selection: () => Haptics.selectionAsync(),
};
