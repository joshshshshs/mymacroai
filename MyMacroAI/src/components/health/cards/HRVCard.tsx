/**
 * HRVCard - Heart Rate Variability Widget
 * Pink/red gradient with heartbeat pulse animation
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useCombinedTheme } from '@/src/design-system/theme';

interface Props {
    hrv: number;
    trend: 'up' | 'down' | 'stable';
    onPress?: () => void;
}

// Animated heart icon with pulse effect
const PulsingHeart = () => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        // Heartbeat rhythm: quick pulse, quick pulse, pause
        scale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 150, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
                withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
                withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
                withTiming(1, { duration: 600 }) // Pause between beats
            ),
            -1,
            false
        );

        // Glow effect
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 150 }),
                withTiming(0.3, { duration: 150 }),
                withTiming(0.5, { duration: 150 }),
                withTiming(0.3, { duration: 750 })
            ),
            -1,
            false
        );
    }, []);

    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.heartContainer}>
            <Animated.View style={[styles.heartGlow, glowStyle]} />
            <Animated.View style={heartStyle}>
                <Ionicons name="heart" size={16} color="#FFFFFF" />
            </Animated.View>
        </View>
    );
};

export const HRVCard: React.FC<Props> = ({ hrv, trend, onPress }) => {
    const { isDark } = useCombinedTheme();

    // HRV interpretation
    const getInterpretation = (value: number) => {
        if (value >= 50) return { text: 'Good', color: '#22C55E' };
        if (value >= 30) return { text: 'Fair', color: '#F97316' };
        return { text: 'Low', color: '#EF4444' };
    };

    const interpretation = getInterpretation(hrv);

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return { name: 'arrow-up' as const, color: '#22C55E' };
            case 'down':
                return { name: 'arrow-down' as const, color: '#EF4444' };
            default:
                return { name: 'remove' as const, color: '#9CA3AF' };
        }
    };

    const trendInfo = getTrendIcon();

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <LinearGradient
                colors={isDark
                    ? ['#4A1942', '#DC2626', '#EF4444']
                    : ['#FCA5A5', '#F87171', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <PulsingHeart />
                    </View>
                    <Text style={styles.label}>HRV</Text>
                </View>

                {/* Value with trend */}
                <View style={styles.valueRow}>
                    <Text style={styles.value}>{hrv}</Text>
                    <Text style={styles.unit}>ms</Text>
                    <View style={styles.trendBadge}>
                        <Ionicons name={trendInfo.name} size={12} color={trendInfo.color} />
                    </View>
                </View>

                {/* Status badge */}
                <View style={[styles.statusBadge, { backgroundColor: `${interpretation.color}30` }]}>
                    <View style={[styles.statusDot, { backgroundColor: interpretation.color }]} />
                    <Text style={styles.statusText}>{interpretation.text}</Text>
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
        shadowColor: '#EF4444',
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
    heartContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heartGlow: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF6B8E',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.8)',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    value: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    unit: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 2,
        color: 'rgba(255,255,255,0.8)',
    },
    trendBadge: {
        marginLeft: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
