/**
 * CaloriesWidget - Nutrition progress block for Bevel grid
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SPACING } from '@/src/design-system/tokens';
import { useUserStore, useAdjustedDailyTarget } from '@/src/store/UserStore';

export const CaloriesWidget: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { currentIntake } = useUserStore();
    const adjustedTarget = useAdjustedDailyTarget();

    const current = currentIntake.calories;
    const target = adjustedTarget.calories;
    const percentage = Math.min((current / target) * 100, 100);

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const trackColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={[styles.label, { color: secondaryColor }]}>NUTRITION</Text>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
                <View
                    style={[styles.progressFill, { width: `${percentage}%` }]}
                />
            </View>

            {/* Macros */}
            <View style={styles.macroRow}>
                <MacroPill label="P" value={`${currentIntake.protein}g`} color="#10B981" />
                <MacroPill label="C" value={`${currentIntake.carbs}g`} color="#F59E0B" />
                <MacroPill label="F" value={`${currentIntake.fats}g`} color="#8B5CF6" />
            </View>

            <Text style={[styles.value, { color: textColor }]}>
                {current} / {target}
            </Text>
        </View>
    );
};

const MacroPill: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

    return (
        <View style={styles.pill}>
            <View style={[styles.pillDot, { backgroundColor: color }]} />
            <Text style={[styles.pillText, { color: textColor }]}>{label} {value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 32,
        padding: SPACING.lg,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: SPACING.sm,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 4,
    },
    macroRow: {
        flexDirection: 'row',
        gap: 12,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pillDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    pillText: {
        fontSize: 11,
        fontFamily: 'monospace',
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -1,
    },
});
