/**
 * useStreak - Hook for streak and gamification data
 *
 * This is the canonical useStreak hook that uses the real UserStore data.
 */

import { useMemo, useCallback } from 'react';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// Types
// ============================================================================

export type DayStatus = 'HIT' | 'PARTIAL' | 'MISS' | 'FROZEN' | 'FUTURE';

export interface DayEntry {
    date: string;
    status: DayStatus;
    calories?: number;
    workout?: string;
    summary?: string;
}

// Alias for components that use StreakDay naming
export type StreakDay = DayEntry;

export interface Milestone {
    days: number;
    name: string;
    title: string;
    icon: string;
    achieved: boolean;
    achievedDate?: string;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    freezesAvailable: number;
    coins: number;
    history: DayEntry[];
    dailyGoalHit: boolean;
}

export interface PowerUp {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number;
    color: string;
}

export interface SquadWager {
    id: string;
    opponent: string;
    opponentAvatar?: string;
    goal: number;
    yourDays: number;
    theirDays: number;
}

// ============================================================================
// Milestone Thresholds
// ============================================================================

export const MILESTONES: Omit<Milestone, 'achieved' | 'achievedDate'>[] = [
    { days: 3, name: 'Starter', title: '3-Day Starter', icon: '🌱' },
    { days: 7, name: 'Warrior', title: '7-Day Warrior', icon: '🛡️' },
    { days: 14, name: 'Spartan', title: '14-Day Spartan', icon: '⚔️' },
    { days: 30, name: 'Titan', title: '30-Day Titan', icon: '🏛️' },
    { days: 60, name: 'Champion', title: '60-Day Champion', icon: '🏆' },
    { days: 100, name: 'Legend', title: '100-Day Legend', icon: '👑' },
];

// Power-ups available in the shop
const POWER_UPS: PowerUp[] = [
    {
        id: 'freeze',
        name: 'Streak Freeze',
        description: 'Protect your streak for 1 day',
        icon: 'snow',
        cost: 500,
        color: '#00BFFF',
    },
    {
        id: 'theme_obsidian',
        name: 'Obsidian Theme',
        description: 'Unlock dark Obsidian mode',
        icon: 'moon',
        cost: 1000,
        color: '#6B7280',
    },
    {
        id: 'ghost_mode',
        name: 'Ghost Mode',
        description: 'Hide from leaderboard for 24h',
        icon: 'eye-off',
        cost: 200,
        color: '#8B5CF6',
    },
    {
        id: 'double_coins',
        name: '2x Coins',
        description: 'Double coins for 24 hours',
        icon: 'flash',
        cost: 750,
        color: '#FBBF24',
    },
];

// ============================================================================
// Hook
// ============================================================================

export function useStreak() {
    const {
        streak,
        longestStreak,
        economy,
        dailyLog,
        currentIntake,
        streakFreezes
    } = useUserStore();

    // Generate last 30 days of history
    const history = useMemo((): DayEntry[] => {
        const days: DayEntry[] = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Check if we have a log for this day
            const log = dailyLog.history.find(l => l.date?.startsWith(dateStr));

            let status: DayStatus = 'MISS';
            let calories: number | undefined;

            if (i === 0) {
                // Today - check if goals are hit using currentIntake
                const caloriesHit = currentIntake.calories > 0;
                status = caloriesHit ? 'HIT' : 'PARTIAL';
                calories = currentIntake.calories;
            } else if (log) {
                // Past day with log
                const caloriesHit = (log.calories || 0) > 1500;
                status = caloriesHit ? 'HIT' : 'PARTIAL';
                calories = log.calories;
            } else {
                // No log for this day - show as MISS (no simulation)
                status = 'MISS';
            }

            days.push({
                date: dateStr,
                status,
                calories,
                summary: status === 'HIT' ? 'Goals Met' : status === 'PARTIAL' ? 'Partial' : undefined,
            });
        }

        return days;
    }, [streak, dailyLog, currentIntake]);

    // Check if it's late in the day (after 8 PM)
    const isLateInDay = useMemo(() => {
        return new Date().getHours() >= 20;
    }, []);

    // Check if daily goal is hit
    const dailyGoalHit = useMemo(() => {
        return currentIntake.calories > 0 && currentIntake.protein > 0;
    }, [currentIntake]);

    // Calculate streak intensity (0-1) for flame size
    const streakIntensity = useMemo(() => {
        if (streak <= 3) return 0.2;
        if (streak <= 7) return 0.4;
        if (streak <= 14) return 0.6;
        if (streak <= 30) return 0.8;
        return 1.0;
    }, [streak]);

    // Get milestones with achieved status
    const milestones = useMemo((): Milestone[] => {
        return MILESTONES.map(m => ({
            ...m,
            achieved: longestStreak >= m.days,
            achievedDate: longestStreak >= m.days
                ? new Date(Date.now() - (longestStreak - m.days) * 86400000).toLocaleDateString()
                : undefined,
        }));
    }, [longestStreak]);

    // Get next milestone
    const nextMilestone = useMemo(() => {
        return milestones.find(m => !m.achieved) || milestones[milestones.length - 1];
    }, [milestones]);

    // Days until next milestone
    const daysUntilNextMilestone = useMemo(() => {
        if (!nextMilestone || nextMilestone.achieved) return 0;
        return nextMilestone.days - streak;
    }, [nextMilestone, streak]);

    // Flame intensity based on streak
    const flameIntensity = useMemo((): 'spark' | 'fire' | 'inferno' => {
        if (streak >= 30) return 'inferno';
        if (streak >= 7) return 'fire';
        return 'spark';
    }, [streak]);

    // Is flame dying (late + no log)
    const isFlameDying = isLateInDay && !dailyGoalHit;

    // Squad wagers - empty until real wager system is implemented
    const wagers: SquadWager[] = useMemo(() => [], []);

    // Build StreakData object for backward compatibility
    const data: StreakData = useMemo(() => ({
        currentStreak: streak,
        longestStreak,
        freezesAvailable: economy.streakFreezes ?? (streakFreezes?.length ?? 2),
        coins: economy.macroCoins,
        history,
        dailyGoalHit,
    }), [streak, longestStreak, economy, streakFreezes, history, dailyGoalHit]);

    // Use freeze (placeholder - would need store action)
    const useFreeze = useCallback(() => {
        if (data.freezesAvailable > 0) {
            // In real implementation, call store action
            return true;
        }
        return false;
    }, [data.freezesAvailable]);

    // Buy freeze (costs 500 coins)
    const buyFreeze = useCallback(() => {
        const cost = 500;
        if (data.coins >= cost) {
            // In real implementation, call store action
            return true;
        }
        return false;
    }, [data.coins]);

    // Spend coins
    const spendCoins = useCallback((amount: number) => {
        if (data.coins >= amount) {
            // In real implementation, call store action
            return true;
        }
        return false;
    }, [data.coins]);

    return {
        // New API (direct values)
        currentStreak: streak,
        longestStreak,
        freezesAvailable: economy.streakFreezes ?? (streakFreezes?.length ?? 2),
        coins: economy.macroCoins,

        // History & milestones
        history,
        milestones,
        nextMilestone,
        daysUntilNextMilestone,

        // Social
        wagers,

        // Shop
        powerUps: POWER_UPS,

        // Flame state
        flameIntensity,
        isFlameDying,
        isLateInDay,
        dailyGoalHit,
        streakIntensity,

        // Legacy API (data object)
        data,

        // Actions
        useFreeze,
        buyFreeze,
        spendCoins,
    };
}
