/**
 * MealList - Logged Meals with Share to Public option
 * 
 * Features:
 * - Shows logged meals for the day
 * - "Share to Public" button for meals with calories > 0
 * - Uses theme colors and haptic feedback
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '@/hooks/useHaptics';
import { useCombinedTheme } from '@/src/design-system/theme';
import { useUserStore } from '@/src/store/UserStore';

interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    items: string[];
}

// Get meals from store or use defaults
const getDefaultMeals = (): Meal[] => [
    { id: 'breakfast', name: 'Breakfast', calories: 420, protein: 25, carbs: 45, fats: 15, items: ['Oatmeal', 'Berries', 'Coffee'] },
    { id: 'lunch', name: 'Lunch', calories: 580, protein: 40, carbs: 55, fats: 20, items: ['Grilled Chicken Salad', 'Quinoa'] },
    { id: 'dinner', name: 'Dinner', calories: 0, protein: 0, carbs: 0, fats: 0, items: [] },
    { id: 'snacks', name: 'Snacks', calories: 50, protein: 3, carbs: 4, fats: 4, items: ['Almonds'] },
];

export const MealList = () => {
    const haptics = useHaptics();
    const { colors } = useCombinedTheme();
    const MEALS = getDefaultMeals(); // TODO: Wire to actual user logged meals

    const handleAdd = (mealId: string) => {
        haptics.light();
        // TODO: Open AI Hub or Search for mealId
    };

    const handleShare = (meal: Meal) => {
        haptics.medium();

        // Navigate to publish-recipe modal with meal data
        router.push({
            pathname: '/(modals)/publish-recipe',
            params: {
                mealName: meal.name,
                calories: meal.calories.toString(),
                protein: meal.protein.toString(),
                carbs: meal.carbs.toString(),
                fats: meal.fats.toString(),
                ingredients: JSON.stringify(
                    meal.items.map(item => ({
                        name: item,
                        amount: 1,
                        unit: 'serving',
                    }))
                ),
                mealId: meal.id,
            },
        } as any);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Meals</Text>
            <View style={styles.list}>
                {MEALS.map((meal) => {
                    const hasContent = meal.calories > 0;

                    return (
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

                                {/* Action Buttons */}
                                <View style={styles.actions}>
                                    {/* Share Button - Only show for meals with content */}
                                    {hasContent && (
                                        <TouchableOpacity
                                            onPress={() => handleShare(meal)}
                                            style={[styles.shareButton, { backgroundColor: `${colors.primary}15` }]}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="share-outline" size={16} color={colors.primary} />
                                        </TouchableOpacity>
                                    )}

                                    {/* Add Button */}
                                    <TouchableOpacity
                                        onPress={() => handleAdd(meal.id)}
                                        style={[styles.addButton, { backgroundColor: `${colors.primary}15` }]}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="add" size={16} color={colors.primary} />
                                        <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SoftGlassCard>
                    );
                })}
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
        marginRight: 12,
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    shareButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        gap: 4,
    },
    addText: {
        fontSize: 12,
        fontWeight: '600',
    }
});
