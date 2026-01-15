import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ThemedText } from '../../ui/ThemedText';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';

const ACTIONS = [
    { id: 'food', icon: 'nutrition', label: 'Food', color: PASTEL_COLORS.accents.softOrange },
    { id: 'water', icon: 'water', label: 'Water', color: PASTEL_COLORS.accents.softBlue },
    { id: 'exercise', icon: 'barbell', label: 'Gym', color: PASTEL_COLORS.accents.softPurple }, // Changed id from 'gym' to 'exercise' to match standard
    { id: 'weigh', icon: 'scale', label: 'Weigh', color: PASTEL_COLORS.accents.softGreen },
    { id: 'mood', icon: 'happy', label: 'Mood', color: PASTEL_COLORS.accents.softPink },
];

interface QuickActionStripProps {
    onActionPress: (id: string) => void;
}

export const QuickActionStrip: React.FC<QuickActionStripProps> = ({ onActionPress }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            style={{ flexGrow: 0 }}
        >
            {ACTIONS.map((action) => (
                <TouchableOpacity
                    key={action.id}
                    activeOpacity={0.7}
                    onPress={() => onActionPress(action.id)}
                    style={{ marginRight: 12 }}
                >
                    <BlurView intensity={30} tint="light" style={styles.pill}>
                        <View style={[styles.iconCircle, { backgroundColor: `${action.color}30` }]}>
                            <Ionicons name={action.icon as any} size={18} color={action.color} />
                        </View>
                        <ThemedText variant="caption" style={{ color: '#FFF', fontWeight: '600' }}>
                            {action.label}
                        </ThemedText>
                    </BlurView>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
        gap: 8,
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
