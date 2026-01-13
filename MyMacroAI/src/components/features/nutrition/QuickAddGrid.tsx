import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

export const QuickAddGrid = () => {
    const haptics = useHaptics();

    const actions = [
        { id: 'search', label: 'Search', icon: 'search-outline' as const },
        { id: 'barcode', label: 'Barcode', icon: 'barcode-outline' as const },
        { id: 'photo', label: 'Photo', icon: 'camera-outline' as const },
        { id: 'manual', label: 'Manual', icon: 'create-outline' as const },
    ];

    const handlePress = (id: string) => {
        haptics.light();
        console.log(`Quick Add: ${id}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Add Food</Text>
            <SoftGlassCard variant="medium" style={styles.gridCard}>
                <View style={styles.row}>
                    {actions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.item}
                            onPress={() => handlePress(action.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconBox}>
                                <Ionicons name={action.icon} size={24} color="#F97316" />
                            </View>
                            <Text style={styles.label}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </SoftGlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 100, // Space for tab bar
    },
    sectionTitle: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    gridCard: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    label: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '500',
    }
});
