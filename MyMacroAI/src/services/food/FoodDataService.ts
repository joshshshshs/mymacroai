/**
 * FoodDataService - Hybrid Food Engine
 *
 * The "Brain" of food retrieval using a Tiered Logic System:
 * - Tier 1 (Verified USDA): Local mockFoodDB (highest trust, deep micronutrients)
 * - Tier 2 (OpenFoodFacts): External API for ~3 million products
 * - Tier 3 (AI Estimation): Fallback with Unverified flag
 */

import axios from 'axios';
import { FoodItem, MacroData, NutrientData, NUTRIENT_IDS } from '../../types/food';
import { searchFoods, findFoodByBarcode, getFoodById, MOCK_FOOD_DB } from '../../data/mockFoodDB';

// ============================================================================
// TYPES
// ============================================================================

interface OpenFoodFactsProduct {
    code: string;
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    categories?: string;
    image_url?: string;
    nutriments?: {
        'energy-kcal_100g'?: number;
        'energy-kcal'?: number;
        proteins_100g?: number;
        proteins?: number;
        carbohydrates_100g?: number;
        carbohydrates?: number;
        fat_100g?: number;
        fat?: number;
        fiber_100g?: number;
        fiber?: number;
        sugars_100g?: number;
        sugars?: number;
        'saturated-fat_100g'?: number;
        'saturated-fat'?: number;
        sodium_100g?: number;
        sodium?: number;
        calcium_100g?: number;
        iron_100g?: number;
        'vitamin-a_100g'?: number;
        'vitamin-c_100g'?: number;
        potassium_100g?: number;
        cholesterol_100g?: number;
    };
    serving_size?: string;
    serving_quantity?: number;
}

interface OpenFoodFactsSearchResponse {
    products: OpenFoodFactsProduct[];
    count: number;
    page: number;
    page_size: number;
}

interface OpenFoodFactsProductResponse {
    status: number;
    status_verbose: string;
    product?: OpenFoodFactsProduct;
}

export type DataSource = 'usda' | 'openfoodfacts' | 'ai_estimated';

export interface FoodItemWithSource extends FoodItem {
    dataSource: DataSource;
}

// ============================================================================
// OPENFOODFACTS API CONFIGURATION
// ============================================================================

const OFF_BASE_URL = 'https://world.openfoodfacts.org';
const OFF_SEARCH_URL = `${OFF_BASE_URL}/cgi/search.pl`;
const OFF_PRODUCT_URL = `${OFF_BASE_URL}/api/v2/product`;

// Timeout for API calls (5 seconds)
const API_TIMEOUT = 5000;

