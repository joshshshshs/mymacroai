import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LiquidRing } from '@/src/components/ui/LiquidRing';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';

interface MacroStats {
    current: number;
    target: number;
}

interface MacroPhageProps {
    calories: {
        remaining: number;
        target: number;
    };
    macros: {
        protein: MacroStats;
        carbs: MacroStats;
        fats: MacroStats;
    };
}

export const MacroPhage: React.FC<MacroPhageProps> = ({ macros }) => {
    // Helper to calculate percentage safe from NaN
    const calcPercent = (current: number, target: number) => {
        if (target <= 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <SoftGlassCard variant="soft" style={styles.card}>
                <View style={styles.ringsRow}>
                    {/* Protein - Orange */}
                    <View style={styles.ringItem}>
                        <View style={styles.ringWrapper}>
                            <LiquidRing
                                value={calcPercent(macros.protein.current, macros.protein.target)}
                                size={90}
                                color="#F97316" // Orange
                                strokeWidth={8}
                            />
                            <View style={styles.innerValue}>
                                <Text style={styles.percentText}>
                                    {Math.round(calcPercent(macros.protein.current, macros.protein.target))}%
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.label}>Protein</Text>
                    </View>

                    {/* Carbs - Blue */}
                    <View style={styles.ringItem}>
                        <View style={styles.ringWrapper}>
                            <LiquidRing
                                value={calcPercent(macros.carbs.current, macros.carbs.target)}
                                size={90}
                                color="#3B82F6" // Blue
                                strokeWidth={8}
                            />
                            <View style={styles.innerValue}>
                                <Text style={styles.percentText}>
                                    {Math.round(calcPercent(macros.carbs.current, macros.carbs.target))}%
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.label}>Carbs</Text>
                    </View>

                    {/* Fats - Green */}
                    <View style={styles.ringItem}>
                        <View style={styles.ringWrapper}>
                            <LiquidRing
                                value={calcPercent(macros.fats.current, macros.fats.target)}
                                size={90}
                                color="#10B981" // Green (Mockup style)
                                strokeWidth={8}
                            />
                            <View style={styles.innerValue}>
                                <Text style={styles.percentText}>
                                    {Math.round(calcPercent(macros.fats.current, macros.fats.target))}%
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.label}>Fats</Text>
                    </View>
                </View>
            </SoftGlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    ringsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Spaced out evenly
        alignItems: 'center',
    },
    ringItem: {
        alignItems: 'center',
        gap: 8,
    },
    ringWrapper: {
        position: 'relative',
        width: 90,
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerValue: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentText: {
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '700',
    },
    label: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '500',
    }
});
