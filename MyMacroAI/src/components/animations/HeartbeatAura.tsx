/**
 * HeartbeatAura - Living Heart Rate Display
 * 
 * A glowing aura behind heart rate that pulses based on workout intensity.
 * Colors and speed change based on heart rate zone.
 * 
 * Zones:
 * - Rest: Slow, soft breathing glow (Warm White/Peach)
 * - Zone 2 (Fat Burn): Steady, warm pulse (Vitamin Orange)
 * - Zone 5 (Max Effort): Rapid, intense throb (Red-Orange)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// TYPES
// ============================================================================

type HeartRateZone = 'rest' | 'warmup' | 'fatburn' | 'cardio' | 'peak';

interface HeartbeatAuraProps {
    heartRate: number;
    maxHeartRate?: number;
    size?: number;
}

// ============================================================================
// ZONE CONFIG
// ============================================================================

const ZONE_CONFIG = {
    rest: {
        colors: ['#FFE4D6', '#FFECD2', '#FFF8F0'], // Warm White/Peach
        pulseSpeed: 2000, // Slow breathing
        maxScale: 1.15,
        glowIntensity: 0.4,
    },
    warmup: {
        colors: ['#FFD4A8', '#FFBF80', '#FFA94D'], // Light Orange
        pulseSpeed: 1200,
        maxScale: 1.2,
        glowIntensity: 0.5,
    },
    fatburn: {
        colors: ['#FF8C00', '#FF5C00', '#FF6B35'], // Vitamin Orange
        pulseSpeed: 800,
        maxScale: 1.25,
        glowIntensity: 0.6,
    },
    cardio: {
        colors: ['#FF5C00', '#FF4500', '#FF3B00'], // Deep Orange
        pulseSpeed: 500,
        maxScale: 1.3,
        glowIntensity: 0.7,
    },
    peak: {
        colors: ['#FF3B00', '#FF2400', '#FF0000'], // Red-Orange
        pulseSpeed: 350,
        maxScale: 1.4,
        glowIntensity: 0.8,
    },
};

// ============================================================================
// HELPER
// ============================================================================

function getHeartRateZone(heartRate: number, maxHR: number): HeartRateZone {
    const percentage = (heartRate / maxHR) * 100;

    if (percentage < 50) return 'rest';
    if (percentage < 60) return 'warmup';
    if (percentage < 70) return 'fatburn';
    if (percentage < 85) return 'cardio';
    return 'peak';
}

// ============================================================================
// COMPONENT
// ============================================================================

export const HeartbeatAura: React.FC<HeartbeatAuraProps> = ({
    heartRate,
    maxHeartRate = 190,
    size = 180,
}) => {
    const zone = getHeartRateZone(heartRate, maxHeartRate);
    const config = ZONE_CONFIG[zone];

    const auraScale = useSharedValue(1);
    const auraOpacity = useSharedValue(config.glowIntensity);
    const innerPulse = useSharedValue(1);

    useEffect(() => {
        // Outer aura breathing
        auraScale.value = withRepeat(
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

        // Opacity breathing
        auraOpacity.value = withRepeat(
            withSequence(
                withTiming(config.glowIntensity, {
                    duration: config.pulseSpeed / 2,
                    easing: Easing.inOut(Easing.quad),
                }),
                withTiming(config.glowIntensity * 0.5, {
                    duration: config.pulseSpeed / 2,
                    easing: Easing.inOut(Easing.quad),
                })
            ),
            -1,
            false
        );

        // Inner heart icon pulse
        innerPulse.value = withRepeat(
            withSequence(
                withTiming(1.15, {
                    duration: config.pulseSpeed / 3,
                    easing: Easing.out(Easing.quad),
                }),
                withTiming(1, {
                    duration: config.pulseSpeed / 3 * 2,
                    easing: Easing.inOut(Easing.quad),
                })
            ),
            -1,
            false
        );
    }, [zone, config]);

    const auraAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: auraScale.value }],
        opacity: auraOpacity.value,
    }));

    const innerPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: innerPulse.value }],
    }));

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Outer Aura Glow - Layer 3 */}
            <Animated.View
                style={[
                    styles.auraLayer,
                    auraAnimatedStyle,
                    {
                        width: size * 1.5,
                        height: size * 1.5,
                        borderRadius: size * 0.75,
                        backgroundColor: config.colors[2],
                        shadowColor: config.colors[0],
                        shadowRadius: size * 0.4,
                    },
                ]}
            />

            {/* Middle Aura - Layer 2 */}
            <Animated.View
                style={[
                    styles.auraLayer,
                    auraAnimatedStyle,
                    {
                        width: size * 1.2,
                        height: size * 1.2,
                        borderRadius: size * 0.6,
                        backgroundColor: config.colors[1],
                        shadowColor: config.colors[0],
                        shadowRadius: size * 0.3,
                    },
                ]}
            />

            {/* Inner Core - Layer 1 */}
            <View
                style={[
                    styles.core,
                    {
                        width: size * 0.7,
                        height: size * 0.7,
                        borderRadius: size * 0.35,
                        backgroundColor: config.colors[0],
                    },
                ]}
            >
                {/* Heart Icon */}
                <Animated.View style={innerPulseStyle}>
                    <Ionicons name="heart" size={size * 0.2} color="#FFF" />
                </Animated.View>

                {/* Heart Rate Number */}
                <Text style={styles.heartRateText}>{heartRate}</Text>
                <Text style={styles.bpmLabel}>BPM</Text>
            </View>

            {/* Zone Label */}
            <View style={[styles.zoneLabel, { backgroundColor: config.colors[1] }]}>
                <Text style={styles.zoneLabelText}>
                    {zone.toUpperCase()}
                </Text>
            </View>
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    auraLayer: {
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
    },
    core: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    heartRateText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
        marginTop: 4,
    },
    bpmLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1,
    },
    zoneLabel: {
        position: 'absolute',
        bottom: -8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 20,
    },
    zoneLabelText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 1,
    },
});

export default HeartbeatAura;
