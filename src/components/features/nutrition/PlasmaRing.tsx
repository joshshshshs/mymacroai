/**
 * PlasmaRing - "The Metabolic Engine" Hero Component
 *
 * State of the Art Features:
 * - 12px stroke with Neon Orange gradient
 * - Breathing glow animation (opacity 0.3 -> 0.6)
 * - 3D flip interaction (Remaining ↔ Eaten/Burned)
 * - 3 Mini Macro Rings (P/C/F) side by side
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    interpolate,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';

// Glass & Light Color Palette
const COLORS = {
    vitaminOrange: '#FF5C00',
    neonOrange: '#FF9E00',
    glowOrange: 'rgba(255, 92, 0, 0.4)',
    springGreen: '#00FF94',
    fastedBlue: '#00D2FF',
    burnedTeal: '#00B4CC',  // Refined teal for burned calories
    overRed: '#FF4757',
    // Macro colors
    protein: '#3B82F6',
    carbs: '#22C55E',
    fats: '#F59E0B',
};

interface MacroData {
    current: number;
    target: number;
}

interface Props {
    consumed: number;
    target: number;
    burned: number;
    isFasted?: boolean;
    protein?: MacroData;
    carbs?: MacroData;
    fats?: MacroData;
}

const RING_SIZE = 240;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Mini Ring constants
const MINI_RING_SIZE = 90;
const MINI_RING_STROKE = 8;
const MINI_RING_RADIUS = (MINI_RING_SIZE - MINI_RING_STROKE) / 2;
const MINI_RING_CIRCUMFERENCE = 2 * Math.PI * MINI_RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Mini Macro Ring Component
const MacroRing: React.FC<{
    label: string;
    current: number;
    target: number;
    color: string;
    colorLight: string;
    isDark: boolean;
}> = ({ label, current, target, color, colorLight, isDark }) => {
    const progress = target > 0 ? Math.min(current / target, 1) : 0;
    const progressAnim = useSharedValue(0);

    useEffect(() => {
        progressAnim.value = withTiming(progress, { duration: 1200, easing: Easing.out(Easing.cubic) });
    }, [progress]);

    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: MINI_RING_CIRCUMFERENCE * (1 - progressAnim.value),
    }));

    const trackColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';

    return (
        <View style={styles.macroRingContainer}>
            <Svg width={MINI_RING_SIZE} height={MINI_RING_SIZE}>
                <Defs>
                    <LinearGradient id={`macroGradient_${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={color} />
                        <Stop offset="100%" stopColor={colorLight} />
                    </LinearGradient>
                </Defs>

                {/* Track */}
                <Circle
                    cx={MINI_RING_SIZE / 2}
                    cy={MINI_RING_SIZE / 2}
                    r={MINI_RING_RADIUS}
                    stroke={trackColor}
                    strokeWidth={MINI_RING_STROKE}
                    fill="none"
                />

                {/* Progress Arc */}
                <AnimatedCircle
                    cx={MINI_RING_SIZE / 2}
                    cy={MINI_RING_SIZE / 2}
                    r={MINI_RING_RADIUS}
                    stroke={`url(#macroGradient_${label})`}
                    strokeWidth={MINI_RING_STROKE}
                    strokeDasharray={`${MINI_RING_CIRCUMFERENCE} ${MINI_RING_CIRCUMFERENCE}`}
                    animatedProps={animatedCircleProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${MINI_RING_SIZE / 2}, ${MINI_RING_SIZE / 2}`}
                    fill="none"
                />
            </Svg>

            {/* Center Content */}
            <View style={styles.macroRingCenter}>
                <Text style={[styles.macroRingValue, { color: textColor }]}>{Math.round(current)}</Text>
                <Text style={[styles.macroRingUnit, { color: secondaryColor }]}>/{target}g</Text>
            </View>

            {/* Label below */}
            <Text style={[styles.macroRingLabel, { color }]}>{label}</Text>
        </View>
    );
};

export const PlasmaRing: React.FC<Props> = ({
    consumed,
    target,
    burned,
    isFasted = false,
    protein = { current: 0, target: 180 },
    carbs = { current: 0, target: 250 },
    fats = { current: 0, target: 80 },
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [showEaten, setShowEaten] = useState(false);

    // Calculate progress
    const remaining = Math.max(0, target - consumed);
    const progressRatio = Math.min(consumed / target, 1);
    const overEating = consumed > target;

    // Animated values
    const breathingGlow = useSharedValue(0.3);
    const pulseScale = useSharedValue(1);
    const flipProgress = useSharedValue(0);
    const progressAnim = useSharedValue(0);

    // Determine gradient colors based on state
    const getGradientColors = (): [string, string] => {
        if (overEating) return [COLORS.overRed, '#E63946'];
        if (isFasted) return [COLORS.fastedBlue, '#0099CC'];
        return [COLORS.vitaminOrange, COLORS.neonOrange];
    };

    const gradientColors = getGradientColors();
    const primaryColor = gradientColors[0];

    // Breathing glow animation
    useEffect(() => {
        breathingGlow.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        // Subtle pulse
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        // Animate progress on mount
        progressAnim.value = withTiming(progressRatio, { duration: 1500, easing: Easing.out(Easing.cubic) });
    }, [progressRatio]);

    // Animated styles
    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: breathingGlow.value,
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    // Front face style (Remaining)
    const frontFaceStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
        const opacity = interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 0]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
            opacity,
        };
    });

    // Back face style (Eaten/Burned)
    const backFaceStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
        const opacity = interpolate(flipProgress.value, [0, 0.5, 1], [0, 0, 1]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
            opacity,
            position: 'absolute' as const,
        };
    });

    // Animated circle props
    const animatedCircleProps = useAnimatedProps(() => ({
        strokeDashoffset: RING_CIRCUMFERENCE * (1 - progressAnim.value),
    }));

    // Handle flip
    const handleFlip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const newValue = showEaten ? 0 : 1;
        flipProgress.value = withSpring(newValue, {
            damping: 15,
            stiffness: 100,
        });
        setShowEaten(!showEaten);
    };

    // Colors based on theme
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';
    const trackColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    return (
        <View style={styles.container}>
            {/* Outer Glow Ring (Blurred duplicate) */}
            <Animated.View style={[styles.glowRing, glowStyle, { shadowColor: primaryColor }]} />

            {/* Main Ring */}
            <Animated.View style={[styles.ringWrapper, pulseStyle]}>
                <Svg width={RING_SIZE} height={RING_SIZE}>
                    <Defs>
                        <LinearGradient id="plasmaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={gradientColors[0]} />
                            <Stop offset="100%" stopColor={gradientColors[1]} />
                        </LinearGradient>
                    </Defs>

                    {/* Track */}
                    <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke={trackColor}
                        strokeWidth={RING_STROKE}
                        fill="none"
                    />

                    {/* Progress Arc */}
                    <AnimatedCircle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke="url(#plasmaGradient)"
                        strokeWidth={RING_STROKE}
                        strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                        animatedProps={animatedCircleProps}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                        fill="none"
                    />
                </Svg>

                {/* Center Hub - Flippable */}
                <TouchableOpacity
                    style={styles.centerHub}
                    onPress={handleFlip}
                    activeOpacity={0.9}
                >
                    {/* Front Face - Remaining */}
                    <Animated.View style={[styles.flipFace, frontFaceStyle]}>
                        <Text style={[styles.heroValue, { color: textColor }]}>
                            {remaining.toLocaleString()}
                        </Text>
                        <View style={[styles.labelPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                            <Text style={[styles.labelText, { color: secondaryColor }]}>
                                kcal Remaining
                            </Text>
                        </View>
                        <Text style={[styles.tapHint, { color: secondaryColor }]}>
                            Tap to flip
                        </Text>
                    </Animated.View>

                    {/* Back Face - Eaten vs Burned */}
                    <Animated.View style={[styles.flipFace, backFaceStyle]}>
                        <View style={styles.splitStats}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: COLORS.vitaminOrange }]}>
                                    {consumed.toLocaleString()}
                                </Text>
                                <Text style={[styles.statLabel, { color: secondaryColor }]}>
                                    Eaten
                                </Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: COLORS.burnedTeal }]}>
                                    {burned.toLocaleString()}
                                </Text>
                                <Text style={[styles.statLabel, { color: secondaryColor }]}>
                                    Burned
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.tapHint, { color: secondaryColor, marginTop: 12 }]}>
                            Tap to flip back
                        </Text>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>

            {/* 3 Macro Rings Side by Side */}
            <View style={styles.macroRingsRow}>
                <MacroRing
                    label="Protein"
                    current={protein.current}
                    target={protein.target}
                    color={COLORS.protein}
                    colorLight="#60A5FA"
                    isDark={isDark}
                />
                <MacroRing
                    label="Carbs"
                    current={carbs.current}
                    target={carbs.target}
                    color={COLORS.carbs}
                    colorLight="#4ADE80"
                    isDark={isDark}
                />
                <MacroRing
                    label="Fats"
                    current={fats.current}
                    target={fats.target}
                    color={COLORS.fats}
                    colorLight="#FBBF24"
                    isDark={isDark}
                />
            </View>

            {/* Status Badges */}
            {isFasted && (
                <View style={[styles.statusBadge, { backgroundColor: `${COLORS.fastedBlue}15` }]}>
                    <Text style={[styles.statusText, { color: COLORS.fastedBlue }]}>
                        Fasted Mode
                    </Text>
                </View>
            )}
            {overEating && (
                <View style={[styles.statusBadge, { backgroundColor: `${COLORS.overRed}15` }]}>
                    <Text style={[styles.statusText, { color: COLORS.overRed }]}>
                        Over Target
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingTop: SPACING.sm,
    },
    glowRing: {
        position: 'absolute',
        top: SPACING.sm,
        width: RING_SIZE + 40,
        height: RING_SIZE + 40,
        borderRadius: (RING_SIZE + 40) / 2,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 40,
        elevation: 0,
    },
    ringWrapper: {
        width: RING_SIZE,
        height: RING_SIZE,
        position: 'relative',
    },
    centerHub: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flipFace: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroValue: {
        fontSize: 52,
        fontWeight: '800',
        letterSpacing: -2,
    },
    labelPill: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 16,
        marginTop: 4,
    },
    labelText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tapHint: {
        fontSize: 11,
        marginTop: 8,
        opacity: 0.6,
    },
    splitStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -1,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    // Macro Rings Row
    macroRingsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: SPACING.lg,
        marginTop: SPACING.xl,
    },
    macroRingContainer: {
        alignItems: 'center',
    },
    macroRingCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16, // Offset for the label below
    },
    macroRingValue: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    macroRingUnit: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: -2,
    },
    macroRingLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 6,
    },
    statusBadge: {
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.pill,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
});

export default PlasmaRing;
