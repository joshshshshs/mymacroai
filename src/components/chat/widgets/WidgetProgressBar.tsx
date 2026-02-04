/**
 * WidgetProgressBar - Animated progress bar for goals
 * Shows current vs target with percentage
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { WidgetExportButton } from './WidgetExportButton';

interface ProgressBarData {
    label: string;
    current: number;
    target: number;
    unit: string;
}

interface Props {
    data: ProgressBarData;
}

export const WidgetProgressBar: React.FC<Props> = ({ data }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { label, current, target, unit } = data;
    const percentage = Math.min((current / target) * 100, 100);
    const isComplete = percentage >= 100;

    const animatedWidth = useSharedValue(0);

    useEffect(() => {
        animatedWidth.value = withTiming(percentage, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });
    }, [percentage]);

    const animatedBarStyle = useAnimatedStyle(() => ({
        width: `${animatedWidth.value}%`,
    }));

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FAFAF8',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        track: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
        fill: isComplete ? '#4CAF50' : '#FF6B35', // Green when complete, orange otherwise
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <WidgetExportButton data={data} type="PROGRESS_BAR" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.percentage, { color: colors.fill }]}>
                    {Math.round(percentage)}%
                </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.track, { backgroundColor: colors.track }]}>
                <Animated.View style={[styles.fill, { backgroundColor: colors.fill }, animatedBarStyle]} />
            </View>

            {/* Values */}
            <View style={styles.values}>
                <Text style={[styles.current, { color: colors.text }]}>
                    {current}{unit}
                </Text>
                <Text style={[styles.target, { color: colors.textSecondary }]}>
                    / {target}{unit}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginTop: 8,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
    },
    percentage: {
        fontSize: 16,
        fontWeight: '800',
    },
    track: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 10,
    },
    fill: {
        height: '100%',
        borderRadius: 5,
    },
    values: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    current: {
        fontSize: 20,
        fontWeight: '800',
    },
    target: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
});
