/**
 * RespirationCard - Respiratory rate and body temp deviation
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RespirationData } from '@/hooks/useHealthData';

interface Props {
    data: RespirationData;
    onPress?: () => void;
}

export const RespirationCard: React.FC<Props> = ({ data, onPress }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isElevated = data.tempDeviation > 0.3;

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        accent: '#3B82F6',
        warning: '#F97316',
    };

    const tempColor = isElevated ? colors.warning : colors.textSecondary;
    const tempSign = data.tempDeviation >= 0 ? '+' : '';

    const Container = onPress ? TouchableOpacity : View;
    
    return (
        <Container onPress={onPress} style={[styles.card, { backgroundColor: colors.bg }]}>
            <View style={styles.header}>
                <Ionicons name="pulse" size={18} color={colors.accent} />
                <Text style={[styles.label, { color: colors.textSecondary }]}>RESPIRATION</Text>
            </View>

            <View style={styles.mainRow}>
                <Text style={[styles.value, { color: colors.text }]}>{data.rpm}</Text>
                <Text style={[styles.unit, { color: colors.textSecondary }]}>rpm</Text>
            </View>

            {/* Temp Deviation */}
            <View style={[styles.tempBadge, { backgroundColor: isElevated ? `${colors.warning}15` : 'rgba(0,0,0,0.04)' }]}>
                <Ionicons name="thermometer-outline" size={14} color={tempColor} />
                <Text style={[styles.tempText, { color: tempColor }]}>
                    {tempSign}{data.tempDeviation.toFixed(1)}°C
                </Text>
            </View>
        </Container>
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
    mainRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
    },
    unit: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    tempBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    tempText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
