import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';

interface Meal {
    id: string;
    name: string;
    calories: number;
    items: string[];
}

const MEALS: Meal[] = [
    { id: 'breakfast', name: 'Breakfast', calories: 420, items: ['Oatmeal', 'Berries', 'Coffee'] },
    { id: 'lunch', name: 'Lunch', calories: 580, items: ['Grilled Chicken Salad', 'Quinoa'] },
    { id: 'dinner', name: 'Dinner', calories: 0, items: [] }, // Empty state
    { id: 'snacks', name: 'Snacks', calories: 50, items: ['Almonds'] },
];

export const MealList = () => {
    const haptics = useHaptics();

    const handleAdd = (mealId: string) => {
        haptics.light();
        console.log(`Add to ${mealId}`);
        // TODO: Open AI Hub or Search
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Meals</Text>
            <View style={styles.list}>
                {MEALS.map((meal) => (
                    <SoftGlassCard
                        key={meal.id}
                        variant="soft"
                        style={styles.card}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.textContainer}>
                                <Text style={styles.mealName}>{meal.name}</Text>
                                <Text style={styles.mealCalories}>
                                    {meal.calories > 0 ? meal.calories : 0} <Text style={styles.unit}>kcal</Text>
                                </Text>
                                <Text style={styles.mealItems} numberOfLines={1}>
                                    {meal.items.length > 0 ? meal.items.join(', ') : 'No food logged'}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleAdd(meal.id)}
                                style={styles.addButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add" size={16} color="#F97316" />
                                <Text style={styles.addText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </SoftGlassCard>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#F1F5F9',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    list: {
        gap: 12,
    },
    card: {
        padding: 16,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginRight: 16,
    },
    mealName: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    mealCalories: {
        color: '#F8FAFC',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    unit: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    mealItems: {
        color: '#64748B',
        fontSize: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.15)', // Orange tint
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 4,
    },
    addText: {
        color: '#F97316',
        fontSize: 12,
        fontWeight: '600',
    }
});
