/**
 * StressCard - Premium Stress Widget
 * Purple zen gradient with ripple effect
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { StressLevel } from '@/hooks/useHealthData';
import { useCombinedTheme } from '@/src/design-system/theme';

interface Props {
    level: StressLevel;
    history: number[];
    onPress?: () => void;
}

export const StressCard: React.FC<Props> = ({ level, history, onPress }) => {
    const { isDark } = useCombinedTheme();

    // Calm breathing animation
    const breathe = useSharedValue(0);

    useEffect(() => {
        breathe.value = withRepeat(
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => {
        const scale = interpolate(breathe.value, [0, 1], [0.9, 1.1]);
        const opacity = interpolate(breathe.value, [0, 0.5, 1], [0.3, 0.5, 0.3]);
        return { transform: [{ scale }], opacity };
    });

    const stressColors = {
        low: { bg: ['#065F46', '#10B981', '#34D399'], color: '#10B981', emoji: '😌' },
        moderate: { bg: ['#92400E', '#F97316', '#FB923C'], color: '#F97316', emoji: '😐' },
        high: { bg: ['#7C2D12', '#EF4444', '#F87171'], color: '#EF4444', emoji: '😰' },
    };

    const config = stressColors[level];
    const stressLabel = level.charAt(0).toUpperCase() + level.slice(1);

    // Generate wave path from history
    const width = 140;
    const height = 35;
    const points = history.slice(-12);

    const generatePath = () => {
        if (points.length < 2) return '';

        const stepX = width / (points.length - 1);
        const maxY = Math.max(...points, 50);

        let path = `M 0 ${height - (points[0] / maxY) * height}`;

        for (let i = 1; i < points.length; i++) {
            const x = i * stepX;
            const y = height - (points[i] / maxY) * height;
            const prevX = (i - 1) * stepX;
            const prevY = height - (points[i - 1] / maxY) * height;
            const cpX = (prevX + x) / 2;
            path += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
        }

        return path;
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <LinearGradient
                colors={isDark
                    ? ['#3B1F4D', '#7C3AED', '#9333EA']
                    : ['#9333EA', '#A855F7', '#C084FC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Zen pulse effect */}
                <Animated.View style={[styles.zenPulse, pulseStyle]} />

                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Text style={styles.emoji}>{config.emoji}</Text>
                    </View>
                    <Text style={styles.label}>STRESS</Text>
                </View>

                <View style={styles.levelRow}>
                    <Text style={styles.value}>{stressLabel}</Text>
                </View>

                {/* Wave Line */}
                <View style={styles.chartContainer}>
                    <Svg width={width} height={height}>
                        <Defs>
                            <SvgGradient id="stressWave" x1="0%" y1="0%" x2="100%" y2="0%">
                                <Stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                                <Stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
                            </SvgGradient>
                        </Defs>
                        <Path
                            d={generatePath()}
                            stroke="url(#stressWave)"
                            strokeWidth={2.5}
                            fill="none"
                            strokeLinecap="round"
                        />
                    </Svg>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },
    gradient: {
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    zenPulse: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    iconBg: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 12,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.8)',
    },
    levelRow: {
        marginBottom: 8,
    },
    value: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    chartContainer: {
        marginTop: 4,
    },
});
