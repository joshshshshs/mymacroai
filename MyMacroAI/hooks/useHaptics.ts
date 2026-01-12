import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { logger } from '../utils/logger';

// Haptic feedback types
export type HapticType = 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'notification';

// Sound types
export type SoundType = 
  | 'purchase_success'
  | 'purchase_fail'
  | 'reaction'
  | 'notification';

/**
 * Custom hook for haptic feedback and sound effects
 */
export function useHaptics() {
  // Haptic feedback functions
  const triggerHaptic = useCallback(async (type: HapticType) => {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'notification':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
      }
    } catch (error) {
      logger.warn('Haptic feedback failed:', error);
    }
  }, []);

  // Helper function to get sound URI (disabled until sound assets are added)
  const getSoundUri = (_type: SoundType): number | null => {
    return null;
  };

  // Sound functions
  const playSound = useCallback(async (type: SoundType) => {
    try {
      const soundUri = getSoundUri(type);
      if (!soundUri) {
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundUri, {
        shouldPlay: true
      });
      
      await sound.setVolumeAsync(0.7);
      await sound.playAsync();
      
      // Clean up after playback
      setTimeout(() => {
        sound.unloadAsync();
      }, 3000);
    } catch (error) {
      logger.warn('Sound playback failed:', error);
    }
  }, []);

  // Combined feedback functions
  const triggerPurchaseSuccess = useCallback(async () => {
    await Promise.all([
      triggerHaptic('success'),
      playSound('purchase_success')
    ]);
  }, [triggerHaptic, playSound]);

  const triggerPurchaseFail = useCallback(async () => {
    await Promise.all([
      triggerHaptic('error'),
      playSound('purchase_fail')
    ]);
  }, [triggerHaptic, playSound]);

  const triggerReaction = useCallback(async () => {
    await Promise.all([
      triggerHaptic('notification'),
      playSound('reaction')
    ]);
  }, [triggerHaptic, playSound]);

  const triggerImpact = useCallback(
    async (impact: 'light' | 'medium' | 'heavy') => {
      await triggerHaptic(impact);
    },
    [triggerHaptic]
  );

  const triggerSuccess = useCallback(async () => {
    await triggerHaptic('success');
  }, [triggerHaptic]);

  const triggerError = useCallback(async () => {
    await triggerHaptic('error');
  }, [triggerHaptic]);

  const triggerCollision = useCallback(async () => {
    await triggerHaptic('heavy');
  }, [triggerHaptic]);

  return {
    // Individual functions
    triggerHaptic,
    playSound,
    
    // Combined feedback actions
    triggerPurchaseSuccess,
    triggerPurchaseFail,
    triggerReaction,
    triggerImpact,
    triggerSuccess,
    triggerError,
    triggerCollision,
    
    // Specific haptic types
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
    notification: () => triggerHaptic('notification'),
  };
}
