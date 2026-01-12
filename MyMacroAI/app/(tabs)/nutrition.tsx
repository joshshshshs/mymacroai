import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useHaptics } from '../../hooks/useHaptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

interface NutritionData {
  calories: { consumed: number; target: number; remaining: number };
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
  water: { consumed: number; target: number };
}

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  icon: string;
}

export default function NutritionScreen() {
  const { triggerHaptic } = useHaptics();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data - would come from store/API
  const [nutritionData] = useState<NutritionData>({
    calories: { consumed: 1450, target: 2200, remaining: 750 },
    protein: { consumed: 85, target: 150 },
    carbs: { consumed: 180, target: 250 },
    fat: { consumed: 48, target: 73 },
    water: { consumed: 1800, target: 2500 },
  });

  const [meals] = useState<MealEntry[]>([
    { id: '1', name: 'Oatmeal with berries', calories: 320, time: '8:30 AM', type: 'breakfast', icon: 'sunny-outline' },
    { id: '2', name: 'Grilled chicken salad', calories: 450, time: '12:45 PM', type: 'lunch', icon: 'restaurant-outline' },
    { id: '3', name: 'Greek yogurt', calories: 150, time: '3:30 PM', type: 'snack', icon: 'cafe-outline' },
    { id: '4', name: 'Salmon with vegetables', calories: 530, time: '7:00 PM', type: 'dinner', icon: 'moon-outline' },
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await triggerHaptic('light');
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, [triggerHaptic]);

  const getProgress = (consumed: number, target: number) => {
    return Math.min((consumed / target) * 100, 100);
  };

  const getMacroColor = (macro: string) => {
    switch (macro) {
      case 'protein': return '#EF4444';
      case 'carbs': return '#F59E0B';
      case 'fat': return '#8B5CF6';
      default: return '#3B82F6';
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Selector */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.dateSelector}>
          <TouchableOpacity
            onPress={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 1);
              setSelectedDate(prev);
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <TouchableOpacity
            onPress={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 1);
              if (next <= new Date()) setSelectedDate(next);
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#6B7280" />
          </TouchableOpacity>
        </Animated.View>

        {/* Calories Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.caloriesCard}>
          <View style={styles.caloriesHeader}>
            <Text style={styles.caloriesTitle}>Calories</Text>
            <Text style={styles.caloriesRemaining}>
              {nutritionData.calories.remaining} remaining
            </Text>
          </View>

          <View style={styles.caloriesRing}>
            <View style={styles.caloriesCenter}>
              <Text style={styles.caloriesConsumed}>
                {nutritionData.calories.consumed}
              </Text>
              <Text style={styles.caloriesLabel}>of {nutritionData.calories.target}</Text>
            </View>
            {/* Progress ring would be implemented with SVG in production */}
            <View
              style={[
                styles.progressRing,
                { borderColor: '#3B82F6' },
              ]}
            />
          </View>

          <View style={styles.caloriesStats}>
            <View style={styles.calorieStat}>
              <View style={[styles.calorieIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="add" size={16} color="#22C55E" />
              </View>
              <Text style={styles.calorieStatValue}>{nutritionData.calories.consumed}</Text>
              <Text style={styles.calorieStatLabel}>Eaten</Text>
            </View>
            <View style={styles.calorieStat}>
              <View style={[styles.calorieIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="flame" size={16} color="#EF4444" />
              </View>
              <Text style={styles.calorieStatValue}>420</Text>
              <Text style={styles.calorieStatLabel}>Burned</Text>
            </View>
            <View style={styles.calorieStat}>
              <View style={[styles.calorieIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="flag" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.calorieStatValue}>{nutritionData.calories.target}</Text>
              <Text style={styles.calorieStatLabel}>Goal</Text>
            </View>
          </View>
        </Animated.View>

        {/* Macros Grid */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.sectionTitle}>Macros</Text>
          <View style={styles.macrosGrid}>
            {(['protein', 'carbs', 'fat'] as const).map((macro, index) => (
              <View key={macro} style={styles.macroCard}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroTitle}>{macro.charAt(0).toUpperCase() + macro.slice(1)}</Text>
                  <Text style={[styles.macroPercent, { color: getMacroColor(macro) }]}>
                    {Math.round(getProgress(nutritionData[macro].consumed, nutritionData[macro].target))}%
                  </Text>
                </View>
                <View style={styles.macroProgressBar}>
                  <View
                    style={[
                      styles.macroProgressFill,
                      {
                        width: `${getProgress(nutritionData[macro].consumed, nutritionData[macro].target)}%`,
                        backgroundColor: getMacroColor(macro),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.macroValues}>
                  {nutritionData[macro].consumed}g / {nutritionData[macro].target}g
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Water Intake */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <Ionicons name="water" size={24} color="#0EA5E9" />
            <Text style={styles.waterTitle}>Water Intake</Text>
          </View>
          <View style={styles.waterProgress}>
            <View style={styles.waterProgressBar}>
              <View
                style={[
                  styles.waterProgressFill,
                  { width: `${getProgress(nutritionData.water.consumed, nutritionData.water.target)}%` },
                ]}
              />
            </View>
            <Text style={styles.waterText}>
              {(nutritionData.water.consumed / 1000).toFixed(1)}L / {(nutritionData.water.target / 1000).toFixed(1)}L
            </Text>
          </View>
          <View style={styles.waterButtons}>
            {[250, 500, 750].map((ml) => (
              <TouchableOpacity
                key={ml}
                style={styles.waterButton}
                onPress={() => triggerHaptic('light')}
              >
                <Text style={styles.waterButtonText}>+{ml}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Meals Log */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <View style={styles.mealsHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={() => triggerHaptic('light')}
            >
              <Ionicons name="add" size={20} color="#3B82F6" />
              <Text style={styles.addMealText}>Add Meal</Text>
            </TouchableOpacity>
          </View>

          {meals.map((meal, index) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealCard}
              activeOpacity={0.7}
              onPress={() => triggerHaptic('light')}
            >
              <View style={styles.mealIcon}>
                <Ionicons name={meal.icon as any} size={24} color="#3B82F6" />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealCalories}>{meal.calories} cal</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Empty State for when no meals */}
        {meals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No meals logged yet</Text>
            <Text style={styles.emptyStateText}>
              Tap the mic button or use the camera to log your first meal
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  caloriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  caloriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  caloriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  caloriesRemaining: {
    fontSize: 14,
    color: '#6B7280',
  },
  caloriesRing: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  caloriesCenter: {
    alignItems: 'center',
  },
  caloriesConsumed: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: '#E5E7EB',
  },
  caloriesStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calorieStat: {
    alignItems: 'center',
  },
  calorieIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  calorieStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  macroPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  macroProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroValues: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  waterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  waterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  waterProgress: {
    marginBottom: 16,
  },
  waterProgressBar: {
    height: 8,
    backgroundColor: '#E0F2FE',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 4,
  },
  waterText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  waterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  waterButton: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  waterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  addMealText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bottomPadding: {
    height: 100,
  },
});
