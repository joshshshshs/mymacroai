/**
 * LiquidCalorieRing - "The Metabolic Engine" Hero
 * 
 * Features:
 * - Pulsing glow animation (2% scale every 3s)
 * - Color transitions (Fasted→Eating→Over)
 * - 3D flip toggle (Remaining ↔ Eaten/Burned)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';

// Color palette
const COLORS = {
    fastedBlue: '#00D2FF',
    fastedBlueDark: '#0099CC',
    eatingOrange: '#FF6B00',
    eatingOrangeDark: '#E55A00',
    overRed: '#FF4757',
    overRedDark: '#E63946',
    springGreen: '#00FF94',
    track: 'rgba(255, 255, 255, 0.08)',
    trackLight: 'rgba(0, 0, 0, 0.06)',
};

interface Props {
    consumed: number;
    target: number;
    burned: number;
    isFasted?: boolean;
}

const RING_SIZE = 260;
const RING_STROKE = 18;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedG = Animated.createAnimatedComponent(G);

export const LiquidCalorieRing: React.FC<Props> = ({
    consumed,
    target,
    burned,
    isFasted = false,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [showEaten, setShowEaten] = useState(false);

    // Calculate progress
    const remaining = Math.max(0, target - consumed);
    const progressRatio = Math.min(consumed / target, 1);
    const overEating = consumed > target;

    // Determine ring color based on state
    const getGradientColors = () => {
        if (overEating) return [COLORS.overRed, COLORS.overRedDark];
        if (isFasted) return [COLORS.fastedBlue, COLORS.fastedBlueDark];
        return [COLORS.eatingOrange, COLORS.eatingOrangeDark];
    };

    const gradientColors = getGradientColors();

    // Animated values
    const pulse = useSharedValue(1);
    const glow = useSharedValue(0.6);
    const flipRotate = useSharedValue(0);

    // Pulse animation (heartbeat)
    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
        glow.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    // Pulse style
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    // Glow style
    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: glow.value,
    }));

    // Flip animation
    const flipStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${flipRotate.value}deg` }],
    }));

    const handleFlip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        flipRotate.value = withSpring(showEaten ? 0 : 180, { damping: 15 });
        setShowEaten(!showEaten);
    };

    // Progress offset
    const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progressRatio);

    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';
    const trackColor = isDark ? COLORS.track : COLORS.trackLight;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.ringWrapper, pulseStyle, glowStyle, {
                shadowColor: gradientColors[0],
            }]}>
                <Svg width={RING_SIZE} height={RING_SIZE}>
                    <Defs>
                        <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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

                    {/* Progress */}
                    <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RING_RADIUS}
                        stroke="url(#ringGradient)"
                        strokeWidth={RING_STROKE}
                        strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                        fill="none"
                    />
                </Svg>

                {/* Center Content */}
                <TouchableOpacity
                    style={styles.centerContent}
                    onPress={handleFlip}
                    activeOpacity={0.8}
                >
                    <Animated.View style={[styles.flipContainer, flipStyle]}>
                        {!showEaten ? (
                            <View style={styles.centerText}>
                                <Text style={[styles.mainValue, { color: textColor }]}>
                                    {remaining.toLocaleString()}
                                </Text>
                                <Text style={[styles.mainLabel, { color: secondaryColor }]}>
                                    kcal left
                                </Text>
                                <Text style={[styles.tapHint, { color: secondaryColor }]}>
                                    Tap to flip
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.centerText}>
                                <View style={styles.splitRow}>
                                    <View style={styles.splitItem}>
                                        <Text style={[styles.splitValue, { color: COLORS.eatingOrange }]}>
                                            {consumed.toLocaleString()}
                                        </Text>
                                        <Text style={[styles.splitLabel, { color: secondaryColor }]}>
                                            Eaten
                                        </Text>
                                    </View>
                                    <View style={styles.splitDivider} />
                                    <View style={styles.splitItem}>
                                        <Text style={[styles.splitValue, { color: COLORS.springGreen }]}>
                                            {burned.toLocaleString()}
                                        </Text>
                                        <Text style={[styles.splitLabel, { color: secondaryColor }]}>
                                            Burned
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>

            {/* Status Badge */}
            {isFasted && (
                <View style={[styles.statusBadge, { backgroundColor: `${COLORS.fastedBlue}20` }]}>
                    <Text style={[styles.statusText, { color: COLORS.fastedBlue }]}>
                        ⚡ Fasted Mode
                    </Text>
                </View>
            )}
            {overEating && (
                <View style={[styles.statusBadge, { backgroundColor: `${COLORS.overRed}20` }]}>
                    <Text style={[styles.statusText, { color: COLORS.overRed }]}>
                        ⚠️ Over Target
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    ringWrapper: {
        width: RING_SIZE,
        height: RING_SIZE,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 30,
        elevation: 10,
    },
    centerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flipContainer: {
        backfaceVisibility: 'hidden',
    },
    centerText: {
        alignItems: 'center',
    },
    mainValue: {
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -2,
    },
    mainLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    tapHint: {
        fontSize: 11,
        marginTop: 8,
        opacity: 0.6,
    },
    splitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    splitItem: {
        alignItems: 'center',
    },
    splitValue: {
        fontSize: 28,
        fontWeight: '800',
    },
    splitLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    splitDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statusBadge: {
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.pill,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
});
