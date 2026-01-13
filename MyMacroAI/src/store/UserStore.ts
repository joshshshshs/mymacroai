import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import {
    UserState,
    MacroTarget,
    DailyLog,
    StoreItem,
    User,
    UserPreferences,
    HealthMetrics,
    Squad,
    Reaction
} from '../types';

// ============================================================================
// MMKV Setup
// ============================================================================

export const storage = new MMKV({
    id: 'user-storage-v3-encrypted',
    encryptionKey: 'my-macro-ai-secure-key'
});

const mmkvStorage: StateStorage = {
    setItem: (name, value) => storage.set(name, value),
    getItem: (name) => storage.getString(name) ?? null,
    removeItem: (name) => storage.delete(name),
};

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TARGETS: MacroTarget = {
    calories: 2500,
    protein: 180,
    carbs: 250,
    fats: 80,
};

const DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'system',
    notifications: true,
    healthSync: true,
    aiRecommendations: true,
    language: 'en',
    measurementSystem: 'metric',
    dietaryPreferences: [],
    fitnessGoals: [],
    notificationSchedule: {
        morning: true,
        afternoon: true,
        evening: false
    }
};

const INITIAL_ECONOMY = {
    macroCoins: 1000,
    totalSpent: 0,
    totalEarned: 1000,
    purchaseHistory: [],
    unlockedThemes: []
};

const INITIAL_SOCIAL = {
    squad: null,
    streak: 0,
    lastStreakUpdate: new Date().toISOString(),
    reactionsReceived: [],
    reactionsSent: []
};


