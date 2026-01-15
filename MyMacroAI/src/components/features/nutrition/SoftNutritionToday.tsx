/**
 * Soft Nutrition Today View
 * Ultra-soft glassmorphic design
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { PASTEL_COLORS, SOFT_RADIUS } from '../../../design-system/aesthetics';
import { SPACING } from '../../../design-system/tokens';

export const SoftNutritionToday: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)';
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';

  const todayIntake = {
    calories: 1650,
    protein: 130,
    carbs: 140,
    fats: 45,
  };

  const goals = {
    protein: 140,
    carbs: 160,
    fats: 60,
  };

  const meals = [
    { name: 'Breakfast', calories: 420, foods: 'Oatmeal, Berries, Coffee' },
    { name: 'Lunch', calories: 580, foods: 'Grilled Chicken Salad, Quinoa' },
    { name: 'Dinner', calories: 600, foods: 'Salmon, Asparagus, Brown Rice' },
    { name: 'Snacks', calories: 50, foods: 'Almonds, Apple Slice' },
  ];

  const getProgress = (current: number, goal: number) => `${((current / goal) * 100).toFixed(0)}%`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Today's Intake Card */}
      <SoftGlassCard variant="prominent" gradient="purpleDream" style={styles.intakeCard}>
        <Text style={[styles.cardTitle, { color: secondaryTextColor }]}>Today's Intake</Text>

        <View style={styles.caloriesRow}>
          <Text style={[styles.caloriesNumber, { color: textColor }]}>
            {todayIntake.calories}
          </Text>
          <Text style={[styles.caloriesUnit, { color: secondaryTextColor }]}>kcal</Text>
        </View>

        <Text style={[styles.macroSummary, { color: secondaryTextColor }]}>
          {todayIntake.protein}P / {todayIntake.carbs}C / {todayIntake.fats}F
        </Text>

        <Text style={[styles.remainingText, { color: secondaryTextColor }]}>
          Remaining: {goals.protein - todayIntake.protein}P / {goals.carbs - todayIntake.carbs}C / {goals.fats - todayIntake.fats}F
        </Text>

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          <ProgressBar
            label="Protein"
            progress={getProgress(todayIntake.protein, goals.protein)}
            color={PASTEL_COLORS.accents.softOrange}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
          />
          <ProgressBar
            label="Carbs"
            progress={getProgress(todayIntake.carbs, goals.carbs)}
            color={PASTEL_COLORS.accents.softPurple}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
          />
          <ProgressBar
            label="Fats"
            progress={getProgress(todayIntake.fats, goals.fats)}
            color={PASTEL_COLORS.accents.softPink}
            textColor={textColor}
            secondaryTextColor={secondaryTextColor}
          />
        </View>
      </SoftGlassCard>

      {/* Meals Section */}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Meals</Text>

      {meals.map((meal, index) => (
        <SoftGlassCard key={index} variant="soft" style={styles.mealCard}>
          <View style={styles.mealRow}>
            <View style={styles.mealInfo}>
              <Text style={[styles.mealName, { color: textColor }]}>{meal.name}</Text>
              <Text style={[styles.mealCalories, { color: secondaryTextColor }]}>
                {meal.calories} kcal
              </Text>
              <Text style={[styles.mealFoods, { color: secondaryTextColor }]}>
                {meal.foods}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.addButton, { color: PASTEL_COLORS.accents.softGreen }]}>+ Add</Text>
            </TouchableOpacity>
          </View>
        </SoftGlassCard>
      ))}

      {/* Add Food Section */}
      <SoftGlassCard variant="soft" gradient="blueMist" style={styles.addFoodCard}>
        <Text style={[styles.addFoodTitle, { color: textColor }]}>Add Food</Text>

        <View style={styles.addFoodButtons}>
          <AddFoodButton icon="search" label="Search" textColor={textColor} />
          <AddFoodButton icon="barcode" label="Barcode" textColor={textColor} />
          <AddFoodButton icon="camera" label="Photo" textColor={textColor} />
          <AddFoodButton icon="create" label="Manual" textColor={textColor} />
        </View>
      </SoftGlassCard>

      {/* Footer */}
      <Text style={[styles.footerText, { color: secondaryTextColor }]}>
        Targets auto-adjusted from activity today.{' '}
        <Text style={{ color: PASTEL_COLORS.accents.softPurple }}>View details</Text>
      </Text>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

// Progress Bar Component
const ProgressBar: React.FC<{ label: string; progress: string; color: string; textColor: string; secondaryTextColor: string }> = ({
  label,
  progress,
  color,
  textColor,
  secondaryTextColor,
}) => (
  <View style={styles.progressRow}>
    <Text style={[styles.progressLabel, { color: secondaryTextColor }]}>{label}</Text>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: progress as unknown as import('react-native').DimensionValue, backgroundColor: color }]} />
    </View>
  </View>
);

// Add Food Button Component
const AddFoodButton: React.FC<{ icon: any; label: string; textColor: string }> = ({ icon, label, textColor }) => (
  <TouchableOpacity style={styles.addFoodButton}>
    <View style={[styles.addFoodIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
      <Ionicons name={icon} size={24} color={PASTEL_COLORS.accents.softPurple} />
    </View>
    <Text style={[styles.addFoodLabel, { color: textColor }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg },
  intakeCard: { padding: SPACING.xl, marginBottom: SPACING.xl },
  cardTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  caloriesRow: { flexDirection: 'row', alignItems: 'baseline', marginVertical: SPACING.md },
  caloriesNumber: { fontSize: 56, fontWeight: '200', letterSpacing: -2 },
  caloriesUnit: { fontSize: 20, fontWeight: '300', marginLeft: 8 },
  macroSummary: { fontSize: 15, marginBottom: 4 },
  remainingText: { fontSize: 13, marginBottom: SPACING.lg },
  progressContainer: { gap: SPACING.md },
  progressRow: { gap: SPACING.sm },
  progressLabel: { fontSize: 14, fontWeight: '400' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '400', marginBottom: SPACING.md },
  mealCard: { padding: SPACING.lg, marginBottom: SPACING.md },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 17, fontWeight: '500', marginBottom: 4 },
  mealCalories: { fontSize: 15, fontWeight: '400', marginBottom: 4 },
  mealFoods: { fontSize: 13 },
  addButton: { fontSize: 15, fontWeight: '500' },
  addFoodCard: { padding: SPACING.xl, marginTop: SPACING.lg },
  addFoodTitle: { fontSize: 17, fontWeight: '500', marginBottom: SPACING.lg },
  addFoodButtons: { flexDirection: 'row', gap: SPACING.sm },
  addFoodButton: { flex: 1, alignItems: 'center', gap: SPACING.sm },
  addFoodIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  addFoodLabel: { fontSize: 12, fontWeight: '400' },
  footerText: { fontSize: 12, textAlign: 'center', marginTop: SPACING.xl },
});