// User-Agent header required by OpenFoodFacts
const OFF_HEADERS = {
    'User-Agent': 'MyMacroAI/1.0 (https://mymacroai.com; contact@mymacroai.com)',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert OpenFoodFacts product to our FoodItem schema
 */
function mapOpenFoodFactsToFoodItem(product: OpenFoodFactsProduct): FoodItemWithSource | null {
    // Skip products without essential data
    const name = product.product_name || product.product_name_en;
    if (!name) return null;

    const nutriments = product.nutriments || {};

    // Get macros (prefer _100g values, fallback to base)
    const calories = nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0;
    const protein = nutriments.proteins_100g ?? nutriments.proteins ?? 0;
    const carbs = nutriments.carbohydrates_100g ?? nutriments.carbohydrates ?? 0;
    const fat = nutriments.fat_100g ?? nutriments.fat ?? 0;
    const fiber = nutriments.fiber_100g ?? nutriments.fiber;
    const sugar = nutriments.sugars_100g ?? nutriments.sugars;
    const saturatedFat = nutriments['saturated-fat_100g'] ?? nutriments['saturated-fat'];

    // Skip products with no calorie data (likely incomplete)
    if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) {
        return null;
    }

    const macros: MacroData = {
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        fiber: fiber !== undefined ? Math.round(fiber * 10) / 10 : undefined,
        sugar: sugar !== undefined ? Math.round(sugar * 10) / 10 : undefined,
        saturatedFat: saturatedFat !== undefined ? Math.round(saturatedFat * 10) / 10 : undefined,
    };

    // Build micronutrients array from available data
    const micronutrients: NutrientData[] = [];

    if (nutriments.sodium_100g !== undefined) {
        micronutrients.push({
            id: NUTRIENT_IDS.SODIUM,
            name: 'Sodium',
            amount: Math.round(nutriments.sodium_100g * 1000) / 1000, // Convert to mg if needed
            unit: 'mg',
            category: 'mineral',
        });
    }

    if (nutriments.calcium_100g !== undefined) {
        micronutrients.push({
            id: NUTRIENT_IDS.CALCIUM,
            name: 'Calcium',
            amount: Math.round(nutriments.calcium_100g * 10) / 10,
            unit: 'mg',
            category: 'mineral',
        });
    }

    if (nutriments.iron_100g !== undefined) {
        micronutrients.push({
            id: NUTRIENT_IDS.IRON,
            name: 'Iron',
            amount: Math.round(nutriments.iron_100g * 10) / 10,
            unit: 'mg',
            category: 'mineral',
        });
    }

    if (nutriments.potassium_100g !== undefined) {
        micronutrients.push({
            id: NUTRIENT_IDS.POTASSIUM,
            name: 'Potassium',
            amount: Math.round(nutriments.potassium_100g * 10) / 10,
            unit: 'mg',
            category: 'mineral',
        });
    }

    if (nutriments['vitamin-a_100g'] !== undefined) {
        micronutrients.push({
            id: NUTRIENT_IDS.VITAMIN_A,
            name: 'Vitamin A',
            amount: Math.round(nutriments['vitamin-a_100g'] * 10) / 10,
            unit: 'mcg',
            category: 'vitamin',
        });
    }

    if (nutriments['vitamin-c_100g'] !== undefined) {
        micronutrients.push({
            id: NUTRIENT_IDS.VITAMIN_C,
            name: 'Vitamin C',
            amount: Math.round(nutriments['vitamin-c_100g'] * 10) / 10,
            unit: 'mg',
            category: 'vitamin',
        });
    }

    if (nutriments.cholesterol_100g !== undefined) {
        micronutrients.push({
            id: NUTRIENT_IDS.CHOLESTEROL,
            name: 'Cholesterol',
            amount: Math.round(nutriments.cholesterol_100g * 10) / 10,
            unit: 'mg',
            category: 'other',
        });
    }

    return {
        id: `off-${product.code}`,
        name: name,
        brand: product.brands || undefined,
        category: product.categories?.split(',')[0]?.trim() || undefined,
        imageUrl: product.image_url || undefined,
        barcode: product.code,
        isVerified: false, // OpenFoodFacts data is crowd-sourced
        servingSize: 100,
        servingUnit: 'g',
        servingDescription: product.serving_size || undefined,
        macros,
        micronutrients,
        dataSource: 'openfoodfacts',
    };
}

/**
 * Add dataSource to local USDA food items
 */
function addSourceToLocalFood(food: FoodItem): FoodItemWithSource {
    return {
        ...food,
        dataSource: 'usda' as DataSource,
    };
}

// ============================================================================
// FOODDATASERVICE CLASS
// ============================================================================

class FoodDataServiceClass {
    /**
     * Search for foods using the hybrid tiered system
     * Tier 1: Local USDA database (verified, returns first)
     * Tier 2: OpenFoodFacts API (concurrent, merged below)
     */
    async search(query: string): Promise<FoodItemWithSource[]> {
        if (!query.trim()) {
            // Return all local foods if no query
            return MOCK_FOOD_DB.map(addSourceToLocalFood);
        }

        // Start both searches concurrently
        const [localResults, offResults] = await Promise.all([
            this.searchLocal(query),
            this.searchOpenFoodFacts(query).catch((error) => {
                console.warn('[FoodDataService] OpenFoodFacts search failed:', error.message);
                return []; // Graceful fallback if API fails
            }),
        ]);

        // Merge results: Verified USDA items first, then OpenFoodFacts
        const mergedResults: FoodItemWithSource[] = [...localResults];

        // Add OpenFoodFacts results that don't duplicate local items
        const localIds = new Set(localResults.map(f => f.name.toLowerCase()));
        for (const offFood of offResults) {
            // Skip if we already have a similar item from local DB
            if (!localIds.has(offFood.name.toLowerCase())) {
                mergedResults.push(offFood);
            }
        }

        return mergedResults;
    }

