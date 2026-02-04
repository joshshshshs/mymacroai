/**
 * Tool Executor - Handles AI Function Call Execution
 *
 * This is the "Neural Bridge" that connects AI decisions to real data.
 * Each tool maps to actual database queries and state access.
 *
 * Now powered by the Hybrid Food Engine (FoodDataService) for:
 * - USDA verified data (Tier 1)
 * - OpenFoodFacts API (Tier 2)
 */

import { getFoodById } from '../../data/mockFoodDB';
import { FoodItem, calculatePortionNutrients } from '../../types/food';
import { useUserStore } from '../../store/UserStore';
import { AIToolName } from './tools/definitions';
import { FoodDataService, FoodItemWithSource } from '../food/FoodDataService';

// ============================================================================
// TOOL RESULT TYPES
// ============================================================================

export interface ToolResult {
    success: boolean;
    data: any;
    error?: string;
}

export interface SearchFoodParams {
    query?: string;
    minProtein?: number;
    maxCalories?: number;
    maxCarbs?: number;
    maxFat?: number;
    category?: string;
    verifiedOnly?: boolean;
}

export interface LogFoodParams {
    foodId: string;
    portionGrams?: number;
    mealSlot?: string;
}

export interface GetFoodDetailsParams {
    foodId: string;
}

// ============================================================================
// USER STATUS GETTER
// ============================================================================

export function getUserStatus(): ToolResult {
    try {
        const state = useUserStore.getState();
        const { currentIntake, dailyTarget, streak, economy } = state;

        // Calculate remaining macros
        const caloriesRemaining = Math.max(0, dailyTarget.calories - currentIntake.calories);
        const proteinRemaining = Math.max(0, dailyTarget.protein - currentIntake.protein);
        const carbsRemaining = Math.max(0, dailyTarget.carbs - currentIntake.carbs);
        const fatsRemaining = Math.max(0, dailyTarget.fats - currentIntake.fats);

        // Calculate progress percentage
        const progress = dailyTarget.calories > 0
            ? Math.round((currentIntake.calories / dailyTarget.calories) * 100)
            : 0;

        // Determine time of day
        const hour = new Date().getHours();
        let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
        else timeOfDay = 'night';

        return {
            success: true,
            data: {
                caloriesConsumed: currentIntake.calories,
                caloriesRemaining,
                proteinConsumed: currentIntake.protein,
                proteinRemaining,
                carbsConsumed: currentIntake.carbs,
                carbsRemaining,
                fatsConsumed: currentIntake.fats,
                fatsRemaining,
                todayProgress: progress,
                currentStreak: streak,
                macroCoins: economy.macroCoins,
                timeOfDay,
                dailyTarget: {
                    calories: dailyTarget.calories,
                    protein: dailyTarget.protein,
                    carbs: dailyTarget.carbs,
                    fats: dailyTarget.fats,
                },
            },
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            error: 'Failed to get user status',
        };
    }
}

// ============================================================================
// FOOD DATABASE SEARCH (Hybrid Engine)
// ============================================================================

export async function searchFoodDatabase(params: SearchFoodParams): Promise<ToolResult> {
    try {
        // Use the Hybrid Food Engine for search
        let results = await FoodDataService.search(params.query || '');

        // Apply filters
        if (params.verifiedOnly) {
            results = results.filter(food => food.isVerified && food.dataSource === 'usda');
        }

        if (params.minProtein !== undefined) {
            results = results.filter(food => food.macros.protein >= params.minProtein!);
        }

        if (params.maxCalories !== undefined) {
            results = results.filter(food => food.macros.calories <= params.maxCalories!);
        }

        if (params.maxCarbs !== undefined) {
            results = results.filter(food => food.macros.carbs <= params.maxCarbs!);
        }

        if (params.maxFat !== undefined) {
            results = results.filter(food => food.macros.fat <= params.maxFat!);
        }

        if (params.category) {
            results = results.filter(food =>
                food.category?.toLowerCase() === params.category!.toLowerCase()
            );
        }

        // Sort: Verified USDA first, then by protein density
        results.sort((a, b) => {
            // Verified USDA items always come first
            if (a.dataSource === 'usda' && b.dataSource !== 'usda') return -1;
            if (a.dataSource !== 'usda' && b.dataSource === 'usda') return 1;

            // Within same source, sort by protein density
            const densityA = a.macros.calories > 0 ? a.macros.protein / a.macros.calories : 0;
            const densityB = b.macros.calories > 0 ? b.macros.protein / b.macros.calories : 0;
            return densityB - densityA;
        });

        // Format for AI consumption (top 5 results)
        const formattedResults = results.slice(0, 5).map(food => ({
            id: food.id,
            name: food.name,
            brand: food.brand,
            category: food.category,
            isVerified: food.isVerified,
            dataSource: food.dataSource,
            sourceLabel: FoodDataService.getSourceLabel(food),
            servingSize: `${food.servingSize}${food.servingUnit}`,
            servingDescription: food.servingDescription,
            calories: food.macros.calories,
            protein: food.macros.protein,
            carbs: food.macros.carbs,
            fat: food.macros.fat,
            proteinDensity: food.macros.calories > 0
                ? `${(food.macros.protein / food.macros.calories * 10).toFixed(1)}g per 10cal`
                : 'N/A',
        }));

        return {
            success: true,
            data: {
                count: formattedResults.length,
                foods: formattedResults,
                searchCriteria: params,
                note: 'Results sorted by: USDA verified first, then by protein density.',
            },
        };
    } catch (error) {
        console.error('[searchFoodDatabase] Error:', error);
        return {
            success: false,
            data: null,
            error: 'Failed to search food database',
        };
    }
}

