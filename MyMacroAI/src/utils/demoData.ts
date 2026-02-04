/**
 * Demo Data Setup for App Store Screenshots
 * Call setupDemoData() to populate the app with realistic data
 */

import { useUserStore } from '../store/UserStore';

// Demo user profile
const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Alex Mitchell',
  email: 'alex@example.com',
  avatar: null,
};

// Impressive daily targets for a fitness enthusiast
const DEMO_TARGETS = {
  calories: 2400,
  protein: 185,
  carbs: 240,
  fats: 75,
};

// Current intake showing good progress (78% of daily goal)
const DEMO_INTAKE = {
  calories: 1876,
  protein: 142,
  carbs: 186,
  fats: 58,
};

// Realistic meal logs for today
const TODAY = new Date().toISOString().split('T')[0];
const DEMO_LOGS = [
  {
    id: 'log-001',
    type: 'food' as const,
    date: new Date().toISOString(),
    timestamp: Date.now() - 3600000 * 6, // 6 hours ago (breakfast)
    foodName: 'Greek Yogurt Bowl with Berries',
    mealType: 'breakfast' as const,
    calories: 420,
    protein: 32,
    carbs: 48,
    fats: 12,
    mood: 4,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'log-002',
    type: 'food' as const,
    date: new Date().toISOString(),
    timestamp: Date.now() - 3600000 * 4, // 4 hours ago (snack)
    foodName: 'Protein Shake + Banana',
    mealType: 'snacks' as const,
    calories: 280,
    protein: 35,
    carbs: 32,
    fats: 4,
    mood: 4,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log-003',
    type: 'food' as const,
    date: new Date().toISOString(),
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago (lunch)
    foodName: 'Grilled Chicken Salad',
    mealType: 'lunch' as const,
    calories: 580,
    protein: 48,
    carbs: 24,
    fats: 28,
    mood: 5,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'log-004',
    type: 'food' as const,
    date: new Date().toISOString(),
    timestamp: Date.now() - 3600000 * 0.5, // 30 mins ago (snack)
    foodName: 'Rice Cakes with Almond Butter',
    mealType: 'snacks' as const,
    calories: 245,
    protein: 8,
    carbs: 38,
    fats: 9,
    mood: 4,
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },
  {
    id: 'log-005',
    type: 'food' as const,
    date: new Date().toISOString(),
    timestamp: Date.now() - 3600000 * 1, // 1 hour ago
    foodName: 'Salmon & Quinoa Bowl',
    mealType: 'lunch' as const,
    calories: 351,
    protein: 19,
    carbs: 44,
    fats: 5,
    mood: 5,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

// Health metrics showing good fitness level
const DEMO_HEALTH_METRICS = {
  weight: 78.5,
  height: 178,
  bmi: 24.8,
  bodyFat: 14.2,
  muscleMass: 62.4,
  hydration: 58,
  steps: 8247,
  activeCalories: 486,
  distance: 6.2,
  sleepMinutes: 462, // 7h 42m
  heartRate: 62,
  sleepQuality: 87,
  stressLevel: 28,
  age: 28,
  lastUpdated: new Date().toISOString(),
};

// Economy showing engaged user
const DEMO_ECONOMY = {
  macroCoins: 4850,
  totalSpent: 1200,
  totalEarned: 6050,
  purchaseHistory: [],
  unlockedThemes: ['vitamin-orange'],
  streakFreezes: 3,
};

// Training styles
const DEMO_TRAINING_STYLES = ['bodybuilding', 'running'] as const;

// Athlete profile
const DEMO_ATHLETE_PROFILE = {
  displayName: 'Alex M.',
  bio: 'Chasing gains and PRs',
  tagline: 'Consistency over perfection',
  isPublic: true,
  showStats: true,
  specialties: ['Hypertrophy', 'Endurance'],
  achievements: ['30-Day Streak', '100 Meals Logged', 'First Body Scan'],
};

/**
 * Sets up all demo data for App Store screenshots
 */
export const setupDemoData = () => {
  const store = useUserStore.getState();

  // Set user
  store.actions.setUser(DEMO_USER as any);
  store.actions.completeOnboarding();

  // Set targets and intake
  useUserStore.setState({
    dailyTarget: DEMO_TARGETS,
    currentIntake: DEMO_INTAKE,
    dailyIntakes: {
      [TODAY]: DEMO_INTAKE,
    },
    dailyLogs: {
      [TODAY]: DEMO_LOGS,
    },
    dailyLog: {
      history: DEMO_LOGS,
      lastUpdated: Date.now(),
    },
  });

  // Set streak (impressive but believable)
  useUserStore.setState({
    streak: 47,
    longestStreak: 47,
    social: {
      squad: {
        id: 'squad-001',
        name: 'Iron Warriors',
        members: [],
        createdAt: new Date().toISOString(),
      },
      streak: 47,
      lastStreakUpdate: new Date().toISOString(),
      reactionsReceived: [],
      reactionsSent: [],
    },
  });

  // Set economy
  useUserStore.setState({
    coins: DEMO_ECONOMY.macroCoins,
    economy: DEMO_ECONOMY,
  });

  // Set health metrics
  useUserStore.setState({
    healthMetrics: DEMO_HEALTH_METRICS,
    hardware: {
      hasWearable: true,
      deviceType: 'apple_watch',
    },
  });

  // Set training styles
  useUserStore.setState({
    trainingStyles: [...DEMO_TRAINING_STYLES],
  });

  // Set athlete profile
  useUserStore.setState({
    athleteProfile: DEMO_ATHLETE_PROFILE,
  });

  // Set pro status for full features
  useUserStore.setState({
    isPro: true,
    isProMember: true,
    founderStatus: { isFounder: true, number: 42 },
  });

  // Consistency metrics
  useUserStore.setState({
    consistencyMetrics: {
      streak: 47,
      logCompliance: 94,
      consistencyScore: 92,
      last7Days: [true, true, true, true, true, true, true],
    },
  });

  if (__DEV__) console.log('[DemoData] Demo data setup complete!');
};

/**
 * Clears all demo data and resets to defaults
 */
export const clearDemoData = () => {
  useUserStore.setState({
    user: null,
    isAuthenticated: false,
    isOnboardingCompleted: false,
    currentIntake: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    dailyIntakes: {},
    dailyLogs: {},
    dailyLog: { history: [], lastUpdated: Date.now() },
    streak: 0,
    longestStreak: 0,
    isPro: false,
    isProMember: false,
  });

  if (__DEV__) console.log('[DemoData] Demo data cleared!');
};

export default { setupDemoData, clearDemoData };
