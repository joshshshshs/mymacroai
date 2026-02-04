import { useCallback, useState } from 'react';
import type { HealthData } from '@/src/types';
import { healthSyncService } from '../services/health/HealthSync';
import { useUserStore } from '@/src/store/UserStore';

export interface NutritionLogInput {
  foodItems: string[];
  mealType: string;
  calories: number;
  timestamp: string;
}

export interface WorkoutLogInput {
  activityType: string;
  duration: number;
  caloriesBurned: number;
  timestamp: string;
}

export interface WeightLogInput {
  value: number;
  unit: 'kg' | 'lb';
  timestamp: string;
}

interface HealthSummary {
  steps: number;
  activeCalories: number;
  distance: number;
  hydration: number;
  sleepMinutes: number;
  heartRate: number | null;
  weight: number | null;
  bodyFat: number | null;
}

const DEFAULT_SUMMARY: HealthSummary = {
  steps: 0,
  activeCalories: 0,
  distance: 0,
  hydration: 0,
  sleepMinutes: 0,
  heartRate: null,
  weight: null,
  bodyFat: null,
};

const summarizeHealthData = (data: HealthData[]): HealthSummary => {
  const summary = { ...DEFAULT_SUMMARY };
  const heartRates: number[] = [];

  data.forEach((item) => {
    switch (item.type) {
      case 'steps':
        summary.steps += item.value;
        break;
      case 'calories':
        summary.activeCalories += item.value;
        break;
      case 'distance':
        summary.distance += item.value;
        break;
      case 'hydration':
        summary.hydration += item.value;
        break;
      case 'sleep':
        summary.sleepMinutes += item.value;
        break;
      case 'heartRate':
        heartRates.push(item.value);
        break;
      case 'weight':
        summary.weight = item.value;
        break;
      case 'bodyFat':
        summary.bodyFat = item.value;
        break;
      default:
        break;
    }
  });

  if (heartRates.length > 0) {
    const total = heartRates.reduce((acc, value) => acc + value, 0);
    summary.heartRate = Math.round(total / heartRates.length);
  }

  return summary;
};

// Health Hook
export function useHealth() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  const {
    preferences,
    updateHealthMetrics,
    setDailyTargetAdjustment,
    addDailyLog,
    logFood,
  } = useUserStore((state) => ({
    preferences: state.preferences,
    updateHealthMetrics: state.updateHealthMetrics,
    setDailyTargetAdjustment: state.setDailyTargetAdjustment,
    addDailyLog: state.addDailyLog,
    logFood: state.logFood,
  }));

  const fetchHealthData = useCallback(
    async (options?: { startDate?: Date; endDate?: Date }) => {
      if (!preferences.healthSync) {
        return null;
      }

      setIsSyncing(true);
      setLastSyncError(null);

      try {
        const initialized = await healthSyncService.initialize();
        if (!initialized) {
          throw new Error('Health sync initialization failed');
        }

        const endDate = options?.endDate ?? new Date();
        const startDate =
          options?.startDate ?? new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

        const result = await healthSyncService.syncHealthData(startDate, endDate);
        if (!result.success) {
          throw new Error('Health sync returned errors');
        }

        const summary = summarizeHealthData(result.data || []);

        updateHealthMetrics({
          steps: summary.steps,
          activeCalories: summary.activeCalories,
          distance: summary.distance,
          hydration: summary.hydration || null,
          sleepMinutes: summary.sleepMinutes || null,
          heartRate: summary.heartRate,
          weight: summary.weight,
          bodyFat: summary.bodyFat,
        });

        if (summary.activeCalories > 0) {
          setDailyTargetAdjustment({
            calories: Math.round(summary.activeCalories * 0.5),
          });
        } else {
          setDailyTargetAdjustment({ calories: 0 });
        }

        return summary;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Health sync failed';
        setLastSyncError(message);
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [preferences.healthSync, setDailyTargetAdjustment, updateHealthMetrics]
  );

  const updateHealthData = useCallback(
    async (data: Omit<HealthData, 'source' | 'timestamp'> & { timestamp?: string }) => {
      if (!preferences.healthSync) return false;
      const initialized = await healthSyncService.initialize();
      if (!initialized) return false;

      try {
        await healthSyncService.writeHealthData({
          type: data.type,
          value: data.value,
          unit: data.unit,
        });
        return true;
      } catch {
        return false;
      }
    },
    [preferences.healthSync]
  );

  const logNutrition = useCallback(
    async (data: NutritionLogInput) => {
      logFood(data.calories, 0, 0, 0, data.foodItems.join(', '));
      addDailyLog({
        id: Date.now().toString(),
        type: 'nutrition',
        date: data.timestamp,
        timestamp: Date.now(),
        nutritionData: {
          id: Date.now().toString(),
          mealType: (data.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown') || 'unknown',
          calories: data.calories,
          protein: 0,
          carbs: 0,
          fat: 0,
          timestamp: data.timestamp,
        },
        createdAt: data.timestamp,
      });
    },
    [addDailyLog, logFood]
  );

  const logWorkout = useCallback(
    async (data: WorkoutLogInput) => {
      addDailyLog({
        id: Date.now().toString(),
        type: 'workout',
        date: data.timestamp,
        timestamp: Date.now(),
        activityData: {
          id: Date.now().toString(),
          type: data.activityType,
          duration: data.duration,
          caloriesBurned: data.caloriesBurned,
          intensity: 'medium',
          timestamp: data.timestamp,
        },
        createdAt: data.timestamp,
      });
    },
    [addDailyLog]
  );

  const logWeight = useCallback(
    async (data: WeightLogInput) => {
      const weightInKg = data.unit === 'lb' ? data.value * 0.453592 : data.value;

      updateHealthMetrics({
        weight: weightInKg,
      });

      addDailyLog({
        id: Date.now().toString(),
        type: 'weight',
        date: data.timestamp,
        timestamp: Date.now(),
        notes: `Weight log: ${weightInKg.toFixed(1)} kg`,
        createdAt: data.timestamp,
      });

      await updateHealthData({
        type: 'weight',
        value: weightInKg,
        unit: 'kg',
      });
    },
    [addDailyLog, updateHealthData, updateHealthMetrics]
  );

  return {
    healthData: null,
    fetchHealthData,
    updateHealthData,
    logNutrition,
    logWorkout,
    logWeight,
    isSyncing,
    lastSyncError,
  };
}