// ============================================================================
// LOG FOOD TO DIARY (Hybrid Engine)
// ============================================================================

export async function logVerifiedFood(params: LogFoodParams): Promise<ToolResult> {
    try {
        // Use Hybrid Engine to fetch food (supports both USDA and OpenFoodFacts)
        const food = await FoodDataService.getById(params.foodId);

        if (!food) {
            return {
                success: false,
                data: null,
                error: `Food with ID "${params.foodId}" not found in database`,
            };
        }

        // Calculate portion-adjusted values
        const portionGrams = params.portionGrams || 100;
        const adjustedFood = calculatePortionNutrients(food, portionGrams);

        // Log to store
        const { logFood } = useUserStore.getState();
        logFood(
            adjustedFood.macros.calories,
            adjustedFood.macros.protein,
            adjustedFood.macros.carbs,
            adjustedFood.macros.fat,
            `${food.name} (${portionGrams}g)`
        );

        return {
            success: true,
            data: {
                logged: true,
                food: food.name,
                brand: food.brand,
                portion: `${portionGrams}g`,
                mealSlot: params.mealSlot || 'unspecified',
                dataSource: food.dataSource,
                sourceLabel: FoodDataService.getSourceLabel(food),
                nutrition: {
                    calories: adjustedFood.macros.calories,
                    protein: adjustedFood.macros.protein,
                    carbs: adjustedFood.macros.carbs,
                    fat: adjustedFood.macros.fat,
                },
            },
        };
    } catch (error) {
        console.error('[logVerifiedFood] Error:', error);
        return {
            success: false,
            data: null,
            error: 'Failed to log food',
        };
    }
}

// ============================================================================
// GET FOOD DETAILS (Hybrid Engine)
// ============================================================================

export async function getFoodDetails(params: GetFoodDetailsParams): Promise<ToolResult> {
    try {
        // Use Hybrid Engine to fetch food details
        const food = await FoodDataService.getById(params.foodId);

        if (!food) {
            return {
                success: false,
                data: null,
                error: `Food with ID "${params.foodId}" not found`,
            };
        }

        // Group micronutrients by category
        const vitamins = food.micronutrients.filter(n => n.category === 'vitamin');
        const minerals = food.micronutrients.filter(n => n.category === 'mineral');
        const other = food.micronutrients.filter(n => n.category === 'other');

        return {
            success: true,
            data: {
                id: food.id,
                name: food.name,
                brand: food.brand,
                category: food.category,
                isVerified: food.isVerified,
                dataSource: food.dataSource,
                sourceLabel: FoodDataService.getSourceLabel(food),
                servingSize: `${food.servingSize}${food.servingUnit}`,
                servingDescription: food.servingDescription,
                macros: food.macros,
                micronutrients: {
                    vitamins: vitamins.map(n => ({ name: n.name, amount: `${n.amount}${n.unit}`, dv: n.dailyValuePercentage })),
                    minerals: minerals.map(n => ({ name: n.name, amount: `${n.amount}${n.unit}`, dv: n.dailyValuePercentage })),
                    other: other.map(n => ({ name: n.name, amount: `${n.amount}${n.unit}`, dv: n.dailyValuePercentage })),
                },
                note: food.dataSource === 'usda'
                    ? 'This is USDA-verified data with comprehensive micronutrient information.'
                    : 'This data is from OpenFoodFacts (crowd-sourced). Micronutrient data may be limited.',
            },
        };
    } catch (error) {
        console.error('[getFoodDetails] Error:', error);
        return {
            success: false,
            data: null,
            error: 'Failed to get food details',
        };
    }
}

// ============================================================================
// MASTER EXECUTOR (Async for Hybrid Engine)
// ============================================================================

export async function executeTool(toolName: AIToolName, args: any): Promise<ToolResult> {
    switch (toolName) {
        case 'search_food_database':
            return await searchFoodDatabase(args as SearchFoodParams);

        case 'get_user_status':
            return getUserStatus();

        case 'log_verified_food':
            return await logVerifiedFood(args as LogFoodParams);

        case 'get_food_details':
            return await getFoodDetails(args as GetFoodDetailsParams);

        case 'search_verified_fitness_knowledge':
            return searchVerifiedFitnessKnowledge(args as SearchFitnessKnowledgeParams);

        default:
            return {
                success: false,
                data: null,
                error: `Unknown tool: ${toolName}`,
            };
    }
}

// ============================================================================
// TOOL: SEARCH VERIFIED FITNESS KNOWLEDGE (Peptide Research)
// ============================================================================

interface SearchFitnessKnowledgeParams {
    query: string;
    compoundName?: string;
    topic?: 'mechanism' | 'clinical_trials' | 'safety' | 'pharmacokinetics' | 'interactions';
}

/**
 * Search verified fitness knowledge base for peptide/compound research
 * For MVP, returns a placeholder response indicating database not yet implemented
 * Future: Connect to curated PubMed/NIH research database
 */
function searchVerifiedFitnessKnowledge(params: SearchFitnessKnowledgeParams): ToolResult {
    // MVP Placeholder - In production, this would query a curated research database
    return {
        success: true,
        data: {
            query: params.query,
            compoundName: params.compoundName || null,
            topic: params.topic || 'general',
            message: 'Peptide research database is currently being curated. Providing general guidance only.',
            disclaimer: 'Always consult peer-reviewed literature and qualified healthcare professionals.',
            sources: [],
            note: 'For accurate dosage and protocol information, please refer to published clinical studies on PubMed (pubmed.ncbi.nlm.nih.gov) or consult a healthcare provider.',
        },
    };
}
