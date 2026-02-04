import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { ThemedText } from '../../ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';
import { useUserStore, useHealthMetrics, useAdjustedDailyTarget } from '@/src/store/UserStore';

export const ContextRow: React.FC = () => {
    const { currentIntake } = useUserStore();
    const adjustedTarget = useAdjustedDailyTarget();
    const metrics = useHealthMetrics();

    // Nutrition Data (Real from store)
    const caloriesConsumed = currentIntake.calories;
    const caloriesTarget = adjustedTarget.calories;

    // Training/Activity (Placeholder until HealthKit integration)
    const activeMinutes = metrics.stressLevel ? Math.round(metrics.stressLevel * 6) : 0; // Proxy calculation

    return (
        <View style={styles.container}>
            {/* Card 1: Nutrition */}
            <SoftGlassCard variant="soft" style={styles.card}>
                <View style={styles.header}>
                    <Ionicons name="nutrition" size={18} color={PASTEL_COLORS.accents.softOrange} />
                    <ThemedText variant="label" style={styles.label}>NUTRITION</ThemedText>
                </View>
                <ThemedText variant="h2" style={styles.heroValue}>
                    {caloriesConsumed.toLocaleString()}
                </ThemedText>
                <ThemedText variant="caption" style={styles.subValue}>
                    of {caloriesTarget.toLocaleString()} kcal
                </ThemedText>
                {/* Mini Progress Bar */}
                <View style={styles.progressBar}>
                    <View style={[
                        styles.progressFill,
                        {
                            width: `${Math.min((caloriesConsumed / caloriesTarget) * 100, 100)}%`,
                            backgroundColor: PASTEL_COLORS.accents.softOrange
                        }
                    ]} />
                </View>
            </SoftGlassCard>

            {/* Card 2: Training */}
            <SoftGlassCard variant="soft" style={styles.card}>
                <View style={styles.header}>
                    <Ionicons name="barbell" size={18} color={PASTEL_COLORS.accents.softBlue} />
                    <ThemedText variant="label" style={styles.label}>TRAINING</ThemedText>
                </View>
                <ThemedText variant="h2" style={[styles.heroValue, { color: PASTEL_COLORS.accents.softBlue }]}>
                    {activeMinutes}
                </ThemedText>
                <ThemedText variant="caption" style={styles.subValue}>
                    min active
                </ThemedText>
                {/* Mini Heat Indicator */}
                <View style={styles.heatRow}>
                    {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                        <View
                            key={i}
                            style={[
                                styles.heatDot,
                                {
                                    opacity: activeMinutes > (i * 12) ? 1 : 0.2,
                                    backgroundColor: PASTEL_COLORS.accents.softBlue
                                }
                            ]}
                        />
                    ))}
                </View>
            </SoftGlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
    },
    card: {
        flex: 1,
        padding: 16,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    label: {
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1,
        fontSize: 10,
        fontWeight: '700',
    },
    heroValue: {
        color: PASTEL_COLORS.accents.softOrange,
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 36,
    },
    subValue: {
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    heatRow: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 8,
    },
    heatDot: {
        width: 12,
        height: 12,
        borderRadius: 3,
    }
});
