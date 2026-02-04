/**
 * MacroCapsule - Thick progress bar for macros
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface Props {
    label: string;
    current: number;
    goal: number;
    color: string;
}

export const MacroCapsule: React.FC<Props> = ({ label, current, goal, color }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const progress = useSharedValue(0);

    const percentage = Math.min(current / goal, 1);

    useEffect(() => {
        progress.value = withTiming(percentage, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });
    }, [percentage]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const colors = {
        bg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    };

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.values, { color: colors.text }]}>
                    {current}g <Text style={{ color: colors.textSecondary }}>/ {goal}g</Text>
                </Text>
            </View>

            <View style={[styles.track, { backgroundColor: colors.bg }]}>
                <Animated.View style={[styles.fill, { backgroundColor: color }, animatedStyle]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    values: {
        fontSize: 13,
        fontWeight: '700',
    },
    track: {
        height: 14,
        borderRadius: 7,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 7,
    },
});
