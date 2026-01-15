/**
 * OxygenCard - Blood oxygen (SpO2) readout
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    spo2: number;
}

export const OxygenCard: React.FC<Props> = ({ spo2 }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isOptimal = spo2 >= 95;
    const isNormal = spo2 >= 90;

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        optimal: '#22C55E',
        normal: '#F97316',
        low: '#EF4444',
    };

    const statusColor = isOptimal ? colors.optimal : isNormal ? colors.normal : colors.low;
    const statusText = isOptimal ? 'Optimal' : isNormal ? 'Normal' : 'Low';

    return (
        <View style={[styles.card, { backgroundColor: colors.bg }]}>
            <View style={styles.header}>
                <Ionicons name="water" size={18} color="#0EA5E9" />
                <Text style={[styles.label, { color: colors.textSecondary }]}>SpO2</Text>
            </View>

            <View style={styles.valueRow}>
                <Text style={[styles.value, { color: colors.text }]}>{spo2}</Text>
                <Text style={[styles.unit, { color: colors.textSecondary }]}>%</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
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
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    value: {
        fontSize: 32,
        fontWeight: '800',
    },
    unit: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
