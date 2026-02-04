/**
 * HeartRateWidget - Heart rate tracking block for Bevel grid
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '@/src/design-system/tokens';

export const HeartRateWidget: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Mock data - connect to health store later
    const currentHR = 72;
    const restingHR = 58;
    const trend: 'up' | 'down' | 'stable' = 'stable';

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const accentColor = '#F472B6'; // Pink for heart

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: secondaryColor }]}>HEART RATE</Text>
                <Ionicons name="heart" size={16} color={accentColor} />
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <View style={styles.metric}>
                        <Text style={[styles.value, { color: textColor }]}>
                            {currentHR}
                            <Text style={[styles.unit, { color: secondaryColor }]}> bpm</Text>
                        </Text>
                        <Text style={[styles.subtitle, { color: secondaryColor }]}>Current</Text>
                    </View>

                    <View style={styles.metric}>
                        <Text style={[styles.smallValue, { color: textColor }]}>
                            {restingHR}
                            <Text style={[styles.unit, { color: secondaryColor }]}> bpm</Text>
                        </Text>
                        <Text style={[styles.subtitle, { color: secondaryColor }]}>Resting</Text>
                    </View>
                </View>

                <View style={styles.trendRow}>
                    <Ionicons
                        name={getTrendIcon(trend)}
                        size={14}
                        color={trend === 'stable' ? secondaryColor : accentColor}
                    />
                    <Text style={[styles.trendText, { color: secondaryColor }]}>
                        {getTrendText(trend)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

// Helper functions to avoid TypeScript narrowing issues
const getTrendIcon = (trend: 'up' | 'down' | 'stable'): 'trending-up' | 'trending-down' | 'remove' => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
};

const getTrendText = (trend: 'up' | 'down' | 'stable'): string => {
    if (trend === 'up') return 'Elevated';
    if (trend === 'down') return 'Below avg';
    return 'Stable';
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    content: {
        marginTop: 'auto',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    metric: {},
    value: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -1,
    },
    smallValue: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    unit: {
        fontSize: 12,
        fontWeight: '400',
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '400',
        marginTop: 2,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: SPACING.sm,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '400',
    },
});
