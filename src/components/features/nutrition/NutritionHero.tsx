import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';

interface MacroHeroProps {
    calories: {
        current: number;
        target: number;
    };
    macros: {
        protein: { current: number; total: number };
        carbs: { current: number; total: number };
        fats: { current: number; total: number };
    };
}

export const NutritionHero: React.FC<MacroHeroProps> = ({ calories, macros }) => {

    const renderBar = (label: string, current: number, total: number, color: string) => {
        const percent = Math.min((current / total) * 100, 100);
        return (
            <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>{label}</Text>
                <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${percent}%`, backgroundColor: color }]} />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <SoftGlassCard variant="soft" style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.title}>Today's Intake</Text>
                    {/* Optional: 'Edit Targets' icon could go here */}
                </View>

                <View style={styles.mainStats}>
                    <Text style={styles.kcalValue}>
                        1,650 <Text style={styles.kcalUnit}>kcal</Text>
                    </Text>

                    <Text style={styles.macroSummary}>
                        130P / 140C / 45F
                    </Text>

                    <Text style={styles.remainingText}>
                        Remaining: 50P / 110C / 35F
                    </Text>
                </View>

                <View style={styles.barsSection}>
                    {renderBar('Protein', macros.protein.current, macros.protein.total, '#F97316')}
                    {renderBar('Carbs', macros.carbs.current, macros.carbs.total, '#3B82F6')}
                    {renderBar('Fats', macros.fats.current, macros.fats.total, '#10B981')}
                </View>
            </SoftGlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    card: {
        padding: 24, // increased padding for breathing room
    },
    header: {
        marginBottom: 16,
    },
    title: {
        color: '#94A3B8', // Muted slate
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    mainStats: {
        marginBottom: 28,
    },
    kcalValue: {
        color: '#F8FAFC',
        fontSize: 42, // Larger, thin hero text
        fontWeight: '700', // actually bold for impact, per mockup
        letterSpacing: -1,
        marginBottom: 2,
    },
    kcalUnit: {
        fontSize: 20,
        fontWeight: '500',
        color: '#64748B',
    },
    macroSummary: {
        color: '#E2E8F0', // Cleaner white/grey
        fontSize: 15,
        fontWeight: '600',
        opacity: 0.9,
        marginBottom: 4,
    },
    remainingText: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    barsSection: {
        gap: 12,
    },
    macroRow: {
        gap: 6,
    },
    macroLabel: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '500',
    },
    barContainer: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    }
});
