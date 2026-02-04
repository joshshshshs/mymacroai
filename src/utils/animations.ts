import { WithSpringConfig } from 'react-native-reanimated';

/**
 * Soft-Spartan viscous spring
 * Recommended for: Page transitions, large card movements, modal sheets
 */
export const VISCOUS_SPRING: WithSpringConfig = {
    damping: 30,
    stiffness: 300,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
};

/**
 * Snappy feedback spring
 * Recommended for: Button presses, toggle switches, small interactions
 */
export const SNAPPY_SPRING: WithSpringConfig = {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
};

/**
 * Bouncy spring
 * Recommended for: Notification bubbles, playful elements
 */
export const BOUNCY_SPRING: WithSpringConfig = {
    damping: 12,
    stiffness: 200,
};

export const ANIMATION_DURATION = {
    fast: 150,
    normal: 250,
    slow: 400,
};

export const PRESS_SCALE = {
    default: 0.96,
    subtle: 0.98,
};
