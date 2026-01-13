/**
 * NutritionTodayView - Today's Intake Tab
 * Shows daily calorie/macro progress and meals list
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../../design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';

interface Meal {
  id: string;
  name: string;
  calories: number;
  foods: string[];
}

export const NutritionTodayView: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Mock data - replace with actual store data
  const todayIntake = {
    calories: 1650,
    protein: 130,
    carbs: 140,
    fats: 45,
  };

  const goals = {
    calories: 2100,
    protein: 140,
    carbs: 160,
    fats: 60,
  };

  const remaining = {
    protein: goals.protein - todayIntake.protein,
    carbs: goals.carbs - todayIntake.carbs,
    fats: goals.fats - todayIntake.fats,
  };

  const meals: Meal[] = [
    { id: '1', name: 'Breakfast', calories: 420, foods: ['Oatmeal', 'Berries', 'Coffee'] },
    { id: '2', name: 'Lunch', calories: 580, foods: ['Grilled Chicken Salad', 'Quinoa'] },
    { id: '3', name: 'Dinner', calories: 600, foods: ['Salmon', 'Asparagus', 'Brown Rice'] },
    { id: '4', name: 'Snacks', calories: 50, foods: ['Almonds', 'Apple Slice'] },
  ];

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
  const cardBg = isDark ? COLORS.forest.card : COLORS.mist.card;

  const getProgressWidth = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleAddFood = (method: string) => {
    console.log(`Add food via: ${method}`);
    // TODO: Open respective food logging flow
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Today's Intake Card */}
      <SoftGlassCard variant="medium" style={styles.intakeCard}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Today's Intake</Text>

        <View style={styles.caloriesRow}>
          <Text style={[styles.caloriesNumber, { color: textColor }]}>
            {todayIntake.calories}
            <Text style={styles.caloriesUnit}> kcal</Text>
          </Text>
        </View>

        <Text style={[styles.macroBreakdown, { color: secondaryTextColor }]}>
          {todayIntake.protein}P / {todayIntake.carbs}C / {todayIntake.fats}F
        </Text>

        <Text style={[styles.remainingText, { color: secondaryTextColor }]}>
          Remaining: {remaining.protein}P / {remaining.carbs}C / {remaining.fats}F
        </Text>

        {/* Macro Progress Bars */}
        <View style={styles.macroProgressContainer}>
          {/* Protein */}
          <View style={styles.macroRow}>
            <Text style={[styles.macroLabel, { color: textColor }]}>Protein</Text>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressWidth(todayIntake.protein, goals.protein)}%`, backgroundColor: '#FB923C' }
                ]}
              />
            </View>
          </View>

          {/* Carbs */}
          <View style={styles.macroRow}>
            <Text style={[styles.macroLabel, { color: textColor }]}>Carbs</Text>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressWidth(todayIntake.carbs, goals.carbs)}%`, backgroundColor: '#FB923C' }
                ]}
              />
            </View>
          </View>

          {/* Fats */}
          <View style={styles.macroRow}>
            <Text style={[styles.macroLabel, { color: textColor }]}>Fats</Text>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressWidth(todayIntake.fats, goals.fats)}%`, backgroundColor: '#FB923C' }
                ]}
              />
            </View>
          </View>
        </View>
      </SoftGlassCard>

      {/* Meals Section */}
      <Text style={[styles.sectionHeader, { color: textColor }]}>Meals</Text>

      {meals.map((meal) => (
        <SoftGlassCard key={meal.id} variant="medium" style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <View>
              <Text style={[styles.mealName, { color: textColor }]}>{meal.name}</Text>
              <Text style={[styles.mealCalories, { color: secondaryTextColor }]}>
                {meal.calories} kcal
              </Text>
              <Text style={[styles.mealFoods, { color: secondaryTextColor }]}>
                {meal.foods.join(', ')}
              </Text>
            </View>

            <TouchableOpacity style={styles.addButton}>
              <Text style={[styles.addButtonText, { color: COLORS.accent.lime500 }]}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </SoftGlassCard>
      ))}

      {/* Add Food Section */}
      <SoftGlassCard variant="medium" style={styles.addFoodCard}>
        <Text style={[styles.addFoodTitle, { color: textColor }]}>Add Food</Text>

        <View style={styles.addFoodButtons}>
          <TouchableOpacity
            style={styles.addFoodMethod}
            onPress={() => handleAddFood('search')}
          >
            <View style={[styles.addFoodIconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Ionicons name="search-outline" size={24} color={COLORS.accent.lime500} />
            </View>
            <Text style={[styles.addFoodMethodLabel, { color: textColor }]}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addFoodMethod}
            onPress={() => handleAddFood('barcode')}
          >
            <View style={[styles.addFoodIconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Ionicons name="barcode-outline" size={24} color={COLORS.accent.lime500} />
            </View>
            <Text style={[styles.addFoodMethodLabel, { color: textColor }]}>Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addFoodMethod}
            onPress={() => handleAddFood('photo')}
          >
            <View style={[styles.addFoodIconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Ionicons name="camera-outline" size={24} color={COLORS.accent.lime500} />
            </View>
            <Text style={[styles.addFoodMethodLabel, { color: textColor }]}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addFoodMethod}
            onPress={() => handleAddFood('manual')}
          >
            <View style={[styles.addFoodIconContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <Ionicons name="create-outline" size={24} color={COLORS.accent.lime500} />
            </View>
            <Text style={[styles.addFoodMethodLabel, { color: textColor }]}>Manual</Text>
          </TouchableOpacity>
        </View>
      </SoftGlassCard>

      {/* Footer Note */}
      <View style={styles.footerNote}>
        <Text style={[styles.footerNoteText, { color: secondaryTextColor }]}>
          Targets auto-adjusted from activity today.{' '}
          <Text style={{ color: COLORS.accent.lime500 }}>View details</Text>
        </Text>
      </View>

      {/* Bottom Spacer for Tab Bar */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  intakeCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },
  caloriesRow: {
    marginVertical: SPACING.sm,
  },
  caloriesNumber: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -2,
  },
  caloriesUnit: {
    fontSize: 20,
    fontWeight: '400',
  },
  macroBreakdown: {
    fontSize: 15,
    marginBottom: 4,
  },
  remainingText: {
    fontSize: 13,
    marginBottom: SPACING.lg,
  },
  macroProgressContainer: {
    gap: SPACING.md,
  },
  macroRow: {
    gap: SPACING.sm,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  mealCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mealName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealFoods: {
    fontSize: 13,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  addFoodCard: {
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  addFoodTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  addFoodButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  addFoodMethod: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addFoodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFoodMethodLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerNote: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  footerNoteText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