    /**
     * Search local USDA database
     */
    private searchLocal(query: string): FoodItemWithSource[] {
        const results = searchFoods(query);
        return results.map(addSourceToLocalFood);
    }

    /**
     * Search OpenFoodFacts API
     */
    private async searchOpenFoodFacts(query: string): Promise<FoodItemWithSource[]> {
        try {
            const response = await axios.get<OpenFoodFactsSearchResponse>(OFF_SEARCH_URL, {
                params: {
                    search_terms: query,
                    search_simple: 1,
                    action: 'process',
                    json: 1,
                    page_size: 20,
                    fields: 'code,product_name,product_name_en,brands,categories,image_url,nutriments,serving_size,serving_quantity',
                },
                headers: OFF_HEADERS,
                timeout: API_TIMEOUT,
            });

            const products = response.data.products || [];
            const mapped: FoodItemWithSource[] = [];

            for (const product of products) {
                const foodItem = mapOpenFoodFactsToFoodItem(product);
                if (foodItem) {
                    mapped.push(foodItem);
                }
            }

            return mapped;
        } catch (error) {
            // Re-throw to be handled by caller
            throw error;
        }
    }

    /**
     * Get food by barcode using the tiered system
     * Tier 1: Check local database for verified overrides
     * Tier 2: Query OpenFoodFacts API
     */
    async getByBarcode(code: string): Promise<FoodItemWithSource | null> {
        // First, check local database (for verified overrides)
        const localFood = findFoodByBarcode(code);
        if (localFood) {
            return addSourceToLocalFood(localFood);
        }

        // If not found locally, query OpenFoodFacts
        try {
            const response = await axios.get<OpenFoodFactsProductResponse>(
                `${OFF_PRODUCT_URL}/${code}.json`,
                {
                    params: {
                        fields: 'code,product_name,product_name_en,brands,categories,image_url,nutriments,serving_size,serving_quantity',
                    },
                    headers: OFF_HEADERS,
                    timeout: API_TIMEOUT,
                }
            );

            if (response.data.status === 1 && response.data.product) {
                const foodItem = mapOpenFoodFactsToFoodItem(response.data.product);
                return foodItem;
            }

            return null;
        } catch (error) {
            console.warn('[FoodDataService] Barcode lookup failed:', error);
            return null;
        }
    }

    /**
     * Get food by ID
     * Supports both local IDs (usda-*) and OpenFoodFacts IDs (off-*)
     */
    async getById(id: string): Promise<FoodItemWithSource | null> {
        // Check if it's a local USDA food
        if (id.startsWith('usda-')) {
            const localFood = getFoodById(id);
            return localFood ? addSourceToLocalFood(localFood) : null;
        }

        // Check if it's an OpenFoodFacts food
        if (id.startsWith('off-')) {
            const barcode = id.replace('off-', '');
            return this.getByBarcode(barcode);
        }

        // Fallback: try local database first
        const localFood = getFoodById(id);
        if (localFood) {
            return addSourceToLocalFood(localFood);
        }

        // Try as barcode
        return this.getByBarcode(id);
    }

    /**
     * Check if a food item is from a verified source (USDA)
     */
    isVerifiedSource(food: FoodItemWithSource): boolean {
        return food.dataSource === 'usda' && food.isVerified;
    }

    /**
     * Get display label for data source
     */
    getSourceLabel(food: FoodItemWithSource): string {
        switch (food.dataSource) {
            case 'usda':
                return 'USDA Verified';
            case 'openfoodfacts':
                return 'OpenFoodFacts';
            case 'ai_estimated':
                return 'AI Estimated (Unverified)';
            default:
                return 'Unknown Source';
        }
    }
}

// Export singleton instance
export const FoodDataService = new FoodDataServiceClass();

// Export types
export type { FoodItemWithSource as HybridFoodItem };
