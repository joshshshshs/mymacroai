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

// Health Hook
export function useHealth() {
  return {
    healthData: null,
    fetchHealthData: () => {},
    updateHealthData: () => {},
    logNutrition: async (_data: NutritionLogInput) => {},
    logWorkout: async (_data: WorkoutLogInput) => {},
    logWeight: async (_data: WeightLogInput) => {},
  };
}
