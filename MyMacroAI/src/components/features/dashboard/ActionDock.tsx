import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { useHaptics } from '@/hooks/useHaptics';

interface ActionItem {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    labelLines?: string[]; // For multi-line labels if needed
}

const ACTIONS: ActionItem[] = [
    { id: 'meal', label: 'Log\nMeal', icon: 'fast-food' },
    { id: 'water', label: 'Log\nWater', icon: 'water' },
    { id: 'workout', label: 'Log\nWorkout', icon: 'barbell' },
    { id: 'scan', label: 'Scan\nBarcode', icon: 'barcode' }, // 'scan' or 'barcode'
    { id: 'voice', label: 'Voice\nLog', icon: 'mic' },
];

export const ActionDock = () => {
    const haptics = useHaptics();

    const handlePress = (action: string) => {
        haptics.light();
        // Action handled by parent component
    };

    return (
        <View style={styles.container}>
            <SoftGlassCard variant="medium" style={styles.dockBackground}>
                <View style={styles.row}>
                    {ACTIONS.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            onPress={() => handlePress(action.id)}
                            style={styles.actionButton}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name={action.icon} size={20} color="#E2E8F0" />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </SoftGlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 30, // Bottom spacing
        paddingHorizontal: 16,
    },
    dockBackground: {
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    actionButton: {
        alignItems: 'center',
        flex: 1, // Distribute evenly
        gap: 8,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    actionLabel: {
        color: '#94A3B8',
        fontSize: 10,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 12,
    }
});
