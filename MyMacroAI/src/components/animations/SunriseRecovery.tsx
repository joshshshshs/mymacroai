/**
 * SunriseRecovery - Sleep Quality Visualization
 * 
 * A "Rising Sun" horizon that shows sleep quality.
 * The sun rises higher based on sleep score, casting warm god rays.
 * 
 * Effects:
 * - Good Sleep: Sun high, golden god rays
 * - Bad Sleep: Sun low, cooler twilight glow
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface SunriseRecoveryProps {
    sleepScore: number; // 0-100
    sleepHours?: number;
    sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
}

// ============================================================================
// COLOR CONFIGS
// ============================================================================

function getSunColors(score: number) {
    if (score >= 85) {
        // Excellent - Bright golden
        return {
            sun: ['#FFD700', '#FFA500', '#FF8C00'],
            sky: ['#87CEEB', '#FFE4B5', '#FFA500'],
            rays: 'rgba(255,215,0,0.3)',
            ambient: '#FFF8E7',
        };
    } else if (score >= 70) {
        // Good - Warm sunrise
        return {
            sun: ['#FFA500', '#FF8C00', '#FF6347'],
            sky: ['#B0C4DE', '#FFDAB9', '#FF8C00'],
            rays: 'rgba(255,140,0,0.25)',
            ambient: '#FFF0E5',
        };
    } else if (score >= 50) {
        // Fair - Early dawn
        return {
            sun: ['#FF8C00', '#FF6347', '#CD5C5C'],
            sky: ['#708090', '#DEB887', '#CD853F'],
            rays: 'rgba(255,99,71,0.2)',
            ambient: '#FFE8E0',
        };
    } else {
        // Poor - Twilight
        return {
            sun: ['#CD5C5C', '#8B4513', '#4A4A4A'],
            sky: ['#2F4F4F', '#696969', '#808080'],
            rays: 'rgba(139,69,19,0.15)',
            ambient: '#E0E0E0',
        };
    }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SunriseRecovery: React.FC<SunriseRecoveryProps> = ({
    sleepScore,
    sleepHours = 7.5,
    sleepQuality,
}) => {
    const colors = getSunColors(sleepScore);

    // Sun position - higher score = higher sun
    const sunPosition = interpolate(sleepScore, [0, 100], [85, 20]);

    const sunGlow = useSharedValue(1);
    const rayOpacity = useSharedValue(0.5);
    const sunScale = useSharedValue(1);

    useEffect(() => {
        // Gentle sun glow breathing
        sunGlow.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            false
        );

        // Ray shimmer
        rayOpacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
                withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            false
        );

        // Subtle scale pulse
        sunScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
                withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            false
        );
    }, []);

    const sunAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: sunGlow.value * sunScale.value }],
    }));

    const rayAnimatedStyle = useAnimatedStyle(() => ({
        opacity: rayOpacity.value,
    }));

    const qualityLabel = sleepQuality ||
        (sleepScore >= 85 ? 'excellent' : sleepScore >= 70 ? 'good' : sleepScore >= 50 ? 'fair' : 'poor');

    return (
        <View style={styles.container}>
            {/* Sky Gradient Background */}
            <LinearGradient
                colors={colors.sky as any}
                style={styles.skyGradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* God Rays */}
            <Animated.View style={[styles.raysContainer, rayAnimatedStyle]}>
                {[...Array(8)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.godRay,
                            {
                                backgroundColor: colors.rays,
                                transform: [
                                    { rotate: `${(i * 22.5) - 90}deg` },
                                    { translateY: -100 },
                                ],
                                top: `${sunPosition}%`,
                            },
                        ]}
                    />
                ))}
            </Animated.View>

            {/* Sun Orb */}
            <Animated.View
                style={[
                    styles.sunContainer,
                    sunAnimatedStyle,
                    { top: `${sunPosition}%` },
                ]}
            >
                {/* Outer glow */}
                <View
                    style={[
                        styles.sunGlow,
                        {
                            backgroundColor: colors.sun[2],
                            shadowColor: colors.sun[0],
                        },
                    ]}
                />
                {/* Inner sun */}
                <LinearGradient
                    colors={colors.sun as any}
                    style={styles.sunCore}
                    start={{ x: 0.3, y: 0.3 }}
                    end={{ x: 0.7, y: 0.7 }}
                />
            </Animated.View>

            {/* Horizon Line */}
            <View style={styles.horizonLine} />

            {/* Stats Overlay */}
            <View style={styles.statsContainer}>
                <Text style={[styles.scoreText, { color: colors.ambient }]}>
                    {sleepScore}
                </Text>
                <Text style={[styles.qualityLabel, { color: colors.ambient }]}>
                    {qualityLabel.toUpperCase()} SLEEP
                </Text>
                <View style={styles.hoursContainer}>
                    <Text style={[styles.hoursText, { color: colors.ambient }]}>
                        {sleepHours.toFixed(1)}h
                    </Text>
                </View>
            </View>
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 280,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    skyGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    raysContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
    },
    godRay: {
        position: 'absolute',
        width: 4,
        height: 300,
        borderRadius: 2,
        left: '50%',
        marginLeft: -2,
    },
    sunContainer: {
        position: 'absolute',
        left: '50%',
        marginLeft: -45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sunGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        opacity: 0.5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
    },
    sunCore: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    horizonLine: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -2,
    },
    qualityLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 2,
        marginTop: -4,
    },
    hoursContainer: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    hoursText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SunriseRecovery;
