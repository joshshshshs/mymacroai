/**
 * RecoveryBattery - Premium Hero Section
 * Animated recovery ring with gradient glow and floating HRV/RHR bubbles
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    Easing,
    FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { getRecoveryColor, getRecoveryLabel } from '@/hooks/useHealthData';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
    score: number;
    hrv: number;
    hrvTrend: 'up' | 'down' | 'stable';
    rhr: number;
    rhrTrend: 'up' | 'down' | 'stable';
}

export const RecoveryBattery: React.FC<Props> = ({
    score,
    hrv,
    hrvTrend,
    rhr,
    rhrTrend,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const size = 220;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress = useSharedValue(0);
    const glowOpacity = useSharedValue(0.3);

    useEffect(() => {
        progress.value = withTiming(score / 100, {
            duration: 1200,
            easing: Easing.out(Easing.cubic),
        });
        glowOpacity.value = withRepeat(
            withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, [score]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const recoveryColor = getRecoveryColor(score);
    const statusLabel = getRecoveryLabel(score);

    // Determine gradient colors based on score
    const getGradientColors = (): readonly [string, string, string] => {
        if (score >= 70) return isDark
            ? ['#052E16', '#166534', '#22C55E'] as const
            : ['#22C55E', '#4ADE80', '#86EFAC'] as const;
        if (score >= 40) return isDark
            ? ['#431407', '#C2410C', '#EA580C'] as const
            : ['#F97316', '#FB923C', '#FDBA74'] as const;
        return isDark
            ? ['#450A0A', '#B91C1C', '#EF4444'] as const
            : ['#EF4444', '#F87171', '#FCA5A5'] as const;
    };

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        track: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        cardBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return 'arrow-up';
            case 'down': return 'arrow-down';
            default: return 'remove';
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodUp: boolean) => {
        if (trend === 'stable') return colors.textSecondary;
        const isGood = (trend === 'up') === isGoodUp;
        return isGood ? '#22C55E' : '#EF4444';
    };

    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.container}
        >
            <ExpoGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Ambient glow */}
                <Animated.View style={[styles.ambientGlow, glowStyle]} />

                {/* Main Ring */}
                <View style={styles.ringContainer}>
                    <Svg width={size} height={size}>
                        <Defs>
                            <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
                                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.6} />
                            </LinearGradient>
                        </Defs>

                        {/* Background Track */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />

                        {/* Animated Progress */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#ringGrad)"
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            animatedProps={animatedProps}
                            rotation={-90}
                            origin={`${size / 2}, ${size / 2}`}
                        />
                    </Svg>

                    {/* Center Content */}
                    <View style={styles.centerContent}>
                        <Text style={styles.scoreValue}>{score}%</Text>
                        <Text style={styles.statusLabel}>{statusLabel}</Text>
                    </View>
                </View>

                {/* Floating Bubbles */}
                <View style={styles.bubblesContainer}>
                    {/* HRV Bubble */}
                    <BlurView intensity={isDark ? 30 : 60} style={styles.bubble}>
                        <Text style={styles.bubbleLabel}>HRV</Text>
                        <View style={styles.bubbleValueRow}>
                            <Text style={styles.bubbleValue}>{hrv}</Text>
                            <Text style={styles.bubbleUnit}>ms</Text>
                            <Ionicons
                                name={getTrendIcon(hrvTrend) as any}
                                size={14}
                                color={getTrendColor(hrvTrend, true)}
                                style={styles.trendIcon}
                            />
                        </View>
                    </BlurView>

                    {/* RHR Bubble */}
                    <BlurView intensity={isDark ? 30 : 60} style={styles.bubble}>
                        <Text style={styles.bubbleLabel}>RHR</Text>
                        <View style={styles.bubbleValueRow}>
                            <Text style={styles.bubbleValue}>{rhr}</Text>
                            <Text style={styles.bubbleUnit}>bpm</Text>
                            <Ionicons
                                name={getTrendIcon(rhrTrend) as any}
                                size={14}
                                color={getTrendColor(rhrTrend, false)}
                                style={styles.trendIcon}
                            />
                        </View>
                    </BlurView>
                </View>
            </ExpoGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    gradient: {
        padding: 24,
        alignItems: 'center',
        position: 'relative',
    },
    ambientGlow: {
        position: 'absolute',
        top: -50,
        left: '50%',
        marginLeft: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    ringContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerContent: {
        position: 'absolute',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 52,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -2,
    },
    statusLabel: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 4,
        color: 'rgba(255,255,255,0.8)',
    },
    bubblesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        gap: 12,
    },
    bubble: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bubbleLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
        color: 'rgba(255,255,255,0.7)',
    },
    bubbleValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    bubbleValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    bubbleUnit: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 3,
        color: 'rgba(255,255,255,0.7)',
    },
    trendIcon: {
        marginLeft: 6,
    },
});
