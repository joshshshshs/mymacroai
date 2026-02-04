/**
 * useReducedMotion Hook
 * Detects system accessibility settings for motion and transparency
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export const useReducedMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled || false);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReduceMotion(enabled);
      }
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
};

export const useReducedTransparency = () => {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    // iOS only - React Native doesn't expose this on Android
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceTransparencyEnabled?.()?.then((enabled) => {
        setReduceTransparency(enabled || false);
      });

      const subscription = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        (enabled) => {
          setReduceTransparency(enabled);
        }
      );

      return () => {
        subscription?.remove();
      };
    }
  }, []);

  return reduceTransparency;
};

/**
 * Combined accessibility hook
 */
export const useAccessibility = () => {
  const reduceMotion = useReducedMotion();
  const reduceTransparency = useReducedTransparency();

  return {
    reduceMotion,
    reduceTransparency,
    // Helper to get animation duration (instant if reduced motion)
    getAnimationDuration: (duration: number) => (reduceMotion ? 1 : duration),
  };
};
