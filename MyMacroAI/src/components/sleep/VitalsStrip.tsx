/**
 * VitalsStrip - Horizontal biometrics display
 * Shows RHR, HRV, and Respiratory Rate
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

interface VitalsStripProps {
    rhr?: number;      // Resting heart rate (bpm)
    hrv?: number;      // Heart rate variability (ms)
    respRate?: number; // Respiratory rate (rpm)
}

export const VitalsStrip: React.FC<VitalsStripProps> = ({
    rhr = 42,
    hrv = 115,
    respRate = 14,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280',
        heart: '#EF4444',
        hrv: '#8B5CF6',
        breath: '#06B6D4',
    };

    const vitals = [
        {
            label: 'RHR',
            value: rhr,
            unit: 'bpm',
            icon: 'heart' as const,
            color: colors.heart,
            subtitle: 'Lowest'
        },
        {
            label: 'HRV',
            value: hrv,
            unit: 'ms',
            icon: 'pulse' as const,
            color: colors.hrv,
            subtitle: 'Average'
        },
        {
            label: 'RESP',
            value: respRate,
            unit: 'rpm',
            icon: 'cloud' as const,
            color: colors.breath,
            subtitle: 'Rate'
        },
    ];

    return (
        <LinearGradient
            colors={isDark
                ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']
                : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {vitals.map((vital, index) => (
                <React.Fragment key={vital.label}>
                    <View style={styles.vitalItem}>
                        <View style={[styles.iconContainer, { backgroundColor: `${vital.color}15` }]}>
                            <Ionicons name={vital.icon} size={16} color={vital.color} />
                        </View>
                        <View style={styles.vitalContent}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                {vital.label}
                            </Text>
                            <View style={styles.valueRow}>
                                <Text style={[styles.value, { color: colors.text }]}>{vital.value}</Text>
                                <Text style={[styles.unit, { color: colors.textSecondary }]}>{vital.unit}</Text>
                            </View>
                        </View>
                    </View>
                    {index < vitals.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
            ))}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    vitalItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        justifyContent: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vitalContent: {
        alignItems: 'flex-start',
    },
    label: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    value: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    unit: {
        fontSize: 10,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
});

export default VitalsStrip;
