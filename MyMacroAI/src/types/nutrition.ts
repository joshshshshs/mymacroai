// Nutrition-related type definitions

export interface FoodItem {
    id: string;
    name: string;
    brand?: string;
    servingSize: string;
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber?: number; // grams
    sugar?: number; // grams
    sodium?: number; // mg
    micronutrients?: Micronutrient[];
    category: FoodCategory;
}

export interface Micronutrient {
    name: string;
    amount: number;
    unit: string;
    dailyValue?: number; // percentage
}

export type FoodCategory =
    | 'fruit'
    | 'vegetable'
    | 'protein'
    | 'grain'
    | 'dairy'
    | 'fat'
    | 'beverage'
    | 'snack'
    | 'other';

export interface MealPlan {
    id: string;
    name: string;
    description?: string;
    meals: Meal[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    createdAt: string;
    updatedAt: string;
}

export interface Meal {
    id: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    name: string;
    foods: MealFood[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    preparationTime?: number; // minutes
    difficulty?: 'easy' | 'medium' | 'hard';
}

export interface MealFood {
    food: FoodItem;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface NutritionGoal {
    id: string;
    type: 'calorie' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'water';
    target: number;
    unit: string;
    timeframe: 'daily' | 'weekly' | 'monthly';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
}

export interface NutritionLog {
    id: string;
    date: string;
    meals: Meal[];
    waterIntake: number; // ml
    supplements?: Supplement[];
    notes?: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
}

export interface Supplement {
    id: string;
    name: string;
    dosage: string;
    timing: 'morning' | 'afternoon' | 'evening' | 'withMeal';
    frequency: 'daily' | 'weekly' | 'asNeeded';
}

export interface DietaryRestriction {
    type: 'allergy' | 'intolerance' | 'preference' | 'religious';
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    description?: string;
}
