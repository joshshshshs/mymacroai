/**
 * AIContextService - Gathers user context and generates AI-powered messages
 * 
 * IMPORTANT: This service requires API calls to Gemini.
 * 
 * Strategies implemented to reduce API usage:
 * 1. CACHING: 20-minute cache for AI responses (configurable)
 * 2. RATE LIMITING: Max 10 API calls per hour, cooldown between requests
 * 3. FALLBACK: Static templates when AI is unavailable or rate limited
 * 4. DAILY LIMIT: Max 50 API calls per day to stay within free tier
 */

import { useUserStore } from '@/src/store/UserStore';
import { geminiService } from './GeminiService';
import { storage } from '@/src/store/UserStore';

// ============================================================================
// Types
// ============================================================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type MessageType = 'greeting' | 'insight' | 'recommendation' | 'summary';

export interface AIContext {
    // Time context
    timeOfDay: TimeOfDay;
    hour: number;
    isFirstOpenToday: boolean;

    // Progress context
    caloriesConsumed: number;
    caloriesTarget: number;
    caloriesRemaining: number;
    progressPercent: number;

    // Activity context
    logsToday: number;
    lastLogType: string | null;
    lastLogTime: number | null;

    // Streak & gamification
    streak: number;
    coins: number;

    // Health context
    sleepHours: number | null;
    strain: number | null;
    waterIntake: number;

    // Macros
    protein: number;
    carbs: number;
    fats: number;
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;

    // User info
    userName: string;
}

interface CachedMessage {
    message: string;
    timestamp: number;
    type: MessageType;
}

interface RateLimitState {
    hourlyCount: number;
    hourlyResetTime: number;
    dailyCount: number;
    dailyResetTime: number;
    lastCallTime: number;
}

// ============================================================================
// Constants - Configurable Cache & Rate Limit Settings
// ============================================================================

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes (increased from 15)
const CACHE_KEY_PREFIX = 'ai_message_cache_';
const LAST_OPEN_KEY = 'ai_last_open_date';
const RATE_LIMIT_KEY = 'ai_rate_limit_state';

// Rate limiting thresholds
const MAX_CALLS_PER_HOUR = 10;
const MAX_CALLS_PER_DAY = 50;
const MIN_CALL_INTERVAL_MS = 5000; // 5 seconds between API calls
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// ============================================================================
// Service
// ============================================================================

class AIContextService {

