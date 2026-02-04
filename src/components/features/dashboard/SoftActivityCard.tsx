import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { ThemedText } from '../../ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '@/src/design-system/tokens';

interface ActivityMetric {
    id: string;
    label: string;
    value: string;
    unit: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const METRICS: ActivityMetric[] = [
    { id: 'steps', label: 'Steps', value: '8,432', unit: '/ 10k', icon: 'footsteps', color: '#10B981' },
    { id: 'distance', label: 'Distance', value: '4.2', unit: 'km', icon: 'location', color: '#3B82F6' },
    { id: 'floors', label: 'Floors', value: '12', unit: 'climb', icon: 'layers', color: '#8B5CF6' },
];

export const SoftActivityCard: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const textColor = isDark ? '#FFFFFF' : '#000000';

    return (
        <SoftGlassCard variant="soft" style={styles.container}>
            <View style={styles.header}>
                <ThemedText variant="label" style={[styles.title, { color: secondaryColor }]}>ACTIVITY</ThemedText>
            </View>

            <View style={styles.grid}>
                {METRICS.map((metric, index) => (
                    <View key={metric.id} style={styles.item}>
                        <View style={[styles.iconBox, { backgroundColor: `${metric.color}20` }]}>
                            <Ionicons name={metric.icon} size={20} color={metric.color} />
                        </View>
                        <View style={styles.info}>
                            <View style={styles.valueRow}>
                                <ThemedText style={[styles.value, { color: textColor }]}>{metric.value}</ThemedText>
                                <ThemedText style={{ color: secondaryColor, fontSize: 12 }}>{metric.unit}</ThemedText>
                            </View>
                            <ThemedText style={{ color: secondaryColor, fontSize: 12 }}>{metric.label}</ThemedText>
                        </View>
                        {index < METRICS.length - 1 && (
                            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
                        )}
                    </View>
                ))}
            </View>
        </SoftGlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.md,
    },
    title: {
        fontWeight: '700',
        letterSpacing: 1,
        fontSize: 10,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    info: {
        alignItems: 'center',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
        marginBottom: 2,
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
    },
    divider: {
        position: 'absolute',
        right: 0,
        top: 10,
        bottom: 10,
        width: 1,
    }
});
