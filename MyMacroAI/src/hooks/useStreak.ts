/**
 * useStreak - Hook for managing streak and gamification data
 */

import { useMemo } from 'react';
import { useUserStore } from '@/src/store/UserStore';

export type DayStatus = 'HIT' | 'PARTIAL' | 'MISS' | 'FROZEN' | 'FUTURE';

export interface StreakDay {
    date: string;
    status: DayStatus;
    calories?: number;
    summary?: string;
}

export interface Milestone {
    days: number;
    title: string;
    icon: string;
    achieved: boolean;
    achievedDate?: string;
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

// Milestone thresholds
const MILESTONES: Omit<Milestone, 'achieved' | 'achievedDate'>[] = [
    { days: 3, title: '3-Day Starter', icon: '🌱' },
    { days: 7, title: '7-Day Warrior', icon: '🛡️' },
    { days: 14, title: '14-Day Spartan', icon: '⚔️' },
    { days: 30, title: '30-Day Titan', icon: '🏛️' },
    { days: 60, title: '60-Day Legend', icon: '👑' },
    { days: 100, title: '100-Day Immortal', icon: '⭐' },
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

export function useStreak() {
    const { streak, longestStreak, economy, dailyLog } = useUserStore();

    // Generate last 30 days of history
    const history = useMemo((): StreakDay[] => {
        const days: StreakDay[] = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Check if we have a log for this day
            const log = dailyLog.history.find(l => l.date === dateStr);

            let status: DayStatus = 'MISS';
            if (i === 0) {
                // Today - check if goals are hit
                const caloriesHit = dailyLog.calories > 0;
                status = caloriesHit ? 'HIT' : 'PARTIAL';
            } else if (log) {
                // Past day with log
                const caloriesHit = log.calories > 1500;
                status = caloriesHit ? 'HIT' : 'PARTIAL';
            } else {
                // Simulate some history for demo
                const rand = Math.random();
                if (i < streak) {
                    status = rand > 0.1 ? 'HIT' : 'PARTIAL';
                } else if (rand > 0.7) {
                    status = 'HIT';
                } else if (rand > 0.4) {
                    status = 'PARTIAL';
                } else if (rand > 0.3) {
                    status = 'FROZEN';
                } else {
                    status = 'MISS';
                }
            }

            days.push({
                date: dateStr,
                status,
                calories: log?.calories || Math.floor(1800 + Math.random() * 600),
                summary: status === 'HIT' ? 'Goals Met' : status === 'PARTIAL' ? 'Partial' : undefined,
            });
        }

        return days;
    }, [streak, dailyLog]);

    // Calculate milestones
    const milestones = useMemo((): Milestone[] => {
        return MILESTONES.map(m => ({
            ...m,
            achieved: longestStreak >= m.days,
            achievedDate: longestStreak >= m.days
                ? new Date(Date.now() - (longestStreak - m.days) * 86400000).toLocaleDateString()
                : undefined,
        }));
    }, [longestStreak]);

    // Find next milestone
    const nextMilestone = useMemo(() => {
        return milestones.find(m => !m.achieved) || milestones[milestones.length - 1];
    }, [milestones]);

    // Days until next milestone
    const daysUntilNextMilestone = useMemo(() => {
        if (!nextMilestone || nextMilestone.achieved) return 0;
        return nextMilestone.days - streak;
    }, [nextMilestone, streak]);

    // Mock squad wagers
    const wagers: SquadWager[] = useMemo(() => [
        {
            id: '1',
            opponent: '@JoshLifts',
            goal: 30,
            yourDays: streak,
            theirDays: Math.max(0, streak - 2),
        },
    ], [streak]);

    // Check if it's late in the day (after 8 PM)
    const isLateInDay = useMemo(() => {
        return new Date().getHours() >= 20;
    }, []);

    // Check if daily goal is hit
    const dailyGoalHit = useMemo(() => {
        return dailyLog.calories > 0 && dailyLog.protein > 0;
    }, [dailyLog]);

    // Flame intensity based on streak
    const flameIntensity = useMemo((): 'spark' | 'fire' | 'inferno' => {
        if (streak >= 30) return 'inferno';
        if (streak >= 7) return 'fire';
        return 'spark';
    }, [streak]);

    // Is flame dying (late + no log)
    const isFlameDying = isLateInDay && !dailyGoalHit;

    return {
        // Core stats
        currentStreak: streak,
        longestStreak,
        freezesAvailable: economy.streakFreezes || 2,
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
    };
}