// ============================================================================
// Store Implementation
// ============================================================================

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            // ----------------------------------------------------------------
            // Initial State
            // ----------------------------------------------------------------
            dailyTarget: DEFAULT_TARGETS,
            currentIntake: { calories: 0, protein: 0, carbs: 0, fats: 0 },
            dailyLog: {
                history: [],
                lastUpdated: Date.now(),
            },
            pantry: [],

            user: null,
            isAuthenticated: false,
            isOnboardingCompleted: false,
            founderStatus: { isFounder: false, number: null },
            isPro: false,
            isProMember: false,

            healthMetrics: {
                weight: null,
                height: null,
                bmi: null,
                bodyFat: null,
                muscleMass: null,
                hydration: null,
                sleepQuality: null,
                stressLevel: null,
                age: null,
                lastUpdated: null
            },
            preferences: DEFAULT_PREFERENCES,

            hardware: {
                hasWearable: false,
                deviceType: 'none',
            },
            dashboardLayout: {
                showHeartRate: false,
                showSleep: false,
                showSteps: true,
            },

            streak: 0,
            coins: 1000,
            purchaseHistory: [],
            economy: INITIAL_ECONOMY,
            social: INITIAL_SOCIAL,

            consistencyMetrics: {
                streak: 0,
                logCompliance: 0,
                consistencyScore: 0,
                last7Days: []
            },

            freeAdjustmentsUsed: 0,

            // ----------------------------------------------------------------
            // Core Actions
            // ----------------------------------------------------------------

            updateIntake: (intake) =>
                set((state) => ({
                    currentIntake: { ...state.currentIntake, ...intake }
                })),

            logFood: (calories, protein, carbs, fats, name = 'Quick Add') => {
                const newLog: DailyLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'food',
                    date: new Date().toISOString(), // Rich format
                    timestamp: Date.now(),

                    // Food Specific
                    foodName: name,
                    calories,
                    protein,
                    carbs,
                    fats,

                    // Rich Data
                    mood: 3, // Default
                    createdAt: new Date().toISOString()
                };

                set((state) => ({
                    currentIntake: {
                        calories: state.currentIntake.calories + calories,
                        protein: state.currentIntake.protein + protein,
                        carbs: state.currentIntake.carbs + carbs,
                        fats: state.currentIntake.fats + fats,
                    },
                    dailyLog: {
                        history: [newLog, ...state.dailyLog.history],
                        lastUpdated: Date.now()
                    },
                    coins: state.coins + 10,
                    economy: {
                        ...state.economy,
                        macroCoins: state.economy.macroCoins + 10,
                        totalEarned: state.economy.totalEarned + 10
                    }
                }));
            },

            addDailyLog: (log: DailyLog) => {
                set((state) => ({
                    dailyLog: {
                        history: [log, ...state.dailyLog.history],
                        lastUpdated: Date.now()
                    }
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
            setProStatus: (isPro) => set({ isPro, isProMember: isPro }),

            resetDaily: () =>
                set((state) => ({
                    currentIntake: { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    dailyLog: { history: [], lastUpdated: Date.now() }
                })),

            incrementStreak: () => set((state) => ({
                streak: state.streak + 1,
                social: { ...state.social, streak: state.social.streak + 1 }
            })),

            addCoins: (amount) => set((state) => ({
                coins: state.coins + amount,
                economy: {
                    ...state.economy,
                    macroCoins: state.economy.macroCoins + amount,
                    totalEarned: state.economy.totalEarned + amount
                }
            })),

            purchaseItem: (item: StoreItem) => {
                const state = get();
                const currentCoins = state.economy.macroCoins;

                if (currentCoins >= item.price) {
                    const newEconomy = {
                        ...state.economy,
                        macroCoins: currentCoins - item.price,
                        totalSpent: state.economy.totalSpent + item.price,
                        purchaseHistory: [...state.economy.purchaseHistory, { ...item, isPurchased: true }]
                    };

                    set({
                        coins: newEconomy.macroCoins,
                        economy: newEconomy,
                        purchaseHistory: newEconomy.purchaseHistory
                    });
                    return true;
                }
                return false;
            },

            updateHealthMetrics: (metrics) => set((state) => ({
                healthMetrics: { ...state.healthMetrics, ...metrics, lastUpdated: new Date().toISOString() }
            })),

            // ----------------------------------------------------------------
            // Action Groups
            // ----------------------------------------------------------------

            actions: {
                setUser: (user: User) => set({ user, isAuthenticated: true }),
                setAuthenticated: (auth: boolean) => set({ isAuthenticated: auth }),
                completeOnboarding: () => set({ isOnboardingCompleted: true }),

                // Health
                updateHealthMetrics: (metrics) => set((state) => ({
                    healthMetrics: { ...state.healthMetrics, ...metrics, lastUpdated: new Date().toISOString() }
                })),

                setHardware: (hasWearable, type) => set((state) => ({
                    hardware: { hasWearable, deviceType: type },
                    dashboardLayout: {
                        ...state.dashboardLayout,
                        showHeartRate: hasWearable,
                        showSleep: hasWearable
                    }
                })),

                toggleDashboardModule: (module) => set((state) => ({
                    dashboardLayout: {
                        ...state.dashboardLayout,
                        [module]: !state.dashboardLayout[module]
                    }
                })),

                // Settings
                updatePreferences: (prefs) => set((state) => ({
                    preferences: { ...state.preferences, ...prefs }
                })),

                // Social
                joinSquad: (squad: Squad) => set((state) => ({
                    social: { ...state.social, squad }
                })),

                leaveSquad: () => set((state) => ({
                    social: { ...state.social, squad: null }
                })),

                addReaction: (reaction) => {
                    const newReaction: Reaction = {
                        ...reaction,
                        id: Date.now().toString()
                    };
                    set((state) => ({
                        social: {
                            ...state.social,
                            reactionsSent: [...state.social.reactionsSent, newReaction]
                        }
                    }));
                }
            }
        }),
        {
            name: 'user-storage-v3-encrypted',
            storage: createJSONStorage(() => mmkvStorage),
            version: 1, // Reset version for new storage file
            migrate: (persistedState: any, version: number) => {
                // Simple migration: if version mismatch, just return state or merge safe defaults
                // For now, assuming fresh start or benign merge
                return {
                    ...persistedState,
                    economy: persistedState.economy || INITIAL_ECONOMY,
                    social: persistedState.social || INITIAL_SOCIAL,
                };
            },
        }
    )
);

// ----------------------------------------------------------------
// Legacy Hooks Shim
// ----------------------------------------------------------------

export const useUser = () => useUserStore(state => state.user);
export const useIsAuthenticated = () => useUserStore(state => state.isAuthenticated);
export const usePreferences = () => useUserStore(state => state.preferences);
// Note: useDailyLogs returns the history array to match legacy expectation of DailyLog[]
export const useDailyLogs = () => useUserStore(state => state.dailyLog.history);
export const useHealthMetrics = () => useUserStore(state => state.healthMetrics);
// isLoading/error not implemented in state currently, returning defaults
export const useIsLoading = () => false;
export const useError = () => null;

export const useEconomy = () => useUserStore(state => state.economy);
export const useMacroCoins = () => useUserStore(state => state.economy.macroCoins);
export const usePurchaseHistory = () => useUserStore(state => state.economy.purchaseHistory);

export const useSocial = () => useUserStore(state => state.social);
export const useSquad = () => useUserStore(state => state.social.squad);
export const useStreak = () => useUserStore(state => state.social.streak);
export const useReactions = () => useUserStore(state => state.social.reactionsSent);

export const useConsistencyMetrics = () => useUserStore(state => state.consistencyMetrics);
export const useFreeAdjustmentsUsed = () => useUserStore(state => state.freeAdjustmentsUsed);
export const useIsProMember = () => useUserStore(state => state.isProMember);

// Shim for useUserActions to return bound actions
export const useUserActions = () => {
    const store = useUserStore();
    return {
        // Spread both top-level and nested actions
        ...store.actions,
        updateIntake: store.updateIntake,
        logFood: store.logFood,
        addDailyLog: store.addDailyLog, // Legacy support
        purchaseItem: store.purchaseItem,
        addCoins: store.addCoins,
        incrementStreak: store.incrementStreak
    };
};
