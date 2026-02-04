import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';

interface WaterIntakeWidgetProps {
    glasses: number;
    goal?: number;
}

export const WaterIntakeWidget: React.FC<WaterIntakeWidgetProps> = ({ glasses, goal = 8 }) => {
    const progress = Math.min(glasses / goal, 1);

    return (
        <SoftGlassCard variant="soft" style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="water" size={20} color={PASTEL_COLORS.accents.softBlue} />
                <ThemedText variant="label" style={styles.label}>HYDRATION</ThemedText>
            </View>
            <View style={styles.glassesRow}>
                {Array.from({ length: goal }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.glass,
                            i < glasses ? styles.glassFilled : styles.glassEmpty
                        ]}
                    >
                        <Ionicons
                            name={i < glasses ? "water" : "water-outline"}
                            size={16}
                            color={i < glasses ? PASTEL_COLORS.accents.softBlue : 'rgba(255,255,255,0.3)'}
                        />
                    </View>
                ))}
            </View>
            <ThemedText variant="caption" style={styles.status}>
                {glasses} of {goal} glasses
            </ThemedText>
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
        marginBottom: 12,
    },
    label: {
        color: PASTEL_COLORS.accents.softBlue,
        fontWeight: '700',
        letterSpacing: 1,
        fontSize: 10,
    },
    glassesRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    glass: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glassFilled: {
        backgroundColor: 'rgba(45, 212, 191, 0.2)', // Teal tint
    },
    glassEmpty: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    status: {
        color: 'rgba(255,255,255,0.6)',
    }
});
