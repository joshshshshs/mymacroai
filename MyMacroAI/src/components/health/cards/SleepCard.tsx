/**
 * SleepCard - Sleep duration with mini stacked bar
 * Shows total sleep with Deep/REM/Light breakdown
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SleepData } from '@/hooks/useHealthData';

interface Props {
    data: SleepData;
}

export const SleepCard: React.FC<Props> = ({ data }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        deep: '#6366F1',    // Indigo
        rem: '#8B5CF6',     // Purple
        light: '#A5B4FC',   // Light indigo
    };

    const total = data.deepMinutes + data.remMinutes + data.lightMinutes;
    const deepPercent = (data.deepMinutes / total) * 100;
    const remPercent = (data.remMinutes / total) * 100;
    const lightPercent = (data.lightMinutes / total) * 100;

    return (
        <View style={[styles.card, { backgroundColor: colors.bg }]}>
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
        </View>
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
