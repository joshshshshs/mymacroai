import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { ThemedText } from '../../ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';

export const ContextRow: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Sleep Bank */}
            <SoftGlassCard variant="soft" style={styles.card}>
                <View style={styles.header}>
                    <Ionicons name="moon" size={20} color={PASTEL_COLORS.accents.softPurple} />
                    <ThemedText variant="label" style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 8 }}>SLEEP BANK</ThemedText>
                </View>
                <View style={styles.content}>
                    <ThemedText variant="h2" style={{ color: '#FFF' }}>-1.5h</ThemedText>
                    <ThemedText variant="caption" style={{ color: '#EF4444' }}>Deficit High</ThemedText>
                </View>
                {/* Simple visual bar for context */}
                <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: '40%', backgroundColor: '#EF4444' }]} />
                </View>
            </SoftGlassCard>

            {/* Training Load */}
            <SoftGlassCard variant="soft" style={styles.card}>
                <View style={styles.header}>
                    <Ionicons name="flame" size={20} color={PASTEL_COLORS.accents.softOrange} />
                    <ThemedText variant="label" style={{ color: 'rgba(255,255,255,0.7)', marginLeft: 8 }}>STRAIN</ThemedText>
                </View>
                <View style={styles.content}>
                    <ThemedText variant="h2" style={{ color: '#FFF' }}>12.4</ThemedText>
                    <ThemedText variant="caption" style={{ color: '#10B981' }}>Optimal Zone</ThemedText>
                </View>
                {/* Simple heatmap visual for context */}
                <View style={styles.heatmapRow}>
                    {[0.2, 0.4, 0.8, 0.6, 1].map((opacity, i) => (
                        <View key={i} style={[styles.heatBox, { opacity, backgroundColor: PASTEL_COLORS.accents.softOrange }]} />
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
        marginBottom: 24,
    },
    card: {
        flex: 1,
        padding: 16,
        height: 140,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    content: {
        marginBottom: 12,
    },
    barBg: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 2,
    },
    heatmapRow: {
        flexDirection: 'row',
        gap: 4,
    },
    heatBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
    }
});
