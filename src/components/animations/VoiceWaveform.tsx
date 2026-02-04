/**
 * VoiceWaveform.tsx - Reactive Voice Animation
 * 
 * A sleek, Siri-like animation that responds to real audio metering.
 * Replaces the static LivingVoiceOrb.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    withSpring,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceWaveformProps {
    audioLevel: number; // 0.0 to 1.0
    state: 'idle' | 'listening' | 'processing' | 'success' | 'error';
    size?: number;
}

const BAR_COUNT = 5;

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
    audioLevel,
    state,
    size = 120,
}) => {
    // Shared value for audio level with smoothing
    const smoothedLevel = useSharedValue(0);
    const pulse = useSharedValue(1);
    const rotation = useSharedValue(0);

    // Smooth out the audio level updates
    useEffect(() => {
        if (state === 'listening') {
            smoothedLevel.value = withTiming(audioLevel, { duration: 100 });
        } else {
            smoothedLevel.value = withTiming(0.1, { duration: 300 });
        }
    }, [audioLevel, state]);

    // Idle/Processing animations
    useEffect(() => {
        if (state === 'idle' || state === 'processing') {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        } else if (state === 'success') {
            pulse.value = withSpring(1.2);
        } else {
            pulse.value = withTiming(1, { duration: 300 });
        }

        if (state === 'processing') {
            rotation.value = withRepeat(
                withTiming(360, { duration: 2000, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            rotation.value = withTiming(0);
        }
    }, [state]);

    // Colors based on state
    const getColors = () => {
        switch (state) {
            case 'listening': return ['#FF5C00', '#FF8C00', '#FFA500']; // Orange
            case 'processing': return ['#3B82F6', '#60A5FA', '#93C5FD']; // Blue
            case 'success': return ['#10B981', '#34D399', '#6EE7B7']; // Green
            case 'error': return ['#EF4444', '#F87171', '#FCA5A5']; // Red
            default: return ['#A1A1AA', '#D4D4D8', '#E4E4E7']; // Gray
        }
    };

    const colors = getColors();

    // Render concentric circles for a "ripple" effect driven by voice
    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Outer Glow */}
            <Animated.View
                style={[
                    styles.glow,
                    useAnimatedStyle(() => ({
                        transform: [{ scale: interpolate(smoothedLevel.value, [0, 1], [1, 1.8]) }],
                        opacity: interpolate(smoothedLevel.value, [0, 1], [0.3, 0.6]),
                        backgroundColor: colors[0],
                    })),
                    { width: size, height: size, borderRadius: size / 2 }
                ]}
            />

            {/* Middle Ripple */}
            <Animated.View
                style={[
                    styles.ripple,
                    useAnimatedStyle(() => ({
                        transform: [{ scale: interpolate(smoothedLevel.value, [0, 1], [0.9, 1.4]) }],
                        opacity: 0.8,
                        backgroundColor: colors[1],
                    })),
                    { width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4 }
                ]}
            />

            {/* Core Orb */}
            <Animated.View
                style={[
                    styles.core,
                    useAnimatedStyle(() => ({
                        transform: [
                            { scale: state === 'listening' ? interpolate(smoothedLevel.value, [0, 1], [1, 1.1]) : pulse.value },
                            { rotate: `${rotation.value}deg` }
                        ],
                    })),
                    { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 }
                ]}
            >
                <LinearGradient
                    colors={colors as any}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
    },
    ripple: {
        position: 'absolute',
    },
    core: {
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
