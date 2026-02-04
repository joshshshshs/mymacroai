
// Core shared types to prevent circular dependencies
export interface User {
    id: string;
    name: string;
    email: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    height?: number; // cm
    weight?: number; // kg
    fitnessGoals?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    healthSync: boolean;
    aiRecommendations: boolean;
    language: string;
    measurementSystem: 'metric' | 'imperial';
    dietaryPreferences: string[];
    fitnessGoals: string[];
    notificationSchedule: {
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
    };
    // Custom reaction emojis for social feed (4 slots)
    customReactionEmojis: string[];
    // App experience
    haptics: boolean;
    aiVoice: 'coach_alex' | 'coach_maya' | 'coach_marcus' | 'coach_sophia';
    // Sleep scheduling preferences
    unwindEnabled?: boolean;
    dndEnabled?: boolean;
    unwindTime?: string;
    bedtime?: string;
    wakeTime?: string;
    sleepReminder?: boolean;
}

export interface HealthData {
    type: 'steps' | 'calories' | 'distance' | 'heartRate' | 'sleep' | 'weight' | 'bodyFat' | 'hydration';
    value: number;
    unit: string;
    source: 'healthkit' | 'healthconnect' | 'manual';
    timestamp: string;
}

export interface NutritionData {
    id: string;
    name?: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium?: number;
    sugar?: number;
    timestamp: string;
    notes?: string;
}
