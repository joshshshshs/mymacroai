// User-related type definitions
import type { NutritionData, WorkoutData, SleepData } from './health';
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
  date: string;
  type?: DailyLogType;
  mood?: number; // 1-5 scale
  energyLevel?: number; // 1-10 scale
  notes?: string;
  achievements?: string[];
  challenges?: string[];
  symptoms?: string[];
  nutritionData?: NutritionData | null;
  activityData?: WorkoutData | null;
  sleepData?: SleepData | null;
  createdAt?: string;
  updatedAt?: string;
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
  lastUpdated: string | null;
}

// Social and Economic System Types
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

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'liquid_skins' | 'deep_dives' | 'streak_freeze';
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

export interface UserSocial {
  squad: Squad | null;
  streak: number;
  lastStreakUpdate: string;
  reactionsReceived: Reaction[];
  reactionsSent: Reaction[];
}

export interface Reaction {
  id: string;
  type: 'fire' | 'muscle' | 'nudge';
  senderId: string;
  receiverId: string;
  timestamp: string;
  message?: string;
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

// Helper function to calculate consistency score
export function calculateConsistencyScore(
  streak: number,
  logCompliance: number,
  recentActivity: number
): number {
  return Math.floor((streak * 0.4 + logCompliance * 0.4 + recentActivity * 0.2) * 10);
}
