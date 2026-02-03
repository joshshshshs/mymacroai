/**
 * SleepCard - Premium Sleep Widget
 * Indigo/purple gradient with moon glow effect
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { SleepData } from '@/hooks/useHealthData';
import { useCombinedTheme } from '@/src/design-system/theme';

interface Props {
    data: SleepData;
}

export const SleepCard: React.FC<Props> = ({ data }) => {
    const { colors: themeColors, isDark } = useCombinedTheme();
    const router = useRouter();

    // Moon glow animation
    const glowOpacity = useSharedValue(0.4);

    useEffect(() => {
        glowOpacity.value = withRepeat(
            withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const total = data.deepMinutes + data.remMinutes + data.lightMinutes;
    const deepPercent = (data.deepMinutes / total) * 100;
    const remPercent = (data.remMinutes / total) * 100;
    const lightPercent = (data.lightMinutes / total) * 100;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/(tabs)/sleep')}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={isDark
                    ? ['#1E1B4B', '#312E81', '#4338CA']
                    : ['#4338CA', '#6366F1', '#818CF8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Moon glow */}
                <Animated.View style={[styles.moonGlow, glowStyle]} />

                <View style={styles.header}>
                    <Ionicons name="moon" size={18} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.label}>SLEEP</Text>
                </View>

                <Text style={styles.value}>{data.total}</Text>

                {/* Stacked Bar */}
                <View style={styles.barContainer}>
                    <View style={[styles.barSegment, { width: `${deepPercent}%`, backgroundColor: '#1E1B4B' }]} />
                    <View style={[styles.barSegment, { width: `${remPercent}%`, backgroundColor: '#7C3AED' }]} />
                    <View style={[styles.barSegment, { width: `${lightPercent}%`, backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#1E1B4B' }]} />
                        <Text style={styles.legendText}>{data.deep}</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#7C3AED' }]} />
                        <Text style={styles.legendText}>{data.rem}</Text>
                    </View>
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
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },
    gradient: {
        padding: 16,
        position: 'relative',
    },
    moonGlow: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(167, 139, 250, 0.4)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.8)',
    },
    value: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    barContainer: {
        height: 8,
        borderRadius: 4,
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    barSegment: {
        height: '100%',
    },
    legend: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legendText: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
});
