/**
 * Recipes Service - Community Kitchen
 * 
 * Handles public recipe CRUD, feed queries, and reactions.
 */

import { supabase } from '../lib/supabase';
import { StorageService } from './supabase/storage';

// ============================================================================
// TYPES
// ============================================================================

export interface PublicRecipe {
    id: string;
    author_id: string;
    name: string;
    description: string | null;
    instructions: string | null;
    image_url: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    categories: string[];
    prep_time_minutes: number | null;
    servings: number;
    ingredients: Ingredient[];
    heart_count: number;
    thumbs_up_count: number;
    thumbs_down_count: number;
    created_at: string;
    // Joined data
    author?: PublicProfile;
    user_reaction?: ReactionType | null;
}

export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

export interface PublicProfile {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    follower_count: number;
}

export type ReactionType = 'heart' | 'thumbs_up' | 'thumbs_down';

export const RECIPE_CATEGORIES = [
    'High Protein',
    'Low Carb',
    'Budget Friendly',
    'Quick Prep',
    'Meal Prep',
    'Strict Cut',
    'Clean Bulk',
    'Maintenance',
    'Vegetarian',
    'Keto',
] as const;

export type RecipeCategory = typeof RECIPE_CATEGORIES[number];

export interface FeedFilters {
    category?: RecipeCategory;
    maxCalories?: number;
    minProtein?: number;
    maxPrepTime?: number;
    sortBy?: 'recent' | 'popular' | 'protein_density';
}

// ============================================================================
// PUBLISH RECIPE
// ============================================================================

export interface PublishRecipeInput {
    name: string;
    description?: string;
    instructions?: string;
    imageUri: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    categories: string[];
    prepTimeMinutes?: number;
    servings?: number;
    ingredients: Ingredient[];
    localMealId?: string;
}

export async function publishRecipe(input: PublishRecipeInput): Promise<{ success: boolean; recipeId?: string; error?: string }> {
    try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Upload image
        const uploadResult = await StorageService.uploadRecipeImage(input.imageUri, user.id);
        if (!uploadResult.success || !uploadResult.url) {
            return { success: false, error: uploadResult.error || 'Image upload failed' };
        }

        // Insert recipe
        const { data, error } = await supabase
            .from('public_recipes')
            .insert({
                author_id: user.id,
                name: input.name,
                description: input.description || null,
                instructions: input.instructions || null,
                image_url: uploadResult.url,
                calories: input.calories,
                protein: input.protein,
                carbs: input.carbs,
                fats: input.fats,
                categories: input.categories,
                prep_time_minutes: input.prepTimeMinutes || null,
                servings: input.servings || 1,
                ingredients: input.ingredients,
                local_meal_id: input.localMealId || null,
            })
            .select('id')
            .single();

        if (error) {
            console.error('[RecipesService] Insert error:', error);
            return { success: false, error: error.message };
        }

        // Update user's recipe count
        await supabase.rpc('increment_recipe_count', { user_id: user.id });

        return { success: true, recipeId: data.id };
    } catch (error) {
        console.error('[RecipesService] Publish exception:', error);
        return { success: false, error: 'Failed to publish recipe' };
    }
}

// ============================================================================
// FEED QUERIES
// ============================================================================

export async function getPublicFeed(
    filters: FeedFilters = {},
    page: number = 0,
    pageSize: number = 20
): Promise<PublicRecipe[]> {
    try {
        let query = supabase
            .from('public_recipes')
            .select(`
                *,
                author:profiles!author_id (
                    id,
                    username,
                    display_name,
                    avatar_url,
                    is_verified,
                    follower_count
                )
            `)
            .eq('is_approved', true)
            .eq('is_flagged', false);

        // Apply filters
        if (filters.category) {
            query = query.contains('categories', [filters.category]);
        }
        if (filters.maxCalories) {
            query = query.lte('calories', filters.maxCalories);
        }
        if (filters.minProtein) {
            query = query.gte('protein', filters.minProtein);
        }
        if (filters.maxPrepTime) {
            query = query.lte('prep_time_minutes', filters.maxPrepTime);
        }

        // Sort
        switch (filters.sortBy) {
            case 'popular':
                query = query.order('heart_count', { ascending: false });
                break;
            case 'protein_density':
                // Sort by protein per calorie (approximation)
                query = query.order('protein', { ascending: false });
                break;
            case 'recent':
            default:
                query = query.order('created_at', { ascending: false });
        }

        // Pagination
        query = query.range(page * pageSize, (page + 1) * pageSize - 1);

        const { data, error } = await query;

        if (error) {
            console.error('[RecipesService] Feed error:', error);
            return [];
        }

        return data as PublicRecipe[];
    } catch (error) {
        console.error('[RecipesService] Feed exception:', error);
        return [];
    }
}

