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
import { useUserStore, useLogsForDate, useDailyLogs } from '@/src/store/UserStore';
import { DailyLog } from '@/src/types';

interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    items: string[];
}

// Aggregate logs by meal type
const aggregateLogsByMeal = (logs: DailyLog[]): Meal[] => {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;

    return mealTypes.map(mealType => {
        const mealLogs = logs.filter(log => log.mealType === mealType || (!log.mealType && mealType === 'snacks'));

        const totals = mealLogs.reduce(
            (acc, log) => ({
                calories: acc.calories + (log.calories || 0),
                protein: acc.protein + (log.protein || 0),
                carbs: acc.carbs + (log.carbs || 0),
                fats: acc.fats + (log.fats || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        return {
            id: mealType,
            name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
            ...totals,
            items: mealLogs.map(log => log.foodName || 'Food item').filter(Boolean),
        };
    });
};

export const MealList = () => {
    const haptics = useHaptics();
    const { colors } = useCombinedTheme();

    // Get today's logs from store
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = useLogsForDate(today);
    const legacyLogs = useDailyLogs();

    // Use today's logs or fall back to legacy
    const logs = todaysLogs.length > 0 ? todaysLogs : legacyLogs;
    const MEALS = aggregateLogsByMeal(logs);

    const handleAdd = (mealId: string) => {
        haptics.light();
        // Navigate to food logging with meal type pre-selected
        router.push({
            pathname: '/(modals)/log-food',
            params: { mealType: mealId }
        } as any);
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
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Meals</Text>
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
                                    <Text style={[styles.mealName, { color: colors.textSecondary }]}>{meal.name}</Text>
                                    <Text style={[styles.mealCalories, { color: colors.textPrimary }]}>
                                        {meal.calories > 0 ? meal.calories : 0} <Text style={[styles.unit, { color: colors.textMuted }]}>kcal</Text>
                                    </Text>
                                    <Text style={[styles.mealItems, { color: colors.textMuted }]} numberOfLines={1}>
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
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 2,
    },
    mealCalories: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    unit: {
        fontSize: 14,
        fontWeight: '500',
    },
    mealItems: {
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
