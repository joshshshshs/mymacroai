/**
 * RecoveryBattery - Hero section with animated recovery ring
 * Shows 0-100% score with HRV/RHR floating bubbles
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(score / 100, {
            duration: 1200,
            easing: Easing.out(Easing.cubic),
        });
    }, [score]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const recoveryColor = getRecoveryColor(score);
    const statusLabel = getRecoveryLabel(score);

    const colors = {
        bg: isDark ? '#1C1C1E' : '#FAFAFA',
        cardBg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        track: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
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
            style={[styles.container, { backgroundColor: colors.cardBg }]}
        >
            {/* Main Ring */}
            <View style={styles.ringContainer}>
                <Svg width={size} height={size}>
                    <Defs>
                        <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <Stop offset="0%" stopColor={recoveryColor} />
                            <Stop offset="100%" stopColor={recoveryColor} stopOpacity={0.7} />
                        </LinearGradient>
                    </Defs>

                    {/* Background Track */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.track}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />

                    {/* Animated Progress */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#ringGradient)"
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
                    <Text style={[styles.scoreValue, { color: recoveryColor }]}>{score}%</Text>
                    <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                        {statusLabel}
                    </Text>
                </View>
            </View>

            {/* Floating Bubbles */}
            <View style={styles.bubblesContainer}>
                {/* HRV Bubble */}
                <View style={[styles.bubble, { backgroundColor: colors.cardBg }]}>
                    <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>HRV</Text>
                    <View style={styles.bubbleValueRow}>
                        <Text style={[styles.bubbleValue, { color: colors.text }]}>{hrv}</Text>
                        <Text style={[styles.bubbleUnit, { color: colors.textSecondary }]}>ms</Text>
                        <Ionicons
                            name={getTrendIcon(hrvTrend) as any}
                            size={12}
                            color={getTrendColor(hrvTrend, true)}
                            style={styles.trendIcon}
                        />
                    </View>
                </View>

                {/* RHR Bubble */}
                <View style={[styles.bubble, { backgroundColor: colors.cardBg }]}>
                    <Text style={[styles.bubbleLabel, { color: colors.textSecondary }]}>RHR</Text>
                    <View style={styles.bubbleValueRow}>
                        <Text style={[styles.bubbleValue, { color: colors.text }]}>{rhr}</Text>
                        <Text style={[styles.bubbleUnit, { color: colors.textSecondary }]}>bpm</Text>
                        <Ionicons
                            name={getTrendIcon(rhrTrend) as any}
                            size={12}
                            color={getTrendColor(rhrTrend, false)}
                            style={styles.trendIcon}
                        />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
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
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -1,
    },
    statusLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    bubblesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 8,
    },
    bubble: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
        minWidth: 100,
    },
    bubbleLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    bubbleValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    bubbleValue: {
        fontSize: 22,
        fontWeight: '700',
    },
    bubbleUnit: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 2,
    },
    trendIcon: {
        marginLeft: 6,
    },
});
