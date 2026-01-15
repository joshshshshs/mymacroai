/**
 * StrainWidget - Activity/Strain tracking block for Bevel grid
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '@/src/design-system/tokens';

export const StrainWidget: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Mock data - connect to activity store later
    const strainScore = 12.4;
    const maxStrain = 21;
    const status = 'Moderate';

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const accentColor = '#F59E0B'; // Amber for strain

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: secondaryColor }]}>STRAIN</Text>
                <Ionicons name="flash" size={16} color={accentColor} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.value, { color: textColor }]}>
                    {strainScore}
                    <Text style={[styles.unit, { color: secondaryColor }]}>/{maxStrain}</Text>
                </Text>
                <Text style={[styles.status, { color: accentColor }]}>{status}</Text>
            </View>
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
    value: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -1,
    },
    unit: {
        fontSize: 14,
        fontWeight: '400',
    },
    status: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
});
