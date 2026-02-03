/**
 * Open Food Facts API Service
 * 
 * Free food database API with no authentication required.
 * Returns comprehensive nutritional data including macros and micronutrients.
 * 
 * API Docs: https://wiki.openfoodfacts.org/API
 */

import { FoodItem, NUTRIENT_IDS, NutrientData } from '../types/food';

const BASE_URL = 'https://world.openfoodfacts.org';

// ============================================================================
// TYPES
// ============================================================================

interface OpenFoodFactsProduct {
    code: string;
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    image_url?: string;
    image_front_url?: string;
    serving_size?: string;
    serving_quantity?: number;
    nutriments?: {
        energy_kcal_100g?: number;
        'energy-kcal_100g'?: number;
        proteins_100g?: number;
        carbohydrates_100g?: number;
        fat_100g?: number;
        fiber_100g?: number;
        sugars_100g?: number;
        'saturated-fat_100g'?: number;
        sodium_100g?: number;
        salt_100g?: number;
        'vitamin-a_100g'?: number;
        'vitamin-c_100g'?: number;
        'vitamin-d_100g'?: number;
        'vitamin-e_100g'?: number;
        'vitamin-k_100g'?: number;
        'vitamin-b6_100g'?: number;
        'vitamin-b12_100g'?: number;
        calcium_100g?: number;
        iron_100g?: number;
        magnesium_100g?: number;
        potassium_100g?: number;
        zinc_100g?: number;
        cholesterol_100g?: number;
    };
    categories_tags?: string[];
    nutrition_grade_fr?: string;
}

interface SearchResponse {
    count: number;
    page: number;
    page_size: number;
    products: OpenFoodFactsProduct[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse serving size string to get numeric value and unit
 */
function parseServingSize(servingStr?: string): { size: number; unit: string } {
    if (!servingStr) return { size: 100, unit: 'g' };

    const match = servingStr.match(/(\d+(?:\.\d+)?)\s*(g|ml|oz|cup|tbsp|tsp)?/i);
    if (match) {
        return {
            size: parseFloat(match[1]),
            unit: match[2]?.toLowerCase() || 'g',
        };
    }
    return { size: 100, unit: 'g' };
}

/**
 * Build micronutrients array from API data
 */
function buildMicronutrients(nutriments: OpenFoodFactsProduct['nutriments']): NutrientData[] {
    if (!nutriments) return [];

    const micros: NutrientData[] = [];

    // Vitamins
    if (nutriments['vitamin-a_100g']) {
        micros.push({
            id: NUTRIENT_IDS.VITAMIN_A,
            name: 'Vitamin A',
            amount: nutriments['vitamin-a_100g'] * 1000, // Convert to mcg
            unit: 'mcg',
            dailyValuePercentage: Math.round((nutriments['vitamin-a_100g'] / 0.9) * 100),
            category: 'vitamin',
        });
    }

    if (nutriments['vitamin-c_100g']) {
        micros.push({
            id: NUTRIENT_IDS.VITAMIN_C,
            name: 'Vitamin C',
            amount: nutriments['vitamin-c_100g'],
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments['vitamin-c_100g'] / 90) * 100),
            category: 'vitamin',
        });
    }

    if (nutriments['vitamin-d_100g']) {
        micros.push({
            id: NUTRIENT_IDS.VITAMIN_D,
            name: 'Vitamin D',
            amount: nutriments['vitamin-d_100g'],
            unit: 'mcg',
            dailyValuePercentage: Math.round((nutriments['vitamin-d_100g'] / 20) * 100),
            category: 'vitamin',
        });
    }

