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
    Reaction,
    AthleteProfile,
    DEFAULT_ATHLETE_PROFILE,
    BioOptimizationProfile,
    PeptideStatus,
    ActiveCompound,
    DEFAULT_BIO_OPTIMIZATION_PROFILE,
} from '../types';
import {
    ThemePalette,
    getThemePalette,
    getDefaultTheme,
    isThemeAvailable,
    getEffectivePrice,
} from '../design-system/themes';

// ============================================================================
// MMKV Setup (Lazy Initialization with Fallback)
// ============================================================================

let _storage: MMKV | null = null;
let _storageError = false;

/**
 * Gets the MMKV encryption key from environment variable.
 * In production, requires proper key configuration.
 */
const getEncryptionKey = (): string => {
    const envKey = process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY;
    if (envKey && envKey.length >= 16) {
        return envKey;
    }
    // In development, use a dev-only fallback
    if (__DEV__) {
        return 'dev-only-encryption-key-16';
    }
    // Production requires proper encryption key
    throw new Error(
        'MMKV encryption key not configured. Set EXPO_PUBLIC_MMKV_ENCRYPTION_KEY (min 16 chars) in environment.'
    );
};

/**
 * Lazy MMKV getter - only initializes when first accessed.
 * This prevents crashes when JSI isn't ready (e.g., remote debugger).
 */
const getStorage = (): MMKV | null => {
    if (_storageError) return null;
    if (_storage) return _storage;

    try {
        _storage = new MMKV({
            id: 'user-storage-v3-encrypted',
            encryptionKey: getEncryptionKey()
        });
        return _storage;
    } catch (error) {
        if (__DEV__) {
            // Suppress the warning if it's the known JSI error from remote debugging
            const errorMessage = String(error);
            if (errorMessage.includes('JSI') || errorMessage.includes('synchronous')) {
                console.log('[UserStore] Running in Remote Debugger mode: Persistence disabled (Memory Fallback active)');
            } else {
                console.warn('[UserStore] MMKV initialization failed, using memory fallback:', error);
            }
        }
        _storageError = true;
        return null;
    }
};

// Memory fallback when MMKV is unavailable
const memoryStorage = new Map<string, string>();

const mmkvStorage: StateStorage = {
    setItem: (name, value) => {
        const storage = getStorage();
        if (storage) {
            storage.set(name, value);
        } else {
            memoryStorage.set(name, value);
        }
    },
    getItem: (name) => {
        const storage = getStorage();
        if (storage) {
            return storage.getString(name) ?? null;
        }
        return memoryStorage.get(name) ?? null;
    },
    removeItem: (name) => {
        const storage = getStorage();
        if (storage) {
            storage.delete(name);
        } else {
            memoryStorage.delete(name);
        }
    },
};

// Export storage getter for external use
// Note: getString is synchronous (MMKV is sync), cast to remove Promise type
export const storage = {
    get instance() { return getStorage(); },
    set: (key: string, value: string): void => {
        mmkvStorage.setItem(key, value);
    },
    getString: (key: string): string | null => {
        const result = mmkvStorage.getItem(key);
        // MMKV getItem is synchronous, but StateStorage type allows Promise
        // We know this is sync, so cast appropriately
        if (typeof result === 'string' || result === null) {
            return result;
        }
        return null; // Fallback for type safety
    },
    delete: (key: string): void => {
        mmkvStorage.removeItem(key);
    },
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

const DEFAULT_TARGET_ADJUSTMENT: MacroTarget = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
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
    },
    // Default reaction emojis
    customReactionEmojis: ['🔥', '💪', '👏', '❤️'],
    // App experience
    haptics: true,
    aiVoice: 'coach_alex',
};

const INITIAL_ECONOMY = {
    macroCoins: 1000,
    totalSpent: 0,
    totalEarned: 1000,
    purchaseHistory: [],
    unlockedThemes: [],
    streakFreezes: 2, // Default streak freezes
};

const INITIAL_SOCIAL = {
    squad: null,
    streak: 0,
    lastStreakUpdate: new Date().toISOString(),
    reactionsReceived: [],
    reactionsSent: []
};

const INITIAL_ATHLETE_PROFILE: AthleteProfile = DEFAULT_ATHLETE_PROFILE;

// Theme System Defaults
const INITIAL_THEME_STATE = {
    activeThemeId: 'vitamin-orange',
    ownedThemes: ['vitamin-orange'], // Default theme is always owned
};

