/**
 * SleepCard - Sleep duration with mini stacked bar
 * Shows total sleep with Deep/REM/Light breakdown
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SleepData } from '@/hooks/useHealthData';
import { useCombinedTheme } from '@/src/design-system/theme';
import { COLORS } from '@/src/design-system/tokens';

interface Props {
    data: SleepData;
}

export const SleepCard: React.FC<Props> = ({ data }) => {
    const { colors: themeColors, isDark } = useCombinedTheme();
    const router = useRouter();

    // Use semantic sleep colors from the design system
    const sleepColors = {
        bg: themeColors.surface,
        text: themeColors.textPrimary,
        textSecondary: themeColors.textSecondary,
        deep: COLORS.semantic.sleep.dark,      // Deep sleep - darker purple
        rem: COLORS.semantic.sleep.light,      // REM - lighter purple
        light: `${COLORS.semantic.sleep.glow}60`, // Light sleep - subtle purple
    };
    // Use sleepColors for backwards compatibility
    const colors = sleepColors;

    const total = data.deepMinutes + data.remMinutes + data.lightMinutes;
    const deepPercent = (data.deepMinutes / total) * 100;
    const remPercent = (data.remMinutes / total) * 100;
    const lightPercent = (data.lightMinutes / total) * 100;

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.bg }]}
            onPress={() => router.push('/(tabs)/sleep')}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Ionicons name="moon" size={18} color={colors.deep} />
                <Text style={[styles.label, { color: colors.textSecondary }]}>SLEEP</Text>
            </View>

            <Text style={[styles.value, { color: colors.text }]}>{data.total}</Text>

            {/* Stacked Bar */}
            <View style={styles.barContainer}>
                <View style={[styles.barSegment, { width: `${deepPercent}%`, backgroundColor: colors.deep }]} />
                <View style={[styles.barSegment, { width: `${remPercent}%`, backgroundColor: colors.rem }]} />
                <View style={[styles.barSegment, { width: `${lightPercent}%`, backgroundColor: colors.light }]} />
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.deep }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{data.deep}</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.rem }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{data.rem}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
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
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
    },
    barContainer: {
        height: 8,
        borderRadius: 4,
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.05)',
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
        fontWeight: '500',
    },
});
