/**
 * LiquidCalorieRing - Hero ring with wave animation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, ClipPath, Rect, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    withRepeat,
    Easing,
    interpolate,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { useHaptics } from '@/hooks/useHaptics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = Math.min(220, SCREEN_WIDTH - 80);
const STROKE_WIDTH = 20;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
    eaten: number;
    goal: number;
    burned: number;
}

type CenterView = 'remaining' | 'breakdown';

export const LiquidCalorieRing: React.FC<Props> = ({ eaten, goal, burned }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();
    const [centerView, setCenterView] = useState<CenterView>('remaining');

    const progress = useSharedValue(0);
    const wave = useSharedValue(0);

    const remaining = Math.max(0, goal - eaten);
    const percentage = Math.min(eaten / goal, 1);

    useEffect(() => {
        progress.value = withTiming(percentage, {
            duration: 1000,
            easing: Easing.out(Easing.cubic),
        });

        wave.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, [percentage]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    }));

    const waveStyle = useAnimatedStyle(() => {
        const translateY = interpolate(wave.value, [0, 1], [-3, 3]);
        return {
            transform: [{ translateY }],
        };
    });

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        track: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        accent: '#FF5C00',
    };

    const toggleCenter = () => {
        light();
        setCenterView(prev => prev === 'remaining' ? 'breakdown' : 'remaining');
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.bg }]}
            onPress={toggleCenter}
            activeOpacity={0.9}
        >
            {/* Ring */}
            <Animated.View style={waveStyle}>
                <Svg width={RING_SIZE} height={RING_SIZE}>
                    <Defs>
                        <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor="#FF5C00" />
                            <Stop offset="100%" stopColor="#FF8C42" />
                        </LinearGradient>
                    </Defs>

                    {/* Track */}
                    <Circle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RADIUS}
                        stroke={colors.track}
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                    />

                    {/* Progress */}
                    <AnimatedCircle
                        cx={RING_SIZE / 2}
                        cy={RING_SIZE / 2}
                        r={RADIUS}
                        stroke="url(#ringGradient)"
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        animatedProps={animatedProps}
                        rotation={-90}
                        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                    />
                </Svg>
            </Animated.View>

            {/* Center Content */}
            <View style={styles.centerContent}>
                {centerView === 'remaining' ? (
                    <>
                        <Text style={[styles.bigNumber, { color: colors.text }]}>
                            {remaining.toLocaleString()}
                        </Text>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Remaining</Text>
                    </>
                ) : (
                    <>
                        <Text style={[styles.breakdownNumber, { color: colors.accent }]}>
                            {eaten.toLocaleString()}
                        </Text>
                        <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                            Eaten / {burned.toLocaleString()} Burned
                        </Text>
                    </>
                )}
                <Text style={[styles.tapHint, { color: colors.textSecondary }]}>Tap to toggle</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
    },
    bigNumber: {
        fontSize: 42,
        fontWeight: '800',
        letterSpacing: -1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    breakdownNumber: {
        fontSize: 36,
        fontWeight: '800',
    },
    breakdownLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
    tapHint: {
        fontSize: 10,
        marginTop: 8,
        opacity: 0.5,
    },
});
