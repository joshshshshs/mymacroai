/**
 * RisingEmbers - Goal Celebration Effect
 * 
 * Soft, glowing orange particles that float upwards like campfire sparks.
 * Used when user hits daily Calorie or Protein goal.
 * 
 * Style: Warm, organic, premium (not cheap confetti)
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// EMBER PARTICLE
// ============================================================================

interface EmberProps {
    delay: number;
    startX: number;
    size: number;
    duration: number;
    drift: number;
    color: string;
}

const Ember: React.FC<EmberProps> = ({ delay, startX, size, duration, drift, color }) => {
    const translateY = useSharedValue(SCREEN_HEIGHT + 50);
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Fade in at start
        opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));

        // Rise upward
        translateY.value = withDelay(
            delay,
            withTiming(-100, {
                duration: duration,
                easing: Easing.out(Easing.quad),
            })
        );

        // Gentle drift side to side
        translateX.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(drift, { duration: duration / 4, easing: Easing.inOut(Easing.quad) }),
                    withTiming(-drift, { duration: duration / 4, easing: Easing.inOut(Easing.quad) }),
                    withTiming(drift / 2, { duration: duration / 4, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0, { duration: duration / 4, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            )
        );

        // Pulse scale
        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.3, { duration: 400, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0.8, { duration: 400, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            )
        );

        // Fade out near top
        opacity.value = withDelay(
            delay + duration * 0.6,
            withTiming(0, { duration: duration * 0.4 })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.ember,
                animatedStyle,
                {
                    left: startX,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: size,
                },
            ]}
        />
    );
};

// ============================================================================
// RISING EMBERS CONTAINER
// ============================================================================

interface RisingEmbersProps {
    isActive: boolean;
    intensity?: 'low' | 'medium' | 'high';
    onComplete?: () => void;
}

const EMBER_COLORS = [
    '#FF5C00', // Vitamin Orange
    '#FF8C00', // Bright Orange
    '#FFB347', // Soft Orange
    '#FFD700', // Gold
    '#FF6B35', // Ember Red
];

export const RisingEmbers: React.FC<RisingEmbersProps> = ({
    isActive,
    intensity = 'medium',
    onComplete,
}) => {
    const particleCount = intensity === 'high' ? 30 : intensity === 'medium' ? 20 : 12;

    const embers = useMemo(() => {
        if (!isActive) return [];

        return Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            delay: Math.random() * 2000,
            startX: Math.random() * SCREEN_WIDTH,
            size: 4 + Math.random() * 8,
            duration: 3000 + Math.random() * 2000,
            drift: 15 + Math.random() * 30,
            color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
        }));
    }, [isActive, particleCount]);

    useEffect(() => {
        if (isActive && onComplete) {
            const timer = setTimeout(() => {
                onComplete();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isActive, onComplete]);

    if (!isActive) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {embers.map((ember) => (
                <Ember key={ember.id} {...ember} />
            ))}

            {/* Bottom glow gradient */}
            <LinearGradient
                colors={['rgba(255,92,0,0.3)', 'rgba(255,92,0,0.1)', 'transparent']}
                style={styles.bottomGlow}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
            />
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 1000,
    },
    ember: {
        position: 'absolute',
    },
    bottomGlow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    },
});

export default RisingEmbers;
