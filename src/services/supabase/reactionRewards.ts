/**
 * Reaction Rewards Service
 * 
 * Manages MacroCoin rewards for content creators when they receive hearts.
 * Implements a daily cap to prevent farming.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase, supabase } from '@/src/lib/supabase';

// Constants
const COINS_PER_HEART = 10;
const DAILY_CAP = 50;
const STORAGE_KEY = '@reaction_rewards';

interface RewardState {
    lastResetDate: string;  // YYYY-MM-DD
    coinsEarnedToday: number;
}

/**
 * Get today's date as YYYY-MM-DD
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get current reward state from storage
 */
async function getRewardState(): Promise<RewardState> {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
            const state: RewardState = JSON.parse(stored);

            // Reset if it's a new day
            if (state.lastResetDate !== getTodayDate()) {
                return {
                    lastResetDate: getTodayDate(),
                    coinsEarnedToday: 0,
                };
            }
            return state;
        }
    } catch (error) {
        console.error('[ReactionRewards] Error reading state:', error);
    }

    // Default state
    return {
        lastResetDate: getTodayDate(),
        coinsEarnedToday: 0,
    };
}

/**
 * Save reward state to storage
 */
async function saveRewardState(state: RewardState): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('[ReactionRewards] Error saving state:', error);
    }
}

/**
 * Calculate how many coins can be earned (respecting daily cap)
 */
export async function getAvailableReward(): Promise<number> {
    const state = await getRewardState();
    const remaining = DAILY_CAP - state.coinsEarnedToday;
    return Math.max(0, Math.min(remaining, COINS_PER_HEART));
}

/**
 * Award coins for receiving a heart reaction
 * Returns the amount actually awarded (may be less due to cap)
 */
export async function awardHeartReward(): Promise<number> {
    const state = await getRewardState();

    // Check if user has hit the daily cap
    if (state.coinsEarnedToday >= DAILY_CAP) {
        if (__DEV__) console.log('[ReactionRewards] Daily cap reached, no reward given');
        return 0;
    }

    // Calculate actual reward (might be partial if near cap)
    const coinsToAward = Math.min(COINS_PER_HEART, DAILY_CAP - state.coinsEarnedToday);

    // Update state
    state.coinsEarnedToday += coinsToAward;
    await saveRewardState(state);

    if (__DEV__) console.log(`[ReactionRewards] Awarded ${coinsToAward} coins (${state.coinsEarnedToday}/${DAILY_CAP} today)`);

    return coinsToAward;
}

/**
 * Get current daily stats
 */
export async function getDailyStats(): Promise<{
    earnedToday: number;
    remainingToday: number;
    dailyCap: number;
    coinsPerHeart: number;
}> {
    const state = await getRewardState();
    return {
        earnedToday: state.coinsEarnedToday,
        remainingToday: Math.max(0, DAILY_CAP - state.coinsEarnedToday),
        dailyCap: DAILY_CAP,
        coinsPerHeart: COINS_PER_HEART,
    };
}

/**
 * Listen for new reactions on user's recipes and award coins
 * (Call this on app startup to subscribe to real-time updates)
 */
export async function subscribeToReactionRewards(
    userId: string,
    onReward: (amount: number) => void
): Promise<() => void> {
    // Get user's recipe IDs
    const { data: recipes } = await getSupabase()
        .from('public_recipes')
        .select('id')
        .eq('author_id', userId);

    if (!recipes || recipes.length === 0) {
        return () => { }; // No-op unsubscribe
    }

    const recipeIds = recipes.map((r: { id: string }) => r.id);

    // Subscribe to new reactions on user's recipes
    const channel = getSupabase()
        .channel('reaction-rewards')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'reactions',
                filter: `recipe_id=in.(${recipeIds.join(',')})`,
            },
            async (payload: { new: { reaction_type: string } }) => {
                const reaction = payload.new as { reaction_type: string };

                if (reaction.reaction_type === 'heart') {
                    const awarded = await awardHeartReward();
                    if (awarded > 0) {
                        onReward(awarded);
                    }
                }
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        getSupabase().removeChannel(channel);
    };
}

export const ReactionRewardsService = {
    getAvailableReward,
    awardHeartReward,
    getDailyStats,
    subscribeToReactionRewards,
    COINS_PER_HEART,
    DAILY_CAP,
};

export default ReactionRewardsService;