// Training Style Types
export type TrainingStyle =
    | 'bodybuilding'
    | 'running'
    | 'calisthenics'
    | 'powerlifting'
    | 'crossfit'
    | 'yoga';

export const TRAINING_STYLES: { id: TrainingStyle; label: string; icon: string; focus: string }[] = [
    { id: 'bodybuilding', label: 'Bodybuilding', icon: '🏋️', focus: 'Hypertrophy, Aesthetics' },
    { id: 'running', label: 'Running / Endurance', icon: '🏃', focus: 'VO2 Max, Stamina' },
    { id: 'calisthenics', label: 'Calisthenics', icon: '🤸', focus: 'Relative Strength, Skills' },
    { id: 'powerlifting', label: 'Powerlifting', icon: '🏋️‍♀️', focus: 'Max Strength, CNS' },
    { id: 'crossfit', label: 'CrossFit', icon: '🔥', focus: 'Work Capacity, Metcon' },
    { id: 'yoga', label: 'Yoga / Mobility', icon: '🧘', focus: 'Recovery, ROM' },
];


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
            dailyTargetAdjustment: DEFAULT_TARGET_ADJUSTMENT,
            currentIntake: { calories: 0, protein: 0, carbs: 0, fats: 0 },

            // Per-day intake storage (date string -> MacroTarget)
            dailyIntakes: {} as Record<string, { calories: number; protein: number; carbs: number; fats: number }>,

            // Per-day log storage (date string -> DailyLog[])
            dailyLogs: {} as Record<string, DailyLog[]>,

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
                steps: null,
                activeCalories: null,
                distance: null,
                sleepMinutes: null,
                heartRate: null,
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

            // Health Grid Layout (Bevel-style reorderable widgets)
            healthLayout: ['recovery', 'calories', 'strain', 'sleep', 'heart_rate'],

            streak: 0,
            longestStreak: 0, // Track longest streak achieved
            coins: 1000,
            purchaseHistory: [],
            economy: INITIAL_ECONOMY,
            social: INITIAL_SOCIAL,

            // Public Profile (Athlete Card)
            athleteProfile: INITIAL_ATHLETE_PROFILE,

            consistencyMetrics: {
                streak: 0,
                logCompliance: 0,
                consistencyScore: 0,
                last7Days: []
            },

            freeAdjustmentsUsed: 0,

            // Shop Item Properties (initialized)
            streakFreezes: [],
            ghostModeActive: false,
            ghostModeExpiresAt: undefined,
            unlockedFrames: [],
            unlockedNudgePatterns: [],
            unlockedAppIcons: [],

            // Training Identity System
            trainingStyles: [] as TrainingStyle[],

            // Bio-Optimization Profile
            bioOptimizationProfile: DEFAULT_BIO_OPTIMIZATION_PROFILE,

            // AI Personalization
            coachIntensity: 50, // Default: balanced (0=Gentle, 100=Spartan)

            // Water Tracking
            waterIntake: 0,
            waterGoal: 2500,
            waterHistory: [] as { id: string; amount: number; time: string; type: string }[],

            // Theme System (Chromatosphere)
            activeThemeId: INITIAL_THEME_STATE.activeThemeId,
            ownedThemes: INITIAL_THEME_STATE.ownedThemes,

            // ----------------------------------------------------------------
            // Core Actions
            // ----------------------------------------------------------------

            updateIntake: (intake) =>
                set((state) => ({
                    currentIntake: { ...state.currentIntake, ...intake }
                })),

            setDailyTargetAdjustment: (adjustment) =>
                set((state) => ({
                    dailyTargetAdjustment: {
                        ...state.dailyTargetAdjustment,
                        ...adjustment
                    }
                })),

            logFood: (calories, protein, carbs, fats, name = 'Quick Add', mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks', targetDate?: string) => {
                const today = targetDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserStore.ts:logFood',message:'Logging food to date',data:{targetDate:today,providedTargetDate:targetDate||'none',actualToday:new Date().toISOString().split('T')[0],name,calories,mealType:mealType||'auto'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
                // #endregion

                // Auto-determine meal type based on current time if not specified
                const determineMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snacks' => {
                    if (mealType) return mealType;

                    const hour = new Date().getHours();
                    if (hour >= 6 && hour < 10) return 'breakfast';
                    if (hour >= 11 && hour < 14) return 'lunch';
                    if (hour >= 17 && hour < 21) return 'dinner';
                    return 'snacks'; // Default to snacks for all other times
                };

                const newLog: DailyLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'food',
                    date: new Date().toISOString(),
                    timestamp: Date.now(),
                    foodName: name,
                    mealType: determineMealType(), // Auto-detect meal type based on time
                    calories,
                    protein,
                    carbs,
                    fats,
                    mood: 3,
                    createdAt: new Date().toISOString()
                };

                set((state) => {
                    // Get existing intake for today
                    const existingIntake = state.dailyIntakes[today] || { calories: 0, protein: 0, carbs: 0, fats: 0 };
                    const existingLogs = state.dailyLogs[today] || [];

                    return {
                        // Update current intake (for today's view)
                        currentIntake: {
                            calories: state.currentIntake.calories + calories,
                            protein: state.currentIntake.protein + protein,
                            carbs: state.currentIntake.carbs + carbs,
                            fats: state.currentIntake.fats + fats,
                        },
                        // Save to date-keyed storage
                        dailyIntakes: {
                            ...state.dailyIntakes,
                            [today]: {
                                calories: existingIntake.calories + calories,
                                protein: existingIntake.protein + protein,
                                carbs: existingIntake.carbs + carbs,
                                fats: existingIntake.fats + fats,
                            }
                        },
                        dailyLogs: {
                            ...state.dailyLogs,
                            [today]: [newLog, ...existingLogs]
                        },
                        // Also keep in legacy dailyLog for backwards compat
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
                    };
                });
            },

            addDailyLog: (log: DailyLog) => {
                const dateKey = log.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0];
                set((state) => {
                    const existingLogs = state.dailyLogs[dateKey] || [];
                    return {
                        dailyLog: {
                            history: [log, ...state.dailyLog.history],
                            lastUpdated: Date.now()
                        },
                        dailyLogs: {
                            ...state.dailyLogs,
                            [dateKey]: [log, ...existingLogs]
                        }
                    };
                });
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

            // Free adjustment tracking (for non-pro users)
            incrementFreeAdjustments: () => set((state) => ({
                freeAdjustmentsUsed: state.freeAdjustmentsUsed + 1
            })),

            // Health sync placeholder
            syncHealthData: async () => {
                // This would integrate with HealthKit/Google Fit
                // For now, just return success
                if (__DEV__) console.log('[UserStore] syncHealthData called');
                return true;
            },

            incrementStreak: () => set((state) => {
                const newStreak = state.streak + 1;
                return {
                    streak: newStreak,
                    longestStreak: Math.max(state.longestStreak, newStreak),
                    social: { ...state.social, streak: state.social.streak + 1 }
                };
            }),

            addCoins: (amount) => set((state) => ({
                coins: state.coins + amount,
                economy: {
                    ...state.economy,
                    macroCoins: state.economy.macroCoins + amount,
                    totalEarned: state.economy.totalEarned + amount
                }
            })),

            // Water Logging
            logWater: (amount: number, type: string = 'Water') => set((state) => {
                const newEntry = {
                    id: Date.now().toString(),
                    amount,
                    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    type,
                };
                return {
                    waterIntake: state.waterIntake + amount,
                    waterHistory: [newEntry, ...state.waterHistory],
                    // Award 5 coins for logging water
                    coins: state.coins + 5,
                    economy: {
                        ...state.economy,
                        macroCoins: state.economy.macroCoins + 5,
                        totalEarned: state.economy.totalEarned + 5,
                    },
                };
            }),

            setWaterGoal: (goal: number) => set({ waterGoal: goal }),

            resetWaterIntake: () => set({
                waterIntake: 0,
                waterHistory: [],
            }),

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

            // ----------------------------------------------------------------
            // Shop Item Handlers
            // ----------------------------------------------------------------

            addStreakFreeze: (freeze: any) => set((state) => ({
                streakFreezes: [...(state.streakFreezes || []), freeze]
            })),

            activateGhostMode: (expiresAt: string) => set({
                ghostModeActive: true,
                ghostModeExpiresAt: expiresAt
            }),

            unlockProfileFrame: (frameId: string) => set((state) => ({
                unlockedFrames: [...(state.unlockedFrames || []), frameId]
            })),

            unlockNudgePattern: (patternId: string) => set((state) => ({
                unlockedNudgePatterns: [...(state.unlockedNudgePatterns || []), patternId]
            })),

            unlockAppIcon: (iconId: string) => set((state) => ({
                unlockedAppIcons: [...(state.unlockedAppIcons || []), iconId]
            })),

            updateHealthMetrics: (metrics) => set((state) => ({
                healthMetrics: { ...state.healthMetrics, ...metrics, lastUpdated: new Date().toISOString() }
            })),

            updateHealthLayout: (layout) => set({ healthLayout: layout }),

            updateAthleteProfile: (profile) => set((state) => ({
                athleteProfile: { ...state.athleteProfile, ...profile }
            })),

            // Training Identity
            setTrainingStyles: (styles: TrainingStyle[]) => set({ trainingStyles: styles }),

            // ----------------------------------------------------------------
            // Bio-Optimization Actions
            // ----------------------------------------------------------------

            updateBioOptimizationProfile: (profile: Partial<BioOptimizationProfile>) =>
                set((state) => ({
                    bioOptimizationProfile: {
                        ...state.bioOptimizationProfile,
                        ...profile,
                        lastUpdated: new Date().toISOString(),
                    }
                })),

            setPeptideStatus: (status: PeptideStatus) =>
                set((state) => ({
                    bioOptimizationProfile: {
                        ...state.bioOptimizationProfile,
                        peptideStatus: status,
                        // Clear compounds if switching to NONE or PREFER_NOT_TO_SAY
                        activeCompounds: (status === 'NONE' || status === 'PREFER_NOT_TO_SAY')
                            ? []
                            : state.bioOptimizationProfile.activeCompounds,
                        lastUpdated: new Date().toISOString(),
                    }
                })),

            addActiveCompound: (compound: ActiveCompound) =>
                set((state) => ({
                    bioOptimizationProfile: {
                        ...state.bioOptimizationProfile,
                        activeCompounds: [...state.bioOptimizationProfile.activeCompounds, compound],
                        peptideStatus: 'ACTIVE_DISCLOSED' as PeptideStatus,
                        lastUpdated: new Date().toISOString(),
                    }
                })),

            removeActiveCompound: (compoundId: string) =>
                set((state) => ({
                    bioOptimizationProfile: {
                        ...state.bioOptimizationProfile,
                        activeCompounds: state.bioOptimizationProfile.activeCompounds.filter(
                            (c) => c.id !== compoundId
                        ),
                        lastUpdated: new Date().toISOString(),
                    }
                })),

            updateActiveCompound: (compoundId: string, updates: Partial<ActiveCompound>) =>
                set((state) => ({
                    bioOptimizationProfile: {
                        ...state.bioOptimizationProfile,
                        activeCompounds: state.bioOptimizationProfile.activeCompounds.map((c) =>
                            c.id === compoundId ? { ...c, ...updates } : c
                        ),
                        lastUpdated: new Date().toISOString(),
                    }
                })),

            acknowledgePeptideDisclaimer: () =>
                set((state) => ({
                    bioOptimizationProfile: {
                        ...state.bioOptimizationProfile,
                        disclaimerAcknowledged: true,
                        disclaimerAcknowledgedAt: new Date().toISOString(),
                    }
                })),

            // ----------------------------------------------------------------
            // AI Personalization Actions
            // ----------------------------------------------------------------

            setCoachIntensity: (intensity: number) =>
                set({ coachIntensity: Math.max(0, Math.min(100, intensity)) }),

            // ----------------------------------------------------------------
            // Theme System Actions (Chromatosphere)
            // ----------------------------------------------------------------

            setActiveTheme: (themeId: string) => {
                const state = get();
                // Only allow setting if theme is available
                if (isThemeAvailable(themeId, state.ownedThemes, state.isPro)) {
                    set({ activeThemeId: themeId });
                    return true;
                }
                return false;
            },

            purchaseTheme: (themeId: string) => {
                const state = get();
                const theme = getThemePalette(themeId);
                const effectivePrice = getEffectivePrice(theme, state.isPro);

                // Already owned?
                if (state.ownedThemes.includes(themeId)) {
                    return { success: false, reason: 'already_owned' };
                }

                // Free for Pro users?
                if (theme.isPro && state.isPro) {
                    set({
                        ownedThemes: [...state.ownedThemes, themeId],
                        activeThemeId: themeId, // Auto-equip on purchase
                    });
                    return { success: true, reason: 'pro_unlock' };
                }

                // Check coin balance
                if (state.economy.macroCoins < effectivePrice) {
                    return { success: false, reason: 'insufficient_funds' };
                }

                // Execute purchase
                set({
                    ownedThemes: [...state.ownedThemes, themeId],
                    activeThemeId: themeId, // Auto-equip on purchase
                    coins: state.coins - effectivePrice,
                    economy: {
                        ...state.economy,
                        macroCoins: state.economy.macroCoins - effectivePrice,
                        totalSpent: state.economy.totalSpent + effectivePrice,
                        unlockedThemes: [...state.economy.unlockedThemes, themeId],
                    },
                });
                return { success: true, reason: 'purchased' };
            },

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
                    dailyTargetAdjustment: persistedState.dailyTargetAdjustment || DEFAULT_TARGET_ADJUSTMENT,
                    bioOptimizationProfile: persistedState.bioOptimizationProfile || DEFAULT_BIO_OPTIMIZATION_PROFILE,
                    // Theme System migration
                    activeThemeId: persistedState.activeThemeId || INITIAL_THEME_STATE.activeThemeId,
                    ownedThemes: persistedState.ownedThemes || INITIAL_THEME_STATE.ownedThemes,
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
export const useDailyTargetAdjustment = () => useUserStore(state => state.dailyTargetAdjustment);
export const useAdjustedDailyTarget = () =>
    useUserStore(state => ({
        ...state.dailyTarget,
        calories: state.dailyTarget.calories + (state.dailyTargetAdjustment?.calories ?? 0),
    }));
