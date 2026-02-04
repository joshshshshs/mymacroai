import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';

interface MacroBreakdownCardProps {
    protein: { current: number; target: number };
    carbs: { current: number; target: number };
    fats: { current: number; target: number };
}

export const MacroBreakdownCard: React.FC<MacroBreakdownCardProps> = ({ protein, carbs, fats }) => {
    const MacroRow = ({
        label,
        current,
        target,
        color
    }: {
        label: string;
        current: number;
        target: number;
        color: string
    }) => (
        <View style={styles.macroRow}>
            <View style={styles.macroLabel}>
                <View style={[styles.macroDot, { backgroundColor: color }]} />
                <ThemedText variant="caption" style={styles.macroName}>{label}</ThemedText>
            </View>
            <View style={styles.macroValues}>
                <ThemedText variant="body" style={[styles.macroValue, { color }]}>{current}g</ThemedText>
                <ThemedText variant="caption" style={styles.macroTarget}>/ {target}g</ThemedText>
            </View>
            <View style={styles.macroBar}>
                <View style={[styles.macroBarFill, { width: `${Math.min((current / target) * 100, 100)}%`, backgroundColor: color }]} />
            </View>
        </View>
    );

    return (
        <SoftGlassCard variant="soft" style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="pie-chart" size={18} color="#FFF" />
                <ThemedText variant="label" style={styles.label}>MACRO BREAKDOWN</ThemedText>
            </View>
            <MacroRow label="Protein" current={protein.current} target={protein.target} color={PASTEL_COLORS.accents.softOrange} />
            <MacroRow label="Carbs" current={carbs.current} target={carbs.target} color={PASTEL_COLORS.accents.softBlue} />
            <MacroRow label="Fats" current={fats.current} target={fats.target} color="#10B981" />
        </SoftGlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    label: {
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '700',
        letterSpacing: 1,
        fontSize: 10,
    },
    macroRow: {
        marginBottom: 12,
    },
    macroLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    macroName: {
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontSize: 11,
    },
    macroValues: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 6,
    },
    macroValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    macroTarget: {
        color: 'rgba(255,255,255,0.4)',
    },
    macroBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    macroBarFill: {
        height: '100%',
        borderRadius: 2,
    }
});
