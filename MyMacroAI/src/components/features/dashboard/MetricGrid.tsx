import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';

export const MetricGrid = () => {
    return (
        <View style={styles.gridContainer}>
            <View style={styles.row}>
                {/* 1. Recovery Score */}
                <SoftGlassCard
                    variant="soft"
                    style={styles.card}
                    glowColor="#10B981" // Green glow
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="fitness" size={16} color="#4ADE80" />
                        <Text style={styles.cardTitle}>Recovery Score</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.bigValue}>78</Text>
                        <Text style={styles.subtext}>High</Text>
                    </View>
                </SoftGlassCard>

                {/* 2. Sleep Debt */}
                <SoftGlassCard
                    variant="soft"
                    style={styles.card}
                    glowColor="#8B5CF6" // Purple glow
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="moon" size={16} color="#A78BFA" />
                        <Text style={styles.cardTitle}>Sleep Debt</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.bigValue}>1h 15m</Text>
                        <Text style={styles.subtext}>To 7-day avg</Text>
                    </View>
                </SoftGlassCard>
            </View>

            <View style={styles.row}>
                {/* 3. Hydration */}
                <SoftGlassCard
                    variant="soft"
                    style={styles.card}
                    glowColor="#3B82F6" // Blue glow
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="water" size={16} color="#60A5FA" />
                        <Text style={styles.cardTitle}>Hydration</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.barContainer}>
                            <View style={[styles.barFill, { width: '60%' }]} />
                        </View>
                        <Text style={[styles.subtext, { marginTop: 8, textAlign: 'right' }]}>1.2L / 3L</Text>
                    </View>
                </SoftGlassCard>

                {/* 4. Macros Remaining */}
                <SoftGlassCard
                    variant="soft"
                    style={styles.card}
                    glowColor="#F97316" // Orange glow
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="pie-chart" size={16} color="#FB923C" />
                        <Text style={styles.cardTitle}>Macros Left</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.macroRow}>
                            <Text style={styles.macroTag}>P: 55g</Text>
                            <Text style={styles.macroTag}>C: 120g</Text>
                        </View>
                        <Text style={styles.macroTag}>F: 30g</Text>
                    </View>
                </SoftGlassCard>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    card: {
        flex: 1,
        padding: 16,
        minHeight: 110,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    cardTitle: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    bigValue: {
        color: '#F8FAFC',
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 32,
    },
    subtext: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '500',
    },
    barContainer: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },
    macroRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    macroTag: {
        color: '#CBD5E1',
        fontSize: 13,
        fontWeight: '600',
    }
});
