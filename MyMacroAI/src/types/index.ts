// ============================================================================
// Core Data Types
// ============================================================================

export type DailyLogType =
    | 'nutrition'
    | 'workout'
    | 'biometric'
    | 'note'
    | 'food'
    | 'cycle'
    | 'weight';

export interface DailyLog {
    id: string;
    date: string; // ISO string
    timestamp: number;
    type: DailyLogType;

    // Core Food Data (Backward Compat with LogEntry)
    foodName?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;

    // Rich Data (Legacy DailyLog)
    mood?: number;
    energyLevel?: number;
    notes?: string;
    achievements?: string[];
    challenges?: string[];
    symptoms?: string[];

    // Nested Data
    nutritionData?: NutritionData | null;
    activityData?: WorkoutData | null;
    sleepData?: SleepData | null;

    createdAt?: string;
    updatedAt?: string;
}

// Alias for Modern components expecting LogEntry
export type LogEntry = DailyLog;

export interface MacroTarget {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

// ============================================================================
// Health & Biometrics
// ============================================================================

export interface HealthData {
    type: 'steps' | 'calories' | 'distance' | 'heartRate' | 'sleep' | 'weight' | 'bodyFat' | 'hydration';
    value: number;
    unit: string;
    source: 'healthkit' | 'healthconnect' | 'manual';
    timestamp: string;
}

export interface NutritionData {
    id: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium?: number;
    sugar?: number;
    timestamp: string;
    notes?: string;
}

export interface WorkoutData {
    id: string;
    type: string;
    duration: number; // minutes
    caloriesBurned: number;
    intensity: 'low' | 'medium' | 'high';
    timestamp: string;
    notes?: string;
}

export interface SleepData {
    id: string;
    durationMinutes: number;
    quality?: number; // 1-10 scale
    bedtime?: string;
    wakeTime?: string;
    source?: 'healthkit' | 'healthconnect' | 'manual';
    timestamp: string;
    notes?: string;
}

export interface HealthMetrics {
    weight: number | null;
    height: number | null;
    bmi: number | null;
    bodyFat: number | null;
    muscleMass: number | null;
    hydration: number | null;
    sleepQuality: number | null;
    stressLevel: number | null;
    age: number | null;
    gender?: 'male' | 'female' | 'other';
    lastUpdated: string | null;
}

// ============================================================================
// User Identity & Preferences
// ============================================================================

export interface User {
    id: string;
    name: string;
    email: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    height?: number; // cm
    weight?: number; // kg
    fitnessGoals?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    healthSync: boolean;
    aiRecommendations: boolean;
    language: string;
    measurementSystem: 'metric' | 'imperial';
    dietaryPreferences: string[];
    fitnessGoals: string[];
    notificationSchedule: {
        morning: boolean;
        afternoon: boolean;
        evening: boolean;
    };
}

export interface FounderStatus {
    isFounder: boolean;
    number: number | null;
}

// ============================================================================
// Economy & Gamification
// ============================================================================

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'liquid_skins' | 'deep_dives' | 'streak_freeze' | 'avatars';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    isPurchased: boolean;
    effect?: string;
    icon?: string;
}

export interface UserEconomy {
    macroCoins: number;
    totalSpent: number;
    totalEarned: number;
    purchaseHistory: StoreItem[];
    unlockedThemes: string[];
}

// ============================================================================
// Social
// ============================================================================

export interface SquadMember {
    id: string;
    name: string;
    avatar?: string;
    consistencyScore: number;
    streak: number;
    lastActive: string;
    isActive: boolean;
}

export interface Squad {
    id: string;
    name: string;
    members: SquadMember[];
    created: string;
    description?: string;
}

export interface Reaction {
    id: string;
    type: 'fire' | 'muscle' | 'nudge';
    senderId: string;
    receiverId: string;
    timestamp: string;
    message?: string;
}

export interface UserSocial {
    squad: Squad | null;
    streak: number;
    lastStreakUpdate: string;
    reactionsReceived: Reaction[];
    reactionsSent: Reaction[];
}

export interface ConsistencyMetrics {
    streak: number;
    logCompliance: number; // 0-100 percentage
    consistencyScore: number; // calculated score
    last7Days: {
        date: string;
        completed: boolean;
        score: number;
    }[];
}

// ============================================================================
// Unified Store State
// ============================================================================

export interface UserState {
    // Core Data
    dailyTarget: MacroTarget;
    currentIntake: MacroTarget;
    dailyLog: {
        history: DailyLog[]; // Unified Rich Logs
        lastUpdated: number;
    };
    pantry: string[];

    // Identity
    user: User | null;
    isAuthenticated: boolean;
    isOnboardingCompleted: boolean;
    founderStatus: FounderStatus;
    isPro: boolean;

    // Health & Settings
    healthMetrics: HealthMetrics;
    preferences: UserPreferences;

    // Feature Flags & Layout
    hardware: {
        hasWearable: boolean;
        deviceType: 'apple' | 'garmin' | 'none' | null;
    };
    dashboardLayout: {
        showHeartRate: boolean;
        showSleep: boolean;
        showSteps: boolean;
    };

    // Gamification & Social
    streak: number;
    coins: number;
    purchaseHistory: StoreItem[];
    economy: UserEconomy;
    social: UserSocial;
    consistencyMetrics: ConsistencyMetrics;

    // Smart Adjustments
    freeAdjustmentsUsed: number;
    isProMember: boolean; // Sync with isPro

    // Actions
    updateIntake: (intake: Partial<MacroTarget>) => void;
    logFood: (calories: number, protein: number, carbs: number, fats: number, name?: string) => void;
    addDailyLog: (log: DailyLog) => void; // Added for IntentHandler
    updatePantry: (items: string[]) => void;
    addToPantry: (item: string) => void;
    removeFromPantry: (item: string) => void;

    setFounderStatus: (status: FounderStatus) => void;
    setProStatus: (isPro: boolean) => void;
    resetDaily: () => void;

    incrementStreak: () => void;
    addCoins: (amount: number) => void;

    purchaseItem: (item: StoreItem) => boolean;

    // Legacy support for accessing health metrics easily if needed
    updateHealthMetrics: (metrics: Partial<HealthMetrics>) => void;

    // Consolidated Action Groups
    actions: {
        setUser: (user: User) => void;
        setAuthenticated: (auth: boolean) => void;
        completeOnboarding: () => void;

        // Health
        updateHealthMetrics: (metrics: Partial<HealthMetrics>) => void;
        setHardware: (hasWearable: boolean, type: UserState['hardware']['deviceType']) => void;
        toggleDashboardModule: (module: keyof UserState['dashboardLayout']) => void;

        // Settings
        updatePreferences: (prefs: Partial<UserPreferences>) => void;

        // Social
        joinSquad: (squad: Squad) => void;
        leaveSquad: () => void;
        addReaction: (reaction: Omit<Reaction, 'id'>) => void;
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

export function calculateConsistencyScore(
    streak: number,
    logCompliance: number,
    recentActivity: number
): number {
    return Math.floor((streak * 0.4 + logCompliance * 0.4 + recentActivity * 0.2) * 10);
}

export * from './ai';
export * from './nutrition';
