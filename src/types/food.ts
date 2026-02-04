/**
 * Food Data Types - USDA-Grade Schema
 * 
 * Mirrors the USDA FoodData Central structure for verified nutritional data.
 * Supports 30+ micronutrients with scalable NutrientData array.
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface FoodItem {
    id: string;
    name: string;
    brand?: string;
    category?: string;
    imageUrl?: string;
    barcode?: string;

    /** TRUE if from verified source (USDA/OpenFoodFacts) */
    isVerified: boolean;

    /** Base reference amount (typically 100) */
    servingSize: number;
    servingUnit: 'g' | 'ml';

    /** Common serving description (e.g., "1 medium", "1 cup") */
    servingDescription?: string;

    /** The "Big 3" - Quick Access Macros */
    macros: MacroData;

    /** The "Micro-Matrix" - Detailed Nutrient Array */
    micronutrients: NutrientData[];
}

export interface MacroData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    saturatedFat?: number;
}

export interface NutrientData {
    /** USDA Standard Nutrient ID (e.g., '301' for Calcium) */
    id: string;
    name: string;
    amount: number;
    unit: 'mg' | 'µg' | 'g' | 'IU' | 'mcg';
    /** Percentage of Daily Value (if applicable) */
    dailyValuePercentage?: number;
    /** Category for grouping in UI */
    category: 'vitamin' | 'mineral' | 'other';
}

// ============================================================================
// NUTRIENT CONSTANTS (USDA Standard IDs)
// ============================================================================

export const NUTRIENT_IDS = {
    // Vitamins
    VITAMIN_A: '318',
    VITAMIN_C: '401',
    VITAMIN_D: '328',
    VITAMIN_E: '323',
    VITAMIN_K: '430',
    VITAMIN_B6: '415',
    VITAMIN_B12: '418',
    THIAMIN: '404',
    RIBOFLAVIN: '405',
    NIACIN: '406',
    FOLATE: '417',

    // Minerals
    CALCIUM: '301',
    IRON: '303',
    MAGNESIUM: '304',
    PHOSPHORUS: '305',
    POTASSIUM: '306',
    SODIUM: '307',
    ZINC: '309',
    COPPER: '312',
    MANGANESE: '315',
    SELENIUM: '317',

    // Other
    CHOLESTEROL: '601',
    OMEGA_3_DHA: '621',
    OMEGA_3_EPA: '629',
} as const;

// ============================================================================
// DAILY VALUE REFERENCES (FDA 2020)
// ============================================================================

export const DAILY_VALUES: Record<string, number> = {
    // Vitamins
    [NUTRIENT_IDS.VITAMIN_A]: 900, // mcg
    [NUTRIENT_IDS.VITAMIN_C]: 90, // mg
    [NUTRIENT_IDS.VITAMIN_D]: 20, // mcg
    [NUTRIENT_IDS.VITAMIN_E]: 15, // mg
    [NUTRIENT_IDS.VITAMIN_K]: 120, // mcg
    [NUTRIENT_IDS.VITAMIN_B6]: 1.7, // mg
    [NUTRIENT_IDS.VITAMIN_B12]: 2.4, // mcg
    [NUTRIENT_IDS.THIAMIN]: 1.2, // mg
    [NUTRIENT_IDS.RIBOFLAVIN]: 1.3, // mg
    [NUTRIENT_IDS.NIACIN]: 16, // mg
    [NUTRIENT_IDS.FOLATE]: 400, // mcg

    // Minerals
    [NUTRIENT_IDS.CALCIUM]: 1300, // mg
    [NUTRIENT_IDS.IRON]: 18, // mg
    [NUTRIENT_IDS.MAGNESIUM]: 420, // mg
    [NUTRIENT_IDS.PHOSPHORUS]: 1250, // mg
    [NUTRIENT_IDS.POTASSIUM]: 4700, // mg
    [NUTRIENT_IDS.SODIUM]: 2300, // mg
    [NUTRIENT_IDS.ZINC]: 11, // mg
    [NUTRIENT_IDS.COPPER]: 0.9, // mg
    [NUTRIENT_IDS.MANGANESE]: 2.3, // mg
    [NUTRIENT_IDS.SELENIUM]: 55, // mcg

    // Other
    [NUTRIENT_IDS.CHOLESTEROL]: 300, // mg
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate nutrient values based on portion size
 */
export function calculatePortionNutrients(
    food: FoodItem,
    portionGrams: number
): FoodItem {
    const ratio = portionGrams / food.servingSize;

    return {
        ...food,
        servingSize: portionGrams,
        macros: {
            calories: Math.round(food.macros.calories * ratio),
            protein: Math.round(food.macros.protein * ratio * 10) / 10,
            carbs: Math.round(food.macros.carbs * ratio * 10) / 10,
            fat: Math.round(food.macros.fat * ratio * 10) / 10,
            fiber: food.macros.fiber ? Math.round(food.macros.fiber * ratio * 10) / 10 : undefined,
            sugar: food.macros.sugar ? Math.round(food.macros.sugar * ratio * 10) / 10 : undefined,
            saturatedFat: food.macros.saturatedFat ? Math.round(food.macros.saturatedFat * ratio * 10) / 10 : undefined,
        },
        micronutrients: food.micronutrients.map(nutrient => ({
            ...nutrient,
            amount: Math.round(nutrient.amount * ratio * 100) / 100,
            dailyValuePercentage: nutrient.dailyValuePercentage
                ? Math.round(nutrient.dailyValuePercentage * ratio)
                : undefined,
        })),
    };
}

/**
 * Calculate Daily Value percentage for a nutrient
 */
export function getDailyValuePercentage(nutrientId: string, amount: number): number | undefined {
    const dv = DAILY_VALUES[nutrientId];
    if (!dv) return undefined;
    return Math.round((amount / dv) * 100);
}