    /**
     * Gets the current time of day
     */
    getTimeOfDay(hour: number): TimeOfDay {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * Checks if this is the first app open today
     */
    isFirstOpenToday(): boolean {
        const today = new Date().toDateString();
        const lastOpen = storage.getString(LAST_OPEN_KEY);

        if (lastOpen !== today) {
            storage.set(LAST_OPEN_KEY, today);
            return true;
        }
        return false;
    }

    // ==========================================================================
    // Rate Limiting
    // ==========================================================================

    /**
     * Gets current rate limit state
     */
    private getRateLimitState(): RateLimitState {
        try {
            const stored = storage.getString(RATE_LIMIT_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch {
            // Ignore parse errors
        }

        // Default state
        return {
            hourlyCount: 0,
            hourlyResetTime: Date.now() + HOUR_MS,
            dailyCount: 0,
            dailyResetTime: Date.now() + DAY_MS,
            lastCallTime: 0,
        };
    }

    /**
     * Updates rate limit state after an API call
     */
    private updateRateLimitState(): void {
        const state = this.getRateLimitState();
        const now = Date.now();

        // Reset hourly counter if past reset time
        if (now >= state.hourlyResetTime) {
            state.hourlyCount = 0;
            state.hourlyResetTime = now + HOUR_MS;
        }

        // Reset daily counter if past reset time
        if (now >= state.dailyResetTime) {
            state.dailyCount = 0;
            state.dailyResetTime = now + DAY_MS;
        }

        // Increment counters
        state.hourlyCount++;
        state.dailyCount++;
        state.lastCallTime = now;

        storage.set(RATE_LIMIT_KEY, JSON.stringify(state));
    }

    /**
     * Checks if we can make an API call (within rate limits)
     */
    private canMakeApiCall(): { allowed: boolean; reason?: string } {
        const state = this.getRateLimitState();
        const now = Date.now();

        // Check if within cooldown period
        if (now - state.lastCallTime < MIN_CALL_INTERVAL_MS) {
            return { allowed: false, reason: 'cooldown' };
        }

        // Check hourly limit (reset if past time)
        const effectiveHourlyCount = now >= state.hourlyResetTime ? 0 : state.hourlyCount;
        if (effectiveHourlyCount >= MAX_CALLS_PER_HOUR) {
            return { allowed: false, reason: 'hourly_limit' };
        }

        // Check daily limit (reset if past time)
        const effectiveDailyCount = now >= state.dailyResetTime ? 0 : state.dailyCount;
        if (effectiveDailyCount >= MAX_CALLS_PER_DAY) {
            return { allowed: false, reason: 'daily_limit' };
        }

        return { allowed: true };
    }

    /**
     * Gets rate limit stats for debugging/display
     */
    getRateLimitStats(): { hourlyRemaining: number; dailyRemaining: number } {
        const state = this.getRateLimitState();
        const now = Date.now();

        const hourlyUsed = now >= state.hourlyResetTime ? 0 : state.hourlyCount;
        const dailyUsed = now >= state.dailyResetTime ? 0 : state.dailyCount;

        return {
            hourlyRemaining: Math.max(0, MAX_CALLS_PER_HOUR - hourlyUsed),
            dailyRemaining: Math.max(0, MAX_CALLS_PER_DAY - dailyUsed),
        };
    }

    // ==========================================================================
    // Context Gathering
    // ==========================================================================

    /**
     * Gathers all relevant user context from the store
     */
    gatherContext(): AIContext {
        const state = useUserStore.getState();
        const now = new Date();
        const hour = now.getHours();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Count today's logs
        const todayLogs = state.dailyLog.history.filter((log) => {
            const timestamp = Number.isFinite(log.timestamp)
                ? log.timestamp
                : Date.parse(log.date || log.createdAt || '');
            return timestamp >= todayStart.getTime();
        });

        const lastLog = todayLogs[todayLogs.length - 1] || null;

        // Calculate remaining calories
        const consumed = state.currentIntake.calories;
        const target = state.dailyTarget.calories;
        const remaining = Math.max(0, target - consumed);
        const progress = target > 0 ? Math.round((consumed / target) * 100) : 0;

        return {
            timeOfDay: this.getTimeOfDay(hour),
            hour,
            isFirstOpenToday: this.isFirstOpenToday(),

            caloriesConsumed: consumed,
            caloriesTarget: target,
            caloriesRemaining: remaining,
            progressPercent: Math.min(progress, 100),

            logsToday: todayLogs.length,
            lastLogType: lastLog?.type || null,
            lastLogTime: lastLog?.timestamp || null,

            streak: state.streak,
            coins: state.economy.macroCoins,

            sleepHours: state.healthMetrics?.sleepMinutes ? Math.round(state.healthMetrics.sleepMinutes / 60 * 10) / 10 : null,
            strain: state.healthMetrics?.heartRate ? Math.round(state.healthMetrics.heartRate / 10) : null,
            waterIntake: 0, // Water tracked separately if needed

            protein: state.currentIntake.protein,
            carbs: state.currentIntake.carbs,
            fats: state.currentIntake.fats,
            proteinTarget: state.dailyTarget.protein,
            carbsTarget: state.dailyTarget.carbs,
            fatsTarget: state.dailyTarget.fats,

            userName: state.user?.name?.split(' ')[0] || '',
        };
    }

    // ==========================================================================
    // Caching
    // ==========================================================================

    /**
     * Gets cached message if still valid
     */
    private getCachedMessage(type: MessageType): string | null {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}${type}`;
            const cached = storage.getString(cacheKey);
            if (!cached) return null;

            const parsed: CachedMessage = JSON.parse(cached);
            const age = Date.now() - parsed.timestamp;

            if (age < CACHE_TTL_MS) {
                return parsed.message;
            }
            return null;
        } catch {
            return null;
        }
    }

    /**
     * Caches a message
     */
    private cacheMessage(type: MessageType, message: string): void {
        const cacheKey = `${CACHE_KEY_PREFIX}${type}`;
        const cached: CachedMessage = {
            message,
            timestamp: Date.now(),
            type,
        };
        storage.set(cacheKey, JSON.stringify(cached));
    }

    /**
     * Clears all cached messages (call when significant user action occurs)
     */
    clearCache(): void {
        const types: MessageType[] = ['greeting', 'insight', 'recommendation', 'summary'];
        types.forEach(type => {
            storage.delete(`${CACHE_KEY_PREFIX}${type}`);
        });
    }

    // ==========================================================================
    // AI Message Generation
    // ==========================================================================

    /**
     * Generates a dynamic greeting using Gemini
     * Falls back to static templates if rate limited or API fails
     */
    async generateGreeting(): Promise<{ lead: string; emphasis: string }> {
        const context = this.gatherContext();

        // 1. Check cache first (most important optimization)
        const cached = this.getCachedMessage('greeting');
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {
                // Fall through to generate new
            }
        }

        // 2. Check rate limits before making API call
        const rateCheck = this.canMakeApiCall();
        if (!rateCheck.allowed) {
            if (__DEV__) console.log(`AI greeting skipped: ${rateCheck.reason}`);
            return this.getFallbackGreeting(context);
        }

        // 3. Try AI generation
        try {
            const prompt = this.buildGreetingPrompt(context);
            const response = await geminiService.generateContextualMessage('greeting', prompt);

            // Update rate limit counters
            this.updateRateLimitState();

            // Parse response (expecting JSON { lead, emphasis })
            const parsed = JSON.parse(response);
            this.cacheMessage('greeting', JSON.stringify(parsed));

            return {
                lead: parsed.lead || 'Welcome!',
                emphasis: parsed.emphasis || 'Ready to transform.',
            };
        } catch (error) {
            console.warn('AI greeting failed, using fallback:', error);
            return this.getFallbackGreeting(context);
        }
    }

    /**
     * Generates a dynamic insight using Gemini
     * Falls back to static templates if rate limited or API fails
     */
    async generateInsight(): Promise<string> {
        const context = this.gatherContext();

        // 1. Check cache first
        const cached = this.getCachedMessage('insight');
        if (cached) return cached;

        // 2. Check rate limits
        const rateCheck = this.canMakeApiCall();
        if (!rateCheck.allowed) {
            if (__DEV__) console.log(`AI insight skipped: ${rateCheck.reason}`);
            return this.getFallbackInsight(context);
        }

        // 3. Try AI generation
        try {
            const prompt = this.buildInsightPrompt(context);
            const response = await geminiService.generateContextualMessage('insight', prompt);

            // Update rate limit counters
            this.updateRateLimitState();

            this.cacheMessage('insight', response);
            return response;
        } catch (error) {
            console.warn('AI insight failed, using fallback:', error);
            return this.getFallbackInsight(context);
        }
    }

    /**
     * Generates a recommendation using Gemini
     * Falls back to static templates if rate limited or API fails
     */
    async generateRecommendation(): Promise<string> {
        const context = this.gatherContext();

        // 1. Check cache first
        const cached = this.getCachedMessage('recommendation');
        if (cached) return cached;

        // 2. Check rate limits
        const rateCheck = this.canMakeApiCall();
        if (!rateCheck.allowed) {
            if (__DEV__) console.log(`AI recommendation skipped: ${rateCheck.reason}`);
            return this.getFallbackRecommendation(context);
        }

        // 3. Try AI generation
        try {
            const prompt = this.buildRecommendationPrompt(context);
            const response = await geminiService.generateContextualMessage('recommendation', prompt);

            // Update rate limit counters
            this.updateRateLimitState();

            this.cacheMessage('recommendation', response);
            return response;
        } catch (error) {
            console.warn('AI recommendation failed, using fallback:', error);
            return this.getFallbackRecommendation(context);
        }
    }

    // ==========================================================================
    // Prompt Builders
    // ==========================================================================

    private buildGreetingPrompt(ctx: AIContext): string {
        return `You are a Spartan fitness coach AI. Generate a personalized greeting for the user.

CONTEXT:
- Time: ${ctx.timeOfDay} (${ctx.hour}:00)
- First open today: ${ctx.isFirstOpenToday}
- User name: ${ctx.userName || 'Warrior'}
- Current progress: ${ctx.progressPercent}% of daily calorie goal
- Calories consumed: ${ctx.caloriesConsumed} / ${ctx.caloriesTarget}
- Logs today: ${ctx.logsToday}
- Streak: ${ctx.streak} days
${ctx.sleepHours ? `- Sleep last night: ${ctx.sleepHours}h` : ''}

RULES:
1. Be motivating but concise (2 lines max)
2. If first open, welcome them warmly
3. If behind pace (low progress late in day), show urgency
4. If ahead or complete, celebrate
5. Reference their streak if > 3 days
6. Match the ${ctx.timeOfDay} energy

Return ONLY valid JSON: {"lead": "short greeting", "emphasis": "action phrase"}`;
    }

    private buildInsightPrompt(ctx: AIContext): string {
        const proteinProgress = ctx.proteinTarget > 0
            ? Math.round((ctx.protein / ctx.proteinTarget) * 100)
            : 0;

        return `You are a Spartan fitness coach AI. Generate a brief health insight.

CONTEXT:
- Calories: ${ctx.caloriesConsumed}/${ctx.caloriesTarget} (${ctx.progressPercent}%)
- Protein: ${ctx.protein}g/${ctx.proteinTarget}g (${proteinProgress}%)
- Carbs: ${ctx.carbs}g/${ctx.carbsTarget}g
- Fats: ${ctx.fats}g/${ctx.fatsTarget}g
- Water: ${ctx.waterIntake}ml
${ctx.sleepHours ? `- Sleep: ${ctx.sleepHours}h` : ''}
${ctx.strain ? `- Strain: ${ctx.strain}/21` : ''}

RULES:
1. One sentence only (max 15 words)
2. Focus on most important insight (protein, sleep, or balance)
3. Be actionable when possible
4. No fluff or greetings

Return ONLY the insight text, no quotes or JSON.`;
    }

    private buildRecommendationPrompt(ctx: AIContext): string {
        return `You are a Spartan fitness coach AI. Give one actionable recommendation.

CONTEXT:
- Time: ${ctx.timeOfDay}
- Remaining calories: ${ctx.caloriesRemaining}
- Protein so far: ${ctx.protein}g (target: ${ctx.proteinTarget}g)
- Logs today: ${ctx.logsToday}
${ctx.sleepHours && ctx.sleepHours < 7 ? '- Sleep debt detected' : ''}

RULES:
1. One specific, actionable suggestion
2. Max 12 words
3. Can be food suggestion, rest reminder, or activity prompt
4. Match ${ctx.timeOfDay} context

Return ONLY the recommendation text.`;
    }

    // ==========================================================================
    // Fallback Templates (Static - No API Needed)
    // ==========================================================================

    private getFallbackGreeting(ctx: AIContext): { lead: string; emphasis: string } {
        const name = ctx.userName ? `, ${ctx.userName}` : '';

        // Time-based greetings
        const timeGreetings = {
            morning: { lead: `Good morning${name}!`, emphasis: 'Start strong today.' },
            afternoon: { lead: `Keep pushing${name}!`, emphasis: 'Afternoon momentum.' },
            evening: { lead: `Evening check-in${name}!`, emphasis: 'Finish strong.' },
            night: { lead: `Night owl mode${name}!`, emphasis: 'Rest well soon.' },
        };

        // Priority-based overrides
        if (ctx.isFirstOpenToday) {
            return { lead: `Welcome back${name}!`, emphasis: 'Ready to transform.' };
        }

        if (ctx.progressPercent >= 100) {
            return { lead: `Goal achieved${name}!`, emphasis: 'Hold the line.' };
        }

        if (ctx.progressPercent >= 80) {
            return { lead: 'Almost there!', emphasis: `${ctx.caloriesRemaining} kcal to go.` };
        }

        if (ctx.streak >= 7) {
            return { lead: `${ctx.streak} day streak!`, emphasis: 'Legendary consistency.' };
        }

        if (ctx.progressPercent < 20 && ctx.hour >= 18) {
            return { lead: 'Time is running!', emphasis: 'Log something now.' };
        }

        // Default to time-based
        return timeGreetings[ctx.timeOfDay];
    }

    private getFallbackInsight(ctx: AIContext): string {
        // Priority-based insights
        if (ctx.protein < ctx.proteinTarget * 0.5 && ctx.hour >= 14) {
            return 'Protein intake is low. Consider a high-protein meal.';
        }

        if (ctx.sleepHours && ctx.sleepHours < 6) {
            return 'Sleep debt detected. Prioritize recovery today.';
        }

        if (ctx.progressPercent >= 100) {
            return 'Daily goal complete. Maintain or ease into recovery.';
        }

        if (ctx.progressPercent >= 80) {
            return `Great progress! Only ${ctx.caloriesRemaining} calories remaining.`;
        }

        if (ctx.logsToday === 0 && ctx.hour >= 10) {
            return 'No logs yet today. Start tracking to stay on target.';
        }

        if (ctx.streak >= 3) {
            return `${ctx.streak} day streak! Consistency is your superpower.`;
        }

        return 'Tracking on point. Keep the momentum.';
    }

    private getFallbackRecommendation(ctx: AIContext): string {
        // Time-based + context recommendations
        if (ctx.timeOfDay === 'morning' && ctx.logsToday === 0) {
            return 'Log your breakfast to start the day right.';
        }

        if (ctx.protein < ctx.proteinTarget * 0.4) {
            return 'Focus on protein intake for your next meal.';
        }

        if (ctx.sleepHours && ctx.sleepHours < 6) {
            return 'Prioritize rest. Consider a power nap.';
        }

        if (ctx.caloriesRemaining < 300 && ctx.caloriesRemaining > 0) {
            return 'Light snack time. Keep it balanced.';
        }

        if (ctx.timeOfDay === 'evening') {
            return 'Wind down with a light protein snack.';
        }

        return 'Stay hydrated and keep moving.';
    }
}

export const aiContextService = new AIContextService();
