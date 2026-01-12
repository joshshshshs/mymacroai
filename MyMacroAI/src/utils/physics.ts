import { WithSpringConfig } from 'react-native-reanimated';

/**
 * Viscous Spring (For cards)
 * Simulation of a fluid, slightly resistant motion.
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
 * Snappy Spring (For buttons)
 * Quick, responsive feedback with minimal bounce.
 */
export const SNAPPY_SPRING: WithSpringConfig = {
    damping: 15,
    stiffness: 120,
    mass: 0.8,
};
