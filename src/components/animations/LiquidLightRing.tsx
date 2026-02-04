/**
 * LiquidLightRing - Macro Progress Ring with Comet Head
 * 
 * An enhanced progress ring where the leading tip has a
 * "Comet Head" - a glowing ball of light that leads the way.
 * Makes progress feel dynamic, like energy flowing through a wire.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ============================================================================
// TYPES
// ============================================================================

interface LiquidLightRingProps {
    progress: number; // 0-100
    consumed: number;
    target: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    showCometHead?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const LiquidLightRing: React.FC<LiquidLightRingProps> = ({
    progress,
    consumed,
    target,
    size = 280,
    strokeWidth = 14,
    color = '#FF5C00',
    showCometHead = true,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const strokeDashoffset = circumference * (1 - clampedProgress / 100);

    // Animation values
    const cometGlow = useSharedValue(1);
    const cometScale = useSharedValue(1);
    const ringGlow = useSharedValue(0.5);

    useEffect(() => {
        // Comet head pulsing glow
        cometGlow.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 800, easing: Easing.inOut(Easing.quad) }),
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            false
        );

        // Comet head scale pulse
        cometScale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 600, easing: Easing.out(Easing.quad) }),
                withTiming(1, { duration: 600, easing: Easing.in(Easing.quad) })
            ),
            -1,
            false
        );

        // Ring ambient glow
        ringGlow.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
                withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            false
        );
    }, []);

    // Calculate comet head position based on progress
    const angle = (clampedProgress / 100) * 2 * Math.PI - Math.PI / 2;
    const cometX = size / 2 + radius * Math.cos(angle);
    const cometY = size / 2 + radius * Math.sin(angle);

    const cometStyle = useAnimatedStyle(() => ({
        transform: [{ scale: cometScale.value }],
        opacity: cometGlow.value,
    }));

    const ringGlowStyle = useAnimatedStyle(() => ({
        opacity: ringGlow.value,
    }));

    const remaining = Math.max(0, target - consumed);
    const isOverTarget = consumed > target;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Ambient ring glow */}
            <Animated.View
                style={[
                    styles.ringGlow,
                    ringGlowStyle,
                    {
                        width: size + 40,
                        height: size + 40,
                        borderRadius: (size + 40) / 2,
                        backgroundColor: isOverTarget ? '#FF4757' : color,
                        shadowColor: isOverTarget ? '#FF4757' : color,
                    },
                ]}
            />

            {/* SVG Ring */}
            <Svg width={size} height={size} style={styles.svg}>
                <Defs>
                    <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <Stop offset="100%" stopColor={color} stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Background track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress arc */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#ringGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    rotation={-90}
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {/* Comet Head - Leading Glow */}
            {showCometHead && clampedProgress > 0 && (
                <Animated.View
                    style={[
                        styles.cometHead,
                        cometStyle,
                        {
                            left: cometX - 12,
                            top: cometY - 12,
                            backgroundColor: color,
                            shadowColor: color,
                        },
                    ]}
                >
                    {/* Inner bright core */}
                    <View style={styles.cometCore} />
                </Animated.View>
            )}

            {/* Center Content */}
            <View style={styles.centerContent}>
                <Text style={[styles.remainingText, { color: isOverTarget ? '#FF4757' : color }]}>
                    {isOverTarget ? '+' : ''}{remaining}
                </Text>
                <Text style={styles.remainingLabel}>
                    {isOverTarget ? 'over' : 'remaining'}
                </Text>
                <Text style={styles.calorieLabel}>kcal</Text>
            </View>

            {/* Progress percentage badge */}
            <View style={[styles.percentBadge, { backgroundColor: color }]}>
                <Text style={styles.percentText}>{Math.round(clampedProgress)}%</Text>
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
    svg: {
        position: 'absolute',
    },
    ringGlow: {
        position: 'absolute',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 40,
    },
    cometHead: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    cometCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFF',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    remainingText: {
        fontSize: 56,
        fontWeight: '800',
        letterSpacing: -3,
    },
    remainingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        marginTop: -4,
    },
    calorieLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    percentBadge: {
        position: 'absolute',
        bottom: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    percentText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default LiquidLightRing;