// Note: useDailyLogs returns the history array to match legacy expectation of DailyLog[]
export const useDailyLogs = () => useUserStore(state => state.dailyLog.history);

// Date-based helpers for per-day diary
export const getIntakeForDate = (dateString: string) => {
    const state = useUserStore.getState();
    return state.dailyIntakes[dateString] || { calories: 0, protein: 0, carbs: 0, fats: 0 };
};

export const getLogsForDate = (dateString: string) => {
    const state = useUserStore.getState();
    return state.dailyLogs[dateString] || [];
};

// Hook version for reactive updates
export const useIntakeForDate = (dateString: string) => {
    return useUserStore(state => state.dailyIntakes[dateString] || { calories: 0, protein: 0, carbs: 0, fats: 0 });
};

export const useLogsForDate = (dateString: string) => {
    return useUserStore(state => state.dailyLogs[dateString] || []);
};

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
export const useHealthLayout = () => useUserStore(state => state.healthLayout);

// Training Identity
export const useTrainingStyles = () => useUserStore(state => state.trainingStyles);
export const useAthleteType = () => {
    const styles = useUserStore(state => state.trainingStyles);
    return styles.length > 1 ? 'HYBRID' : styles.length === 1 ? 'FOCUSED' : 'UNDEFINED';
};