    if (nutriments['vitamin-b6_100g']) {
        micros.push({
            id: NUTRIENT_IDS.VITAMIN_B6,
            name: 'Vitamin B6',
            amount: nutriments['vitamin-b6_100g'],
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments['vitamin-b6_100g'] / 1.7) * 100),
            category: 'vitamin',
        });
    }

    if (nutriments['vitamin-b12_100g']) {
        micros.push({
            id: NUTRIENT_IDS.VITAMIN_B12,
            name: 'Vitamin B12',
            amount: nutriments['vitamin-b12_100g'],
            unit: 'mcg',
            dailyValuePercentage: Math.round((nutriments['vitamin-b12_100g'] / 2.4) * 100),
            category: 'vitamin',
        });
    }

    // Minerals
    if (nutriments.calcium_100g) {
        micros.push({
            id: NUTRIENT_IDS.CALCIUM,
            name: 'Calcium',
            amount: nutriments.calcium_100g,
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments.calcium_100g / 1300) * 100),
            category: 'mineral',
        });
    }

    if (nutriments.iron_100g) {
        micros.push({
            id: NUTRIENT_IDS.IRON,
            name: 'Iron',
            amount: nutriments.iron_100g,
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments.iron_100g / 18) * 100),
            category: 'mineral',
        });
    }

    if (nutriments.magnesium_100g) {
        micros.push({
            id: NUTRIENT_IDS.MAGNESIUM,
            name: 'Magnesium',
            amount: nutriments.magnesium_100g,
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments.magnesium_100g / 420) * 100),
            category: 'mineral',
        });
    }

    if (nutriments.potassium_100g) {
        micros.push({
            id: NUTRIENT_IDS.POTASSIUM,
            name: 'Potassium',
            amount: nutriments.potassium_100g,
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments.potassium_100g / 4700) * 100),
            category: 'mineral',
        });
    }

    if (nutriments.zinc_100g) {
        micros.push({
            id: NUTRIENT_IDS.ZINC,
            name: 'Zinc',
            amount: nutriments.zinc_100g,
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments.zinc_100g / 11) * 100),
            category: 'mineral',
        });
    }

    // Other
    if (nutriments.sodium_100g || nutriments.salt_100g) {
        const sodium = nutriments.sodium_100g || (nutriments.salt_100g ? nutriments.salt_100g * 0.4 : 0);
        micros.push({
            id: NUTRIENT_IDS.SODIUM,
            name: 'Sodium',
            amount: sodium * 1000, // Convert to mg
            unit: 'mg',
            dailyValuePercentage: Math.round((sodium * 1000 / 2300) * 100),
            category: 'other',
        });
    }

    if (nutriments.cholesterol_100g) {
        micros.push({
            id: NUTRIENT_IDS.CHOLESTEROL,
            name: 'Cholesterol',
            amount: nutriments.cholesterol_100g * 1000, // Convert to mg
            unit: 'mg',
            dailyValuePercentage: Math.round((nutriments.cholesterol_100g * 1000 / 300) * 100),
            category: 'other',
        });
    }

    return micros;
}

/**
 * Convert Open Food Facts product to our FoodItem format
 */
function convertToFoodItem(product: OpenFoodFactsProduct): FoodItem | null {
    const name = product.product_name_en || product.product_name;
    if (!name) return null;

    const nutriments = product.nutriments || {};
    const serving = parseServingSize(product.serving_size);

    return {
        id: `off-${product.code}`,
        name: name,
        brand: product.brands,
        category: product.categories_tags?.[0]?.replace(/-/g, ' ') || undefined,
        imageUrl: product.image_front_url || product.image_url,
        barcode: product.code,
        isVerified: !!product.nutrition_grade_fr,
        servingSize: serving.size,
        servingUnit: (serving.unit === 'ml' ? 'ml' : 'g') as 'g' | 'ml',
        servingDescription: product.serving_size || '100g',
        macros: {
            calories: Math.round(nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0),
            protein: Math.round(nutriments.proteins_100g || 0),
            carbs: Math.round(nutriments.carbohydrates_100g || 0),
            fat: Math.round(nutriments.fat_100g || 0),
            fiber: Math.round(nutriments.fiber_100g || 0),
            sugar: Math.round(nutriments.sugars_100g || 0),
            saturatedFat: Math.round(nutriments['saturated-fat_100g'] || 0),
        },
        micronutrients: buildMicronutrients(nutriments),
    };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Search foods by name
 * @param query - Search query
 * @param page - Page number (1-indexed)
 * @param pageSize - Results per page (max 100)
 */
export async function searchFoodsAPI(
    query: string,
    page: number = 1,
    pageSize: number = 24
): Promise<{ foods: FoodItem[]; total: number; hasMore: boolean }> {
    if (!query.trim()) {
        return { foods: [], total: 0, hasMore: false };
    }

    try {
        const url = `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}&fields=code,product_name,product_name_en,brands,image_url,image_front_url,serving_size,serving_quantity,nutriments,categories_tags,nutrition_grade_fr`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MyMacroAI/1.0 (contact@mymacro.ai)',
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data: SearchResponse = await response.json();

        const foods = data.products
            .map(convertToFoodItem)
            .filter((item): item is FoodItem => item !== null);

        return {
            foods,
            total: data.count,
            hasMore: page * pageSize < data.count,
        };
    } catch (error) {
        console.error('Food search error:', error);
        return { foods: [], total: 0, hasMore: false };
    }
}

/**
 * Get food details by barcode
 */
export async function getFoodByBarcodeAPI(barcode: string): Promise<FoodItem | null> {
    try {
        const url = `${BASE_URL}/api/v0/product/${barcode}.json`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MyMacroAI/1.0 (contact@mymacro.ai)',
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 1 || !data.product) {
            return null;
        }

        return convertToFoodItem(data.product);
    } catch (error) {
        console.error('Barcode lookup error:', error);
        return null;
    }
}

/**
 * Get food details by ID (barcode extracted from our ID format)
 */
export async function getFoodByIdAPI(id: string): Promise<FoodItem | null> {
    // Our IDs are in format: off-{barcode}
    const barcode = id.replace('off-', '');
    return getFoodByBarcodeAPI(barcode);
}