/**
 * Get random highly-rated recipes ("Dice Roll" feature)
 */
export async function getRandomTopRecipes(count: number = 3): Promise<PublicRecipe[]> {
    try {
        const { data, error } = await supabase
            .from('public_recipes')
            .select(`
                *,
                author:profiles!author_id (
                    id,
                    username,
                    display_name,
                    avatar_url,
                    is_verified,
                    follower_count
                )
            `)
            .eq('is_approved', true)
            .eq('is_flagged', false)
            .gte('heart_count', 5)
            .order('heart_count', { ascending: false })
            .limit(30);

        if (error || !data) return [];

        // Shuffle and take random
        const shuffled = data.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count) as PublicRecipe[];
    } catch (error) {
        console.error('[RecipesService] Random fetch error:', error);
        return [];
    }
}

export async function getRecipeById(recipeId: string): Promise<PublicRecipe | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('public_recipes')
            .select(`
                *,
                author:profiles!author_id (
                    id,
                    username,
                    display_name,
                    avatar_url,
                    is_verified,
                    follower_count
                )
            `)
            .eq('id', recipeId)
            .single();

        if (error || !data) return null;

        // Get user's reaction if logged in
        let userReaction: ReactionType | null = null;
        if (user) {
            const { data: reactionData } = await supabase
                .from('reactions')
                .select('reaction_type')
                .eq('recipe_id', recipeId)
                .eq('user_id', user.id)
                .single();

            if (reactionData) {
                userReaction = reactionData.reaction_type as ReactionType;
            }
        }

        return {
            ...data,
            user_reaction: userReaction,
        } as PublicRecipe;
    } catch (error) {
        console.error('[RecipesService] Get recipe error:', error);
        return null;
    }
}

// ============================================================================
// REACTIONS
// ============================================================================

export async function reactToRecipe(
    recipeId: string,
    reactionType: ReactionType
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check for existing reaction
        const { data: existing } = await supabase
            .from('reactions')
            .select('id, reaction_type')
            .eq('recipe_id', recipeId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            if (existing.reaction_type === reactionType) {
                // Same reaction - remove it (toggle off)
                await supabase.from('reactions').delete().eq('id', existing.id);
            } else {
                // Different reaction - update it
                await supabase
                    .from('reactions')
                    .update({ reaction_type: reactionType })
                    .eq('id', existing.id);
            }
        } else {
            // No existing reaction - create new
            const { error } = await supabase
                .from('reactions')
                .insert({
                    user_id: user.id,
                    recipe_id: recipeId,
                    reaction_type: reactionType,
                });

            if (error) {
                return { success: false, error: error.message };
            }
        }

        return { success: true };
    } catch (error) {
        console.error('[RecipesService] Reaction error:', error);
        return { success: false, error: 'Failed to react' };
    }
}

export async function removeReaction(recipeId: string): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        await supabase
            .from('reactions')
            .delete()
            .eq('recipe_id', recipeId)
            .eq('user_id', user.id);

        return true;
    } catch (error) {
        return false;
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const RecipesService = {
    publishRecipe,
    getPublicFeed,
    getRandomTopRecipes,
    getRecipeById,
    reactToRecipe,
    removeReaction,
    RECIPE_CATEGORIES,
};

export default RecipesService;
