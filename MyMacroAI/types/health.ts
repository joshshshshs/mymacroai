// Health-related type definitions
export interface HealthData {
  type: 'steps' | 'calories' | 'distance' | 'heartRate' | 'sleep' | 'weight' | 'bodyFat' | 'hydration';
  value: number;
  unit: string;
  source: 'healthkit' | 'healthconnect' | 'manual';
  timestamp: string;
}

export interface SyncResult {
  success: boolean;
  data: HealthData[];
  syncedAt: Date;
  errors: string[];
}

export interface HealthSyncConfig {
  enableBackgroundSync: boolean;
  syncInterval: number; // milliseconds
  dataTypes: string[];
}

export interface NutritionData {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  sodium?: number; // mg
  sugar?: number; // grams
  timestamp: string;
  notes?: string;
}

export interface WorkoutData {
  id: string;
  type: string;
  duration: number; // minutes
  caloriesBurned: number;
  intensity: 'low' | 'medium' | 'high';
  timestamp: string;
  notes?: string;
}

export interface SleepData {
  id: string;
  durationMinutes: number;
  quality?: number; // 1-10 scale
  bedtime?: string;
  wakeTime?: string;
  source?: 'healthkit' | 'healthconnect' | 'manual';
  timestamp: string;
  notes?: string;
}
