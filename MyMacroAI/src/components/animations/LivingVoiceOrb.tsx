/**
 * LivingVoiceOrb - AI Interaction Visualizer
 * 
 * A "Molten Core" orb that responds to AI states.
 * Makes the AI feel like a warm companion, not a robot.
 * 
 * States:
 * - Idle: Gentle floating and soft glow
 * - Listening: Expands/contracts with breathing animation
 * - Processing: Swirling liquid energy with orange/gold gradients
 * - Speaking: Pulses in sync with speech, like a digital soul
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    cancelAnimation,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// TYPES
// ============================================================================

type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';

interface LivingVoiceOrbProps {
    state: OrbState;
    size?: number;
    onPress?: () => void;
}

// ============================================================================
// STATE CONFIGS
// ============================================================================

const STATE_CONFIG = {
    idle: {
        colors: ['#FFE4D6', '#FFD4C4', '#FFC4B0'], // Warm peach
        pulseSpeed: 3000,
        maxScale: 1.05,
        rotationSpeed: 8000,
    },
    listening: {
        colors: ['#FF8C00', '#FF5C00', '#FF4500'], // Vitamin Orange
        pulseSpeed: 1200,
        maxScale: 1.15,
        rotationSpeed: 4000,
    },
    processing: {
        colors: ['#FFD700', '#FF8C00', '#FF5C00'], // Gold to Orange
        pulseSpeed: 600,
        maxScale: 1.1,
        rotationSpeed: 1500,
    },
    speaking: {
        colors: ['#FF5C00', '#FFB347', '#FFD700'], // Orange to Gold
        pulseSpeed: 400,
        maxScale: 1.2,
        rotationSpeed: 2000,
    },
};

// ============================================================================
// COMPONENT
// ============================================================================

export const LivingVoiceOrb: React.FC<LivingVoiceOrbProps> = ({
    state,
    size = 120,
    onPress,
}) => {
    const config = STATE_CONFIG[state];

    // Animation values
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const innerRotation = useSharedValue(0);
    const glowOpacity = useSharedValue(0.5);
    const floatY = useSharedValue(0);
    const pulseRing = useSharedValue(1);

    useEffect(() => {
        // Cancel previous animations
        cancelAnimation(scale);
        cancelAnimation(rotation);
        cancelAnimation(innerRotation);
        cancelAnimation(glowOpacity);
        cancelAnimation(floatY);
        cancelAnimation(pulseRing);

        // Scale breathing
        scale.value = withRepeat(
            withSequence(
                withTiming(config.maxScale, {
                    duration: config.pulseSpeed / 2,
                    easing: Easing.inOut(Easing.quad),
                }),
                withTiming(1, {
                    duration: config.pulseSpeed / 2,
                    easing: Easing.inOut(Easing.quad),
                })
            ),
            -1,
            false
        );

        // Rotation
        rotation.value = withRepeat(
            withTiming(360, {
                duration: config.rotationSpeed,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Counter rotation for inner elements
        innerRotation.value = withRepeat(
            withTiming(-360, {
                duration: config.rotationSpeed * 1.5,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Glow intensity
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.8, {
                    duration: config.pulseSpeed / 2,
                    easing: Easing.inOut(Easing.quad),
                }),
                withTiming(0.4, {
                    duration: config.pulseSpeed / 2,
                    easing: Easing.inOut(Easing.quad),
                })
            ),
            -1,
            false
        );

        // Floating motion (idle/listening only)
        if (state === 'idle' || state === 'listening') {
            floatY.value = withRepeat(
                withSequence(
                    withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
                    withTiming(8, { duration: 2000, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            );
        } else {
            floatY.value = withTiming(0, { duration: 300 });
        }

        // Pulse ring for speaking
        if (state === 'speaking') {
            pulseRing.value = withRepeat(
                withSequence(
                    withTiming(1.8, { duration: 800, easing: Easing.out(Easing.quad) }),
                    withTiming(1, { duration: 0 })
                ),
                -1,
                false
            );
        } else {
            pulseRing.value = 1;
        }
    }, [state, config]);

    // Animated styles
    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: floatY.value },
            { scale: scale.value },
        ],
    }));

    const rotatingStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const innerRotatingStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${innerRotation.value}deg` }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const pulseRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseRing.value }],
        opacity: interpolate(pulseRing.value, [1, 1.8], [0.6, 0], Extrapolation.CLAMP),
    }));

    // Icon based on state
    const getIcon = () => {
        switch (state) {
            case 'listening':
                return 'mic';
            case 'processing':
                return 'sync';
            case 'speaking':
                return 'volume-high';
            default:
                return 'sparkles';
        }
    };

    return (
        <View style={[styles.wrapper, { width: size * 2, height: size * 2 }]}>
            {/* Pulse ring (speaking mode) */}
            {state === 'speaking' && (
                <Animated.View
                    style={[
                        styles.pulseRing,
                        pulseRingStyle,
                        {
                            width: size * 1.2,
                            height: size * 1.2,
                            borderRadius: size * 0.6,
                            borderColor: config.colors[0],
                        },
                    ]}
                />
            )}

            <Animated.View style={[styles.container, containerStyle, { width: size, height: size }]}>
                {/* Outer glow */}
                <Animated.View
                    style={[
                        styles.glowLayer,
                        glowStyle,
                        rotatingStyle,
                        {
                            width: size * 1.4,
                            height: size * 1.4,
                            borderRadius: size * 0.7,
                            shadowColor: config.colors[0],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[...config.colors, 'transparent'] as any}
                        style={styles.glowGradient}
                        start={{ x: 0.3, y: 0.3 }}
                        end={{ x: 0.7, y: 0.7 }}
                    />
                </Animated.View>

                {/* Middle swirl layer */}
                <Animated.View
                    style={[
                        innerRotatingStyle,
                        {
                            width: size * 1.1,
                            height: size * 1.1,
                            borderRadius: size * 0.55,
                            overflow: 'hidden',
                        },
                    ]}
                >
                    <LinearGradient
                        colors={config.colors as any}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </Animated.View>

                {/* Core orb */}
                <View
                    style={[
                        styles.core,
                        {
                            width: size * 0.7,
                            height: size * 0.7,
                            borderRadius: size * 0.35,
                            backgroundColor: config.colors[0],
                            shadowColor: config.colors[0],
                        },
                    ]}
                >
                    <Ionicons
                        name={getIcon() as any}
                        size={size * 0.25}
                        color="#FFF"
                    />
                </View>
            </Animated.View>
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowLayer: {
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        overflow: 'hidden',
    },
    glowGradient: {
        flex: 1,
        borderRadius: 999,
    },
    core: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        zIndex: 10,
    },
    pulseRing: {
        position: 'absolute',
        borderWidth: 3,
    },
});

export default LivingVoiceOrb;
