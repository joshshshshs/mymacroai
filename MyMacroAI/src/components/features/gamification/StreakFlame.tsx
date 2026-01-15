/**
 * StreakFlame - "The Eternal Flame" Hero Component
 *
 * Gamification Engine centerpiece with dynamic intensity animations.
 * Intensity changes based on streak length:
 * - Spark (1-7 days): Small, fragile ember
 * - Fire (8-14 days): Growing flame
 * - Inferno (15-30 days): Roaring orange inferno
 * - Legend (30+ days): Ultimate purple-gold flame
 *
 * Appears "dying" if goals not met late in day (after 8 PM)
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../design-system/tokens';

const { width } = Dimensions.get('window');

export type FlameIntensity = 'spark' | 'fire' | 'inferno' | 'legend';

interface StreakFlameProps {
    streak: number;
    intensity: FlameIntensity;
    isDying?: boolean;
    freezesAvailable: number;
    onFreezePress?: () => void;
}

// Dynamic flame colors based on intensity
const FLAME_CONFIGS: Record<FlameIntensity, {
    outer: readonly [string, string, ...string[]];
    inner: readonly [string, string, ...string[]];
    core: readonly [string, string, ...string[]];
    glow: string;
    size: { width: number; height: number };
    animDuration: number;
    scaleAmount: number;
}> = {
    spark: {
        outer: ['#FFD54F', '#FFB300', '#FF8F00'],
        inner: ['#FFEB3B', '#FFC107', '#FFB300'],
        core: ['#FFFFFF', '#FFF9C4'],
        glow: 'rgba(255, 193, 7, 0.4)',
        size: { width: 100, height: 130 },
        animDuration: 2500,
        scaleAmount: 0.06,
    },
    fire: {
        outer: ['#FF5722', '#FF7043', '#FF9800'],
        inner: ['#FF8A65', '#FFAB40', '#FFD740'],
        core: ['#FFFFFF', '#FFECB3'],
        glow: 'rgba(255, 87, 34, 0.5)',
        size: { width: 130, height: 165 },
        animDuration: 1500,
        scaleAmount: 0.1,
    },
    inferno: {
        outer: ['#FF3D00', '#FF5722', '#FF9100'],
        inner: ['#FF6E40', '#FF9E80', '#FFD180'],
        core: ['#FFFFFF', '#FFFF8D'],
        glow: 'rgba(255, 61, 0, 0.6)',
        size: { width: 160, height: 200 },
        animDuration: 900,
        scaleAmount: 0.15,
    },
    legend: {
        outer: ['#FF1744', '#FF5722', '#FFD700'],
        inner: ['#FF4081', '#FF8A80', '#FFD54F'],
        core: ['#FFFFFF', '#FFFFFF'],
        glow: 'rgba(255, 215, 0, 0.7)',
        size: { width: 180, height: 230 },
        animDuration: 700,
        scaleAmount: 0.18,
    },
};

export const StreakFlame: React.FC<StreakFlameProps> = ({
    streak,
    intensity,
    isDying = false,
    freezesAvailable,
    onFreezePress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const config = FLAME_CONFIGS[intensity];

    // Animation shared values
    const flameScale = useSharedValue(1);
    const flameRotation = useSharedValue(0);
    const glowOpacity = useSharedValue(0.6);
    const glowScale = useSharedValue(1);
    const innerFlameScale = useSharedValue(0.85);
    const coreFlicker = useSharedValue(1);
    const numberPulse = useSharedValue(1);
    const freezeButtonPulse = useSharedValue(1);
    const particleOpacity = useSharedValue(0);

    useEffect(() => {
        const duration = isDying ? config.animDuration * 3 : config.animDuration;
        const scaleAmt = isDying ? config.scaleAmount * 0.3 : config.scaleAmount;

        // Main flame breathing - more dramatic for higher intensities
        flameScale.value = withRepeat(
            withSequence(
                withTiming(1 + scaleAmt, {
                    duration,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                }),
                withTiming(1 - scaleAmt * 0.5, {
                    duration,
                    easing: Easing.bezier(0.4, 0, 0.2, 1)
                })
            ),
            -1,
            true
        );

        // Flame rotation flicker - faster for intense flames
        flameRotation.value = withRepeat(
            withSequence(
                withTiming(intensity === 'legend' ? 5 : 3, {
                    duration: duration * 0.4,
                    easing: Easing.inOut(Easing.ease)
                }),
                withTiming(intensity === 'legend' ? -5 : -3, {
                    duration: duration * 0.4,
                    easing: Easing.inOut(Easing.ease)
                })
            ),
            -1,
            true
        );

        // Outer glow pulse - more prominent for higher intensities
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(isDying ? 0.15 : 0.9, {
                    duration: duration * 1.2,
                    easing: Easing.inOut(Easing.ease)
                }),
                withTiming(isDying ? 0.05 : 0.5, {
                    duration: duration * 1.2,
                    easing: Easing.inOut(Easing.ease)
                })
            ),
            -1,
            true
        );

        // Glow scale expansion
        glowScale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Inner flame dance
        innerFlameScale.value = withRepeat(
            withSequence(
                withTiming(0.92, { duration: duration * 0.6, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
                withTiming(0.78, { duration: duration * 0.6, easing: Easing.bezier(0.4, 0, 0.2, 1) })
            ),
            -1,
            true
        );

        // Core flicker - rapid for legend status
        coreFlicker.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: duration * 0.2, easing: Easing.ease }),
                withTiming(0.9, { duration: duration * 0.2, easing: Easing.ease }),
                withTiming(1.05, { duration: duration * 0.15, easing: Easing.ease }),
                withTiming(0.95, { duration: duration * 0.15, easing: Easing.ease })
            ),
            -1,
            true
        );

        // Number subtle pulse
        numberPulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: duration * 2, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.98, { duration: duration * 2, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Dying state - freeze button pulses urgently
        if (isDying) {
            freezeButtonPulse.value = withRepeat(
                withSequence(
                    withTiming(1.08, { duration: 500, easing: Easing.ease }),
                    withTiming(1, { duration: 500, easing: Easing.ease })
                ),
                -1,
                true
            );
        }

        // Particle rising effect for legend
        if (intensity === 'legend') {
            particleOpacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000, easing: Easing.ease }),
                    withTiming(0, { duration: 1000, easing: Easing.ease })
                ),
                -1,
                true
            );
        }
    }, [intensity, isDying]);

    // Animated styles
    const flameStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: flameScale.value },
            { rotate: `${flameRotation.value}deg` },
        ],
        opacity: isDying ? 0.45 : 1,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    const innerFlameStyle = useAnimatedStyle(() => ({
        transform: [{ scale: innerFlameScale.value }],
    }));

    const coreStyle = useAnimatedStyle(() => ({
        transform: [{ scale: coreFlicker.value }],
        opacity: isDying ? 0.3 : 1,
    }));

    const numberStyle = useAnimatedStyle(() => ({
        transform: [{ scale: numberPulse.value }],
    }));

    const freezeButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: isDying ? freezeButtonPulse.value : 1 }],
    }));

    // Dynamic text color based on intensity
    const numberColor = useMemo(() => {
        if (isDying) return isDark ? 'rgba(255, 87, 34, 0.5)' : 'rgba(255, 87, 34, 0.6)';
        switch (intensity) {
            case 'legend': return '#FFD700';
            case 'inferno': return COLORS.gamification.vitaminOrange;
            case 'fire': return '#FF7043';
            default: return '#FFB300';
        }
    }, [intensity, isDying, isDark]);

    const labelColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';

    return (
        <View style={styles.container}>
            {/* Multi-layer glow effect */}
            <Animated.View style={[styles.outerGlow, glowStyle]}>
                <LinearGradient
                    colors={[config.glow, 'transparent']}
                    style={styles.outerGlowGradient}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>

            <Animated.View style={[styles.innerGlowLayer, glowStyle, { opacity: 0.4 }]}>
                <View style={[styles.innerGlowCircle, { backgroundColor: config.glow }]} />
            </Animated.View>

            {/* Rising particles for Legend status */}
            {intensity === 'legend' && (
                <>
                    <Animated.View style={[styles.particle, styles.particle1, { opacity: particleOpacity }]}>
                        <View style={styles.sparkle} />
                    </Animated.View>
                    <Animated.View style={[styles.particle, styles.particle2, { opacity: particleOpacity }]}>
                        <View style={styles.sparkle} />
                    </Animated.View>
                    <Animated.View style={[styles.particle, styles.particle3, { opacity: particleOpacity }]}>
                        <View style={styles.sparkle} />
                    </Animated.View>
                </>
            )}

            {/* Main flame structure */}
            <Animated.View style={[styles.flameWrapper, flameStyle, config.size]}>
                {/* Outer flame layer */}
                <LinearGradient
                    colors={config.outer}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                    style={[styles.outerFlame, config.size]}
                >
                    {/* Inner flame layer */}
                    <Animated.View style={[styles.innerFlameContainer, innerFlameStyle]}>
                        <LinearGradient
                            colors={config.inner}
                            start={{ x: 0.5, y: 1 }}
                            end={{ x: 0.5, y: 0 }}
                            style={styles.innerFlameGradient}
                        />
                    </Animated.View>

                    {/* Hot core */}
                    <Animated.View style={[styles.coreContainer, coreStyle]}>
                        <LinearGradient
                            colors={config.core}
                            start={{ x: 0.5, y: 1 }}
                            end={{ x: 0.5, y: 0 }}
                            style={styles.coreGradient}
                        />
                    </Animated.View>
                </LinearGradient>
            </Animated.View>

            {/* Streak number display */}
            <View style={styles.numberContainer}>
                <Animated.Text
                    style={[
                        styles.streakNumber,
                        numberStyle,
                        { color: numberColor }
                    ]}
                >
                    {streak}
                </Animated.Text>
                <Text style={[styles.streakLabel, { color: labelColor }]}>
                    CURRENT STREAK
                </Text>
            </View>

            {/* Freeze button - glass pill design */}
            {freezesAvailable > 0 && (
                <Animated.View style={freezeButtonStyle}>
                    <TouchableOpacity
                        style={[
                            styles.freezeButton,
                            isDying && styles.freezeButtonUrgent,
                        ]}
                        onPress={onFreezePress}
                        activeOpacity={0.7}
                    >
                        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.freezeBlur}>
                            <Ionicons name="snow" size={18} color={COLORS.gamification.iceBlue} />
                            <Text style={styles.freezeText}>{freezesAvailable} Freezes Left</Text>
                        </BlurView>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Dying warning badge */}
            {isDying && (
                <View style={styles.warningContainer}>
                    <LinearGradient
                        colors={['rgba(255, 61, 0, 0.2)', 'rgba(255, 61, 0, 0.1)']}
                        style={styles.warningBadge}
                    >
                        <Ionicons name="warning" size={16} color="#FF3D00" />
                        <Text style={styles.warningText}>Save your streak!</Text>
                    </LinearGradient>
                </View>
            )}

            {/* Intensity indicator */}
            <View style={styles.intensityRow}>
                {(['spark', 'fire', 'inferno', 'legend'] as FlameIntensity[]).map((level, index) => (
                    <View
                        key={level}
                        style={[
                            styles.intensityDot,
                            intensity === level && styles.intensityDotActive,
                            intensity === level && { backgroundColor: config.glow.replace('0.4', '1').replace('0.5', '1').replace('0.6', '1').replace('0.7', '1') }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl,
        paddingTop: SPACING['3xl'],
    },
    outerGlow: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
    },
    outerGlowGradient: {
        flex: 1,
        borderRadius: 175,
    },
    innerGlowLayer: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerGlowCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 125,
    },
    flameWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    outerFlame: {
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 25,
    },
    innerFlameContainer: {
        position: 'absolute',
        bottom: 15,
        width: '55%',
        height: '68%',
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        overflow: 'hidden',
    },
    innerFlameGradient: {
        flex: 1,
        borderTopLeftRadius: 70,
        borderTopRightRadius: 70,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    coreContainer: {
        position: 'absolute',
        bottom: 20,
        width: '28%',
        height: '38%',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        overflow: 'hidden',
    },
    coreGradient: {
        flex: 1,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    numberContainer: {
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    streakNumber: {
        fontSize: TYPOGRAPHY.display.mega.fontSize,
        fontWeight: TYPOGRAPHY.display.mega.fontWeight,
        letterSpacing: TYPOGRAPHY.display.mega.letterSpacing,
        textShadowColor: 'rgba(255, 87, 34, 0.5)',
        textShadowOffset: { width: 0, height: 6 },
        textShadowRadius: 25,
    },
    streakLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 3,
        marginTop: -6,
    },
    freezeButton: {
        marginTop: SPACING.xl,
        borderRadius: RADIUS.pill,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.gamification.iceBlueDim,
    },
    freezeButtonUrgent: {
        borderColor: COLORS.gamification.iceBlue,
        borderWidth: 2,
    },
    freezeBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    freezeText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gamification.iceBlue,
    },
    warningContainer: {
        marginTop: SPACING.md,
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.xs,
    },
    warningText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF3D00',
    },
    intensityRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.xl,
    },
    intensityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    intensityDotActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    particle: {
        position: 'absolute',
        width: 6,
        height: 6,
    },
    particle1: {
        top: 80,
        left: '30%',
    },
    particle2: {
        top: 60,
        right: '35%',
    },
    particle3: {
        top: 100,
        right: '25%',
    },
    sparkle: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFD700',
    },
});
