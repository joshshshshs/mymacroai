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

// ============================================================================
// MMKV Setup (Lazy Initialization with Fallback)
// ============================================================================

let _storage: MMKV | null = null;
let _storageError = false;

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
            encryptionKey: 'my-macro-ai-secure-key'
        });
        return _storage;
    } catch (error) {
        console.warn('[UserStore] MMKV initialization failed, using memory fallback:', error);
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
export const storage = {
    get instance() { return getStorage(); },
    set: (key: string, value: string) => mmkvStorage.setItem(key, value),
    getString: (key: string) => mmkvStorage.getItem(key),
    delete: (key: string) => mmkvStorage.removeItem(key),
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
    customReactionEmojis: ['🔥', '💪', '👏', '❤️']
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

const INITIAL_ATHLETE_PROFILE: AthleteProfile = DEFAULT_ATHLETE_PROFILE;

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

            // Training Identity System
            trainingStyles: [] as TrainingStyle[],

            // Bio-Optimization Profile
            bioOptimizationProfile: DEFAULT_BIO_OPTIMIZATION_PROFILE,

            // AI Personalization
            coachIntensity: 50, // Default: balanced (0=Gentle, 100=Spartan)

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

            logFood: (calories, protein, carbs, fats, name = 'Quick Add') => {
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const newLog: DailyLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'food',
                    date: new Date().toISOString(),
                    timestamp: Date.now(),
                    foodName: name,
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
        incrementStreak: store.incrementStreak
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
