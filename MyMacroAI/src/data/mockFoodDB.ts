/**
 * Mock Food Database - USDA-Verified Data
 *
 * Contains 5 verified foods with accurate nutritional data from USDA FoodData Central.
 * All values are per 100g serving.
 *
 * NOTE: In production, food data comes from external API or Supabase.
 * This mock data is for development/testing only.
 */

import { FoodItem, NUTRIENT_IDS } from '../types/food';

// Production guard - don't use mock data in production
const IS_PRODUCTION = !__DEV__;

// ============================================================================
// VERIFIED FOOD DATABASE
// ============================================================================

export const MOCK_FOOD_DB: FoodItem[] = [
    // 1. CHICKEN BREAST (Raw, Boneless, Skinless)
    // USDA FDC ID: 171077
    {
        id: 'usda-171077',
        name: 'Chicken Breast',
        brand: undefined,
        category: 'Protein',
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
        barcode: '0012345678901',
        isVerified: true,
        servingSize: 100,
        servingUnit: 'g',
        servingDescription: '3.5 oz',
        macros: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0,
            saturatedFat: 1,
        },
        micronutrients: [
            { id: NUTRIENT_IDS.VITAMIN_B6, name: 'Vitamin B6', amount: 0.6, unit: 'mg', dailyValuePercentage: 35, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_B12, name: 'Vitamin B12', amount: 0.34, unit: 'mcg', dailyValuePercentage: 14, category: 'vitamin' },
            { id: NUTRIENT_IDS.NIACIN, name: 'Niacin (B3)', amount: 13.7, unit: 'mg', dailyValuePercentage: 86, category: 'vitamin' },
            { id: NUTRIENT_IDS.RIBOFLAVIN, name: 'Riboflavin (B2)', amount: 0.1, unit: 'mg', dailyValuePercentage: 8, category: 'vitamin' },
            { id: NUTRIENT_IDS.THIAMIN, name: 'Thiamin (B1)', amount: 0.06, unit: 'mg', dailyValuePercentage: 5, category: 'vitamin' },
            { id: NUTRIENT_IDS.IRON, name: 'Iron', amount: 0.7, unit: 'mg', dailyValuePercentage: 4, category: 'mineral' },
            { id: NUTRIENT_IDS.PHOSPHORUS, name: 'Phosphorus', amount: 228, unit: 'mg', dailyValuePercentage: 18, category: 'mineral' },
            { id: NUTRIENT_IDS.POTASSIUM, name: 'Potassium', amount: 256, unit: 'mg', dailyValuePercentage: 5, category: 'mineral' },
            { id: NUTRIENT_IDS.SELENIUM, name: 'Selenium', amount: 27.6, unit: 'mcg', dailyValuePercentage: 50, category: 'mineral' },
            { id: NUTRIENT_IDS.ZINC, name: 'Zinc', amount: 0.7, unit: 'mg', dailyValuePercentage: 6, category: 'mineral' },
            { id: NUTRIENT_IDS.MAGNESIUM, name: 'Magnesium', amount: 29, unit: 'mg', dailyValuePercentage: 7, category: 'mineral' },
            { id: NUTRIENT_IDS.SODIUM, name: 'Sodium', amount: 74, unit: 'mg', dailyValuePercentage: 3, category: 'other' },
            { id: NUTRIENT_IDS.CHOLESTEROL, name: 'Cholesterol', amount: 85, unit: 'mg', dailyValuePercentage: 28, category: 'other' },
        ],
    },

    // 2. AVOCADO (Hass, Raw)
    // USDA FDC ID: 171705
    {
        id: 'usda-171705',
        name: 'Avocado (Hass)',
        brand: undefined,
        category: 'Fruit',
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
        barcode: '0012345678902',
        isVerified: true,
        servingSize: 100,
        servingUnit: 'g',
        servingDescription: '½ medium',
        macros: {
            calories: 160,
            protein: 2,
            carbs: 8.5,
            fat: 14.7,
            fiber: 6.7,
            sugar: 0.7,
            saturatedFat: 2.1,
        },
        micronutrients: [
            { id: NUTRIENT_IDS.VITAMIN_C, name: 'Vitamin C', amount: 10, unit: 'mg', dailyValuePercentage: 11, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_E, name: 'Vitamin E', amount: 2.07, unit: 'mg', dailyValuePercentage: 14, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_K, name: 'Vitamin K', amount: 21, unit: 'mcg', dailyValuePercentage: 18, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_B6, name: 'Vitamin B6', amount: 0.26, unit: 'mg', dailyValuePercentage: 15, category: 'vitamin' },
            { id: NUTRIENT_IDS.FOLATE, name: 'Folate', amount: 81, unit: 'mcg', dailyValuePercentage: 20, category: 'vitamin' },
            { id: NUTRIENT_IDS.POTASSIUM, name: 'Potassium', amount: 485, unit: 'mg', dailyValuePercentage: 10, category: 'mineral' },
            { id: NUTRIENT_IDS.MAGNESIUM, name: 'Magnesium', amount: 29, unit: 'mg', dailyValuePercentage: 7, category: 'mineral' },
            { id: NUTRIENT_IDS.COPPER, name: 'Copper', amount: 0.19, unit: 'mg', dailyValuePercentage: 21, category: 'mineral' },
            { id: NUTRIENT_IDS.MANGANESE, name: 'Manganese', amount: 0.14, unit: 'mg', dailyValuePercentage: 6, category: 'mineral' },
            { id: NUTRIENT_IDS.PHOSPHORUS, name: 'Phosphorus', amount: 52, unit: 'mg', dailyValuePercentage: 4, category: 'mineral' },
            { id: NUTRIENT_IDS.ZINC, name: 'Zinc', amount: 0.64, unit: 'mg', dailyValuePercentage: 6, category: 'mineral' },
            { id: NUTRIENT_IDS.SODIUM, name: 'Sodium', amount: 7, unit: 'mg', dailyValuePercentage: 0, category: 'other' },
            { id: NUTRIENT_IDS.CHOLESTEROL, name: 'Cholesterol', amount: 0, unit: 'mg', dailyValuePercentage: 0, category: 'other' },
        ],
    },

    // 3. SPINACH (Raw)
    // USDA FDC ID: 168462
    {
        id: 'usda-168462',
        name: 'Spinach (Raw)',
        brand: undefined,
        category: 'Vegetable',
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
        barcode: '0012345678903',
        isVerified: true,
        servingSize: 100,
        servingUnit: 'g',
        servingDescription: '3 cups',
        macros: {
            calories: 23,
            protein: 2.9,
            carbs: 3.6,
            fat: 0.4,
            fiber: 2.2,
            sugar: 0.4,
            saturatedFat: 0.1,
        },
        micronutrients: [
            { id: NUTRIENT_IDS.VITAMIN_A, name: 'Vitamin A', amount: 469, unit: 'mcg', dailyValuePercentage: 52, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_C, name: 'Vitamin C', amount: 28.1, unit: 'mg', dailyValuePercentage: 31, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_K, name: 'Vitamin K', amount: 482.9, unit: 'mcg', dailyValuePercentage: 402, category: 'vitamin' },
            { id: NUTRIENT_IDS.FOLATE, name: 'Folate', amount: 194, unit: 'mcg', dailyValuePercentage: 49, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_E, name: 'Vitamin E', amount: 2.03, unit: 'mg', dailyValuePercentage: 14, category: 'vitamin' },
            { id: NUTRIENT_IDS.IRON, name: 'Iron', amount: 2.71, unit: 'mg', dailyValuePercentage: 15, category: 'mineral' },
            { id: NUTRIENT_IDS.CALCIUM, name: 'Calcium', amount: 99, unit: 'mg', dailyValuePercentage: 8, category: 'mineral' },
            { id: NUTRIENT_IDS.MAGNESIUM, name: 'Magnesium', amount: 79, unit: 'mg', dailyValuePercentage: 19, category: 'mineral' },
            { id: NUTRIENT_IDS.POTASSIUM, name: 'Potassium', amount: 558, unit: 'mg', dailyValuePercentage: 12, category: 'mineral' },
            { id: NUTRIENT_IDS.MANGANESE, name: 'Manganese', amount: 0.9, unit: 'mg', dailyValuePercentage: 39, category: 'mineral' },
            { id: NUTRIENT_IDS.ZINC, name: 'Zinc', amount: 0.53, unit: 'mg', dailyValuePercentage: 5, category: 'mineral' },
            { id: NUTRIENT_IDS.SODIUM, name: 'Sodium', amount: 79, unit: 'mg', dailyValuePercentage: 3, category: 'other' },
            { id: NUTRIENT_IDS.CHOLESTEROL, name: 'Cholesterol', amount: 0, unit: 'mg', dailyValuePercentage: 0, category: 'other' },
        ],
    },

    // 4. OATS (Rolled, Dry)
    // USDA FDC ID: 169705
    {
        id: 'usda-169705',
        name: 'Oats (Rolled)',
        brand: undefined,
        category: 'Grain',
        imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
        barcode: '0012345678904',
        isVerified: true,
        servingSize: 100,
        servingUnit: 'g',
        servingDescription: '1 cup dry',
        macros: {
            calories: 389,
            protein: 16.9,
            carbs: 66.3,
            fat: 6.9,
            fiber: 10.6,
            sugar: 0,
            saturatedFat: 1.2,
        },
        micronutrients: [
            { id: NUTRIENT_IDS.THIAMIN, name: 'Thiamin (B1)', amount: 0.76, unit: 'mg', dailyValuePercentage: 63, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_B6, name: 'Vitamin B6', amount: 0.12, unit: 'mg', dailyValuePercentage: 7, category: 'vitamin' },
            { id: NUTRIENT_IDS.FOLATE, name: 'Folate', amount: 56, unit: 'mcg', dailyValuePercentage: 14, category: 'vitamin' },
            { id: NUTRIENT_IDS.IRON, name: 'Iron', amount: 4.72, unit: 'mg', dailyValuePercentage: 26, category: 'mineral' },
            { id: NUTRIENT_IDS.MAGNESIUM, name: 'Magnesium', amount: 177, unit: 'mg', dailyValuePercentage: 42, category: 'mineral' },
            { id: NUTRIENT_IDS.PHOSPHORUS, name: 'Phosphorus', amount: 523, unit: 'mg', dailyValuePercentage: 42, category: 'mineral' },
            { id: NUTRIENT_IDS.POTASSIUM, name: 'Potassium', amount: 429, unit: 'mg', dailyValuePercentage: 9, category: 'mineral' },
            { id: NUTRIENT_IDS.ZINC, name: 'Zinc', amount: 3.97, unit: 'mg', dailyValuePercentage: 36, category: 'mineral' },
            { id: NUTRIENT_IDS.COPPER, name: 'Copper', amount: 0.63, unit: 'mg', dailyValuePercentage: 70, category: 'mineral' },
            { id: NUTRIENT_IDS.MANGANESE, name: 'Manganese', amount: 4.92, unit: 'mg', dailyValuePercentage: 214, category: 'mineral' },
            { id: NUTRIENT_IDS.SELENIUM, name: 'Selenium', amount: 34, unit: 'mcg', dailyValuePercentage: 62, category: 'mineral' },
            { id: NUTRIENT_IDS.SODIUM, name: 'Sodium', amount: 2, unit: 'mg', dailyValuePercentage: 0, category: 'other' },
            { id: NUTRIENT_IDS.CHOLESTEROL, name: 'Cholesterol', amount: 0, unit: 'mg', dailyValuePercentage: 0, category: 'other' },
        ],
    },

    // 5. SALMON (Atlantic, Raw)
    // USDA FDC ID: 175167
    {
        id: 'usda-175167',
        name: 'Salmon (Atlantic)',
        brand: undefined,
        category: 'Seafood',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
        barcode: '0012345678905',
        isVerified: true,
        servingSize: 100,
        servingUnit: 'g',
        servingDescription: '3.5 oz fillet',
        macros: {
            calories: 208,
            protein: 20.4,
            carbs: 0,
            fat: 13.4,
            fiber: 0,
            sugar: 0,
            saturatedFat: 3,
        },
        micronutrients: [
            { id: NUTRIENT_IDS.VITAMIN_D, name: 'Vitamin D', amount: 11.1, unit: 'mcg', dailyValuePercentage: 56, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_B12, name: 'Vitamin B12', amount: 3.18, unit: 'mcg', dailyValuePercentage: 133, category: 'vitamin' },
            { id: NUTRIENT_IDS.VITAMIN_B6, name: 'Vitamin B6', amount: 0.64, unit: 'mg', dailyValuePercentage: 38, category: 'vitamin' },
            { id: NUTRIENT_IDS.NIACIN, name: 'Niacin (B3)', amount: 8.4, unit: 'mg', dailyValuePercentage: 53, category: 'vitamin' },
            { id: NUTRIENT_IDS.THIAMIN, name: 'Thiamin (B1)', amount: 0.23, unit: 'mg', dailyValuePercentage: 19, category: 'vitamin' },
            { id: NUTRIENT_IDS.RIBOFLAVIN, name: 'Riboflavin (B2)', amount: 0.38, unit: 'mg', dailyValuePercentage: 29, category: 'vitamin' },
            { id: NUTRIENT_IDS.SELENIUM, name: 'Selenium', amount: 40.4, unit: 'mcg', dailyValuePercentage: 73, category: 'mineral' },
            { id: NUTRIENT_IDS.PHOSPHORUS, name: 'Phosphorus', amount: 252, unit: 'mg', dailyValuePercentage: 20, category: 'mineral' },
            { id: NUTRIENT_IDS.POTASSIUM, name: 'Potassium', amount: 363, unit: 'mg', dailyValuePercentage: 8, category: 'mineral' },
            { id: NUTRIENT_IDS.MAGNESIUM, name: 'Magnesium', amount: 29, unit: 'mg', dailyValuePercentage: 7, category: 'mineral' },
            { id: NUTRIENT_IDS.ZINC, name: 'Zinc', amount: 0.64, unit: 'mg', dailyValuePercentage: 6, category: 'mineral' },
            { id: NUTRIENT_IDS.OMEGA_3_DHA, name: 'Omega-3 DHA', amount: 1457, unit: 'mg', dailyValuePercentage: undefined, category: 'other' },
            { id: NUTRIENT_IDS.OMEGA_3_EPA, name: 'Omega-3 EPA', amount: 862, unit: 'mg', dailyValuePercentage: undefined, category: 'other' },
            { id: NUTRIENT_IDS.SODIUM, name: 'Sodium', amount: 59, unit: 'mg', dailyValuePercentage: 3, category: 'other' },
            { id: NUTRIENT_IDS.CHOLESTEROL, name: 'Cholesterol', amount: 55, unit: 'mg', dailyValuePercentage: 18, category: 'other' },
        ],
    },
];

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search foods by name (case-insensitive)
 * In production, this returns empty - use real food API instead
 */
export function searchFoods(query: string): FoodItem[] {
    if (IS_PRODUCTION) return [];
    if (!query.trim()) return MOCK_FOOD_DB;

    const normalizedQuery = query.toLowerCase().trim();

    return MOCK_FOOD_DB
        .filter(food =>
            food.name.toLowerCase().includes(normalizedQuery) ||
            food.category?.toLowerCase().includes(normalizedQuery)
        )
        .sort((a, b) => {
            // Verified foods first
            if (a.isVerified && !b.isVerified) return -1;
            if (!a.isVerified && b.isVerified) return 1;

            // Exact matches first
            const aExact = a.name.toLowerCase().startsWith(normalizedQuery);
            const bExact = b.name.toLowerCase().startsWith(normalizedQuery);
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            return 0;
        });
}

/**
 * Find food by barcode
 * In production, this returns undefined - use real food API instead
 */
export function findFoodByBarcode(barcode: string): FoodItem | undefined {
    if (IS_PRODUCTION) return undefined;
    return MOCK_FOOD_DB.find(food => food.barcode === barcode);
}

/**
 * Get food by ID
 */
export function getFoodById(id: string): FoodItem | undefined {
    return MOCK_FOOD_DB.find(food => food.id === id);
}
