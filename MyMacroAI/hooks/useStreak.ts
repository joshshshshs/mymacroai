/**
 * useStreak - Hook for streak and gamification data
 */

import { useState, useCallback, useMemo } from 'react';

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

// ============================================================================
// Mock Data
// ============================================================================

function generateMockHistory(): DayEntry[] {
    const history: DayEntry[] = [];
    const today = new Date();
    const workouts = ['Chest Day', 'Leg Day', 'Pull Day', 'Rest'];

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        let status: DayStatus = 'HIT';
        if (i === 15) status = 'FROZEN';
        else if (i === 22) status = 'MISS';
        else if (i === 8 || i === 18) status = 'PARTIAL';

        const workout = workouts[i % 4];
        const calories = status === 'HIT' ? Math.floor(Math.random() * 500) + 2000 :
                        status === 'PARTIAL' ? Math.floor(Math.random() * 300) + 1500 : undefined;

        history.push({
            date: date.toISOString().split('T')[0],
            status,
            calories,
            workout: status === 'HIT' ? workout : undefined,
            summary: status === 'HIT' ? `${calories?.toLocaleString()} kcal • ${workout}` :
                    status === 'PARTIAL' ? `${calories?.toLocaleString()} kcal • Partial log` :
                    status === 'FROZEN' ? 'Streak freeze used' :
                    status === 'MISS' ? 'No activity logged' : undefined,
        });
    }

    return history;
}

function generateMockStreak(): StreakData {
    return {
        currentStreak: 12,
        longestStreak: 45,
        freezesAvailable: 2,
        coins: 1450,
        history: generateMockHistory(),
        dailyGoalHit: false,
    };
}

// ============================================================================
// Hook
// ============================================================================

export function useStreak() {
    const [data, setData] = useState<StreakData>(generateMockStreak);

    // Check if it's late in the day (after 8 PM)
    const isLateInDay = useMemo(() => {
        return new Date().getHours() >= 20;
    }, []);

    // Calculate streak intensity (0-1) for flame size
    const streakIntensity = useMemo(() => {
        const streak = data.currentStreak;
        if (streak <= 3) return 0.2;
        if (streak <= 7) return 0.4;
        if (streak <= 14) return 0.6;
        if (streak <= 30) return 0.8;
        return 1.0;
    }, [data.currentStreak]);

    // Get milestones with achieved status
    const milestones = useMemo((): Milestone[] => {
        return MILESTONES.map(m => ({
            ...m,
            achieved: data.longestStreak >= m.days,
            achievedDate: data.longestStreak >= m.days ? 'Jan 2' : undefined,
        }));
    }, [data.longestStreak]);

    // Get next milestone
    const nextMilestone = useMemo(() => {
        return milestones.find(m => !m.achieved) || milestones[milestones.length - 1];
    }, [milestones]);

    // Days until next milestone
    const daysUntilNextMilestone = useMemo(() => {
        if (!nextMilestone) return 0;
        return Math.max(0, nextMilestone.days - data.currentStreak);
    }, [nextMilestone, data.currentStreak]);

    // Use freeze
    const useFreeze = useCallback(() => {
        if (data.freezesAvailable > 0) {
            setData(prev => ({
                ...prev,
                freezesAvailable: prev.freezesAvailable - 1,
            }));
            return true;
        }
        return false;
    }, [data.freezesAvailable]);

    // Buy freeze (costs 500 coins)
    const buyFreeze = useCallback(() => {
        const cost = 500;
        if (data.coins >= cost) {
            setData(prev => ({
                ...prev,
                coins: prev.coins - cost,
                freezesAvailable: prev.freezesAvailable + 1,
            }));
            return true;
        }
        return false;
    }, [data.coins]);

    // Spend coins
    const spendCoins = useCallback((amount: number) => {
        if (data.coins >= amount) {
            setData(prev => ({ ...prev, coins: prev.coins - amount }));
            return true;
        }
        return false;
    }, [data.coins]);

    return {
        data,
        isLateInDay,
        streakIntensity,
        milestones,
        nextMilestone,
        daysUntilNextMilestone,
        useFreeze,
        buyFreeze,
        spendCoins,
    };
}
