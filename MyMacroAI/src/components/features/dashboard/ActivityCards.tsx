import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/src/components/ui/GlassCard';

export const ActivityCards = () => {
    return (
        <View style={styles.gridContainer}>
            <View style={styles.row}>
                {/* 1. Training Load */}
                <GlassCard
                    variant="frosted"
                    intensity={25}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="barbell" size={16} color="#94A3B8" />
                        <Text style={styles.cardTitle}>Training Load</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.mainText}>Last Workout:</Text>
                        <Text style={styles.valueText}>Leg Day</Text>
                    </View>
                </GlassCard>

                {/* 2. Squad Rank */}
                <GlassCard
                    variant="frosted"
                    intensity={25}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="trophy" size={16} color="#FCD34D" />
                        <Text style={styles.cardTitle}>Squad Rank</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.mainText}>Your Rank: <Text style={{ color: '#FCD34D', fontWeight: '700' }}>#14</Text></Text>
                        <View style={{ marginTop: 4 }}>
                            <Text style={styles.subtext}>1. Top 3 squad: #14</Text>
                            <Text style={styles.subtext}>2. Top 3 squad members</Text>
                        </View>
                    </View>
                </GlassCard>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        paddingHorizontal: 16,
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
    mainText: {
        color: '#F1F5F9',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    valueText: {
        color: '#F8FAFC',
        fontSize: 18,
        fontWeight: '700',
    },
    subtext: {
        color: '#64748B',
        fontSize: 10,
        lineHeight: 14,
    }
});