// Bio-Optimization Hooks
export const useBioOptimizationProfile = () => useUserStore(state => state.bioOptimizationProfile);
export const usePeptideStatus = () => useUserStore(state => state.bioOptimizationProfile.peptideStatus);
export const useActiveCompounds = () => useUserStore(state => state.bioOptimizationProfile.activeCompounds);
export const usePeptideDisclaimerAcknowledged = () => useUserStore(state => state.bioOptimizationProfile.disclaimerAcknowledged);

// AI Personalization Hooks
export const useCoachIntensity = () => useUserStore(state => state.coachIntensity);

// Theme System Hooks (Chromatosphere)
export const useActiveThemeId = () => useUserStore(state => state.activeThemeId);
export const useOwnedThemes = () => useUserStore(state => state.ownedThemes);
export const useSetActiveTheme = () => useUserStore(state => state.setActiveTheme);
export const usePurchaseTheme = () => useUserStore(state => state.purchaseTheme);

/**
 * Primary theme hook - returns the full theme palette for the active theme
 * Use this in components to get all theme colors
 */
export const useActiveTheme = (): ThemePalette => {
    const activeThemeId = useUserStore(state => state.activeThemeId);
    return getThemePalette(activeThemeId);
};

/**
 * Check if a specific theme is owned/available to the current user
 */
