import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV
export const storage = new MMKV({
    id: 'user-storage',
});

// Create MMKV Storage Adapter for Zustand
const mmkvStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value);
    },
    getItem: (name) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: (name) => {
        return storage.delete(name);
    },
};

// Types
interface LogEntry {
    id: string;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    timestamp: number;
}

interface MacroTarget {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface FounderStatus {
    isFounder: boolean;
    number: number | null; // e.g., Founder #42 out of 100
}

interface UserState {
    // Data
    dailyTarget: MacroTarget;
    currentIntake: MacroTarget;
    dailyLog: {
        history: LogEntry[];
        lastUpdated: number; // For daily reset logic
    };
    pantry: string[];

    // Gamification & Status
    streak: number;
    coins: number;
    founderStatus: FounderStatus;
    isPro: boolean;

    // Actions
    updateIntake: (intake: Partial<MacroTarget>) => void;
    logFood: (calories: number, protein: number, carbs: number, fats: number, name?: string) => void;
    updatePantry: (items: string[]) => void;
    addToPantry: (item: string) => void;
    removeFromPantry: (item: string) => void;
    setFounderStatus: (status: FounderStatus) => void;
    setProStatus: (isPro: boolean) => void;
    resetDaily: () => void;
    incrementStreak: () => void;
    addCoins: (amount: number) => void;
}

const DEFAULT_TARGETS: MacroTarget = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fats: 80,
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            dailyTarget: DEFAULT_TARGETS,
            currentIntake: { calories: 0, protein: 0, carbs: 0, fats: 0 },
            dailyLog: {
                history: [],
                lastUpdated: Date.now(),
            },
            pantry: [], // User's ingredients list from "Kitchen"

            streak: 12,
            coins: 150,
            founderStatus: { isFounder: false, number: null },
            isPro: false,

            updateIntake: (intake) =>
                set((state) => ({
                    currentIntake: { ...state.currentIntake, ...intake }
                })),

            logFood: (calories, protein, carbs, fats, name = 'Quick Add') => {
                const newLog: LogEntry = {
                    id: Math.random().toString(36).substr(2, 9),
                    foodName: name,
                    calories,
                    protein,
                    carbs,
                    fats,
                    timestamp: Date.now(),
                };

                set((state) => ({
                    currentIntake: {
                        calories: state.currentIntake.calories + calories,
                        protein: state.currentIntake.protein + protein,
                        carbs: state.currentIntake.carbs + carbs,
                        fats: state.currentIntake.fats + fats,
                    },
                    dailyLog: {
                        ...state.dailyLog,
                        history: [newLog, ...state.dailyLog.history],
                    },
                    coins: state.coins + 10, // Reward
                }));
            },

            updatePantry: (items) => set({ pantry: items }),

            addToPantry: (item) => set((state) => {
                if (state.pantry.includes(item)) return state;
                return { pantry: [...state.pantry, item] };
            }),

            removeFromPantry: (item) => set((state) => ({
                pantry: state.pantry.filter((i) => i !== item),
            })),

            setFounderStatus: (status) => set({ founderStatus: status }),
            setProStatus: (isPro) => set({ isPro }),

            resetDaily: () =>
                set((state) => ({
                    currentIntake: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    dailyLog: { history: [], lastUpdated: Date.now() }
                })),

            incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
            addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => mmkvStorage),
        }
    )
);
