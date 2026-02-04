/**
 * OxygenCard - Premium SpO2 Widget
 * Blue gradient with floating bubble effect
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { useCombinedTheme } from '@/src/design-system/theme';

interface Props {
    spo2: number;
    onPress?: () => void;
}

// Mini floating bubble
const MiniBubble = ({ delay = 0, size = 6, left = 10 }: { delay?: number; size?: number; left?: number }) => {
    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(-20, { duration: 3000, easing: Easing.out(Easing.ease) }),
                -1,
                false
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withTiming(0.6, { duration: 1500 }),
                -1,
                true
            )
        );
    }, []);

    const bubbleStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.bubble,
                { width: size, height: size, borderRadius: size / 2, left },
                bubbleStyle,
            ]}
        />
    );
};

export const OxygenCard: React.FC<Props> = ({ spo2, onPress }) => {
    const { isDark } = useCombinedTheme();

    const isOptimal = spo2 >= 95;
    const isNormal = spo2 >= 90;

    const statusColor = isOptimal ? '#22C55E' : isNormal ? '#F97316' : '#EF4444';
    const statusText = isOptimal ? 'Optimal' : isNormal ? 'Normal' : 'Low';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <LinearGradient
                colors={isDark
                    ? ['#1E3A5F', '#2563EB', '#3B82F6']
                    : ['#3B82F6', '#60A5FA', '#93C5FD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Floating bubbles */}
                <MiniBubble delay={0} size={8} left={20} />
                <MiniBubble delay={800} size={5} left={60} />
                <MiniBubble delay={1600} size={6} left={100} />

                <View style={styles.header}>
                    <View style={styles.iconBg}>
                        <Ionicons name="water" size={14} color="#FFFFFF" />
                    </View>
                    <Text style={styles.label}>SpO2</Text>
                </View>

                <View style={styles.valueRow}>
                    <Text style={styles.value}>{spo2}</Text>
                    <Text style={styles.unit}>%</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}30` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={styles.statusText}>{statusText}</Text>
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
        shadowColor: '#3B82F6',
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
    bubble: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.4)',
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