export const useIsThemeOwned = (themeId: string): boolean => {
    const ownedThemes = useUserStore(state => state.ownedThemes);
    const isPro = useUserStore(state => state.isPro);
    return isThemeAvailable(themeId, ownedThemes, isPro);
};

// Shim for useUserActions to return bound actions
export const useUserActions = () => {
    const store = useUserStore();
    return {
        // Spread both top-level and nested actions
        ...store.actions,
        updateIntake: store.updateIntake,
        setDailyTargetAdjustment: store.setDailyTargetAdjustment,
        logFood: store.logFood,
        addDailyLog: store.addDailyLog, // Legacy support
        purchaseItem: store.purchaseItem,
        addCoins: store.addCoins,
        incrementStreak: store.incrementStreak,
        incrementFreeAdjustments: store.incrementFreeAdjustments,
        syncHealthData: store.syncHealthData,
        // @ts-ignore - updatePreferences exists on state but TS needs explicit type
        updatePreferences: (store as any).updatePreferences,
    };
};

/**
 * Get comprehensive user context for AI prompts
 * This is passed to the AI so it can personalize advice
 */
export const getUserContextForAI = (): string => {
    const state = useUserStore.getState();
    const bio = state.healthMetrics;
    const prefs = state.preferences;
    const targets = state.dailyTarget;
    const intake = state.currentIntake;
    const hardware = state.hardware;
    const health = state.healthMetrics;

    const lines: string[] = [];

    // Bio Data (from healthMetrics)
    if (bio.weight) lines.push(`Weight: ${bio.weight}kg`);
    if (bio.height) lines.push(`Height: ${bio.height}cm`);
    if (bio.age) lines.push(`Age: ${bio.age} years`);

    // Nutrition Goals
    lines.push(`Daily Targets: ${targets.calories}kcal, ${targets.protein}g protein, ${targets.carbs}g carbs, ${targets.fats}g fat`);
    lines.push(`Current Intake: ${intake.calories}kcal, ${intake.protein}g protein, ${intake.carbs}g carbs, ${intake.fats}g fat`);

    // Dietary Preferences
    if (prefs.dietaryPreferences?.length) {
        lines.push(`Diet: ${prefs.dietaryPreferences.join(', ')}`);
    }
    if (prefs.fitnessGoals?.length) {
        lines.push(`Goals: ${prefs.fitnessGoals.join(', ')}`);
    }

    // Training Identity
    const trainingStyles = state.trainingStyles || [];
    if (trainingStyles.length > 0) {
        const styleLabels = trainingStyles.map((s: TrainingStyle) =>
            TRAINING_STYLES.find(ts => ts.id === s)?.label || s
        );
        lines.push(`Training Styles: ${styleLabels.join(', ')}`);
        if (trainingStyles.length > 1) {
            lines.push(`Athlete Type: HYBRID (multi-disciplinary - adjust carb needs accordingly)`);
        }
    }

    // Hardware/Wearables
    if (hardware.hasWearable) {
        lines.push(`Connected Device: ${hardware.deviceType}`);
    }

    // Health Metrics (if available)
    if (health?.heartRate) lines.push(`Heart Rate: ${health.heartRate}bpm`);
    if (health?.sleepMinutes) lines.push(`Sleep: ${Math.round((health.sleepMinutes || 0) / 60)}h`);
    if (health?.steps) lines.push(`Steps: ${health.steps}`);
    if (health?.stressLevel) lines.push(`Stress Level: ${health.stressLevel}`);

    // Bio-Optimization Context (Privacy-Aware)
    const bioProfile = state.bioOptimizationProfile;
    if (bioProfile.peptideStatus === 'ACTIVE_DISCLOSED' && bioProfile.activeCompounds.length > 0) {
        lines.push(`Bio-Optimization Status: ACTIVE_DISCLOSED`);
        lines.push(`Active Compounds: ${bioProfile.activeCompounds.map(c => `${c.name} (${c.dosage}, ${c.frequency})`).join('; ')}`);
    } else if (bioProfile.peptideStatus === 'ACTIVE_UNDISCLOSED') {
        lines.push(`Bio-Optimization Status: ACTIVE_UNDISCLOSED (user has confirmed peptide use but details are private)`);
    } else if (bioProfile.peptideStatus === 'NONE') {
        lines.push(`Bio-Optimization Status: NONE`);
    }
    // Note: PREFER_NOT_TO_SAY results in no context injection - complete privacy

    // Preferences
    lines.push(`Units: ${prefs.measurementSystem || 'metric'}`);

    return lines.join('\n');
};

/**
 * Hook version for components
 */
export const useAIContext = () => {
    const bio = useUserStore(s => s.healthMetrics);
    const prefs = useUserStore(s => s.preferences);
    const targets = useUserStore(s => s.dailyTarget);
    const intake = useUserStore(s => s.currentIntake);
    const hardware = useUserStore(s => s.hardware);
    const health = useUserStore(s => s.healthMetrics);

    return { bio, prefs, targets, intake, hardware, health };
};
