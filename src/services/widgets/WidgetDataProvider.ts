/**
 * WidgetDataProvider - Data Layer for iOS & Android Widgets
 * 
 * Provides shared data for:
 * - iOS Home Screen Widgets (WidgetKit)
 * - iOS Lock Screen Widgets
 * - macOS Widgets
 * - Android Home Screen Widgets
 * 
 * Uses App Groups (iOS) and SharedPreferences (Android) for data sharing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// TYPES
// ============================================================================

export type WidgetSize = 'small' | 'medium' | 'large' | 'accessory' | 'lockscreen';
export type WidgetFamily = 
  | 'systemSmall' 
  | 'systemMedium' 
  | 'systemLarge'
  | 'accessoryCircular'
  | 'accessoryRectangular'
  | 'accessoryInline';

export interface MacroWidgetData {
  // Current intake
  calories: number;
  caloriesTarget: number;
  caloriesRemaining: number;
  caloriesPercent: number;
  
  protein: number;
  proteinTarget: number;
  proteinPercent: number;
  
  carbs: number;
  carbsTarget: number;
  carbsPercent: number;
  
  fats: number;
  fatsTarget: number;
  fatsPercent: number;
  
  // Display strings
  caloriesDisplay: string;
  proteinDisplay: string;
  carbsDisplay: string;
  fatsDisplay: string;
  
  // Timestamp
  lastUpdated: string;
  date: string;
}

export interface StreakWidgetData {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string;
  streakStatus: 'active' | 'at_risk' | 'broken';
  fireIntensity: 'spark' | 'fire' | 'inferno' | 'legend';
  displayText: string;
}

export interface WaterWidgetData {
  current: number;
  target: number;
  percent: number;
  remaining: number;
  displayText: string;
  glassCount: number;
  lastLoggedTime: string;
}

export interface HealthWidgetData {
  steps: number;
  stepsTarget: number;
  stepsPercent: number;
  
  sleepHours: number;
  sleepTarget: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  
  hrv?: number;
  restingHeartRate?: number;
  recoveryScore?: number;
  
  displayText: string;
}

export interface QuickLogWidgetData {
  recentFoods: { id: string; name: string; calories: number }[];
  recentMeals: { id: string; name: string; calories: number }[];
  suggestedAction: string;
}

export interface AllWidgetData {
  macros: MacroWidgetData;
  streak: StreakWidgetData;
  water: WaterWidgetData;
  health: HealthWidgetData;
  quickLog: QuickLogWidgetData;
  theme: {
    accentColor: string;
    isDarkMode: boolean;
  };
  user: {
    name: string;
    avatarUrl?: string;
  };
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const WIDGET_STORAGE_KEY = 'widget_data';
const WIDGET_GROUP_ID = 'group.com.mymacro.ai'; // iOS App Group

// ============================================================================
// WIDGET DATA PROVIDER
// ============================================================================

class WidgetDataProviderClass {
  private updateInterval: NodeJS.Timeout | null = null;

  // ==========================================================================
  // DATA GENERATION
  // ==========================================================================

  /**
   * Generate macro widget data from store
   */
  generateMacroData(): MacroWidgetData {
    const store = useUserStore.getState();
    const current = store.currentIntake || { calories: 0, protein: 0, carbs: 0, fats: 0 };
    const target = store.dailyTarget || { calories: 2000, protein: 150, carbs: 200, fats: 65 };

    const caloriesRemaining = Math.max(0, target.calories - current.calories);
    
    return {
      calories: current.calories,
      caloriesTarget: target.calories,
      caloriesRemaining,
      caloriesPercent: Math.min(100, Math.round((current.calories / target.calories) * 100)),
      
      protein: current.protein,
      proteinTarget: target.protein,
      proteinPercent: Math.min(100, Math.round((current.protein / target.protein) * 100)),
      
      carbs: current.carbs,
      carbsTarget: target.carbs,
      carbsPercent: Math.min(100, Math.round((current.carbs / target.carbs) * 100)),
      
      fats: current.fats,
      fatsTarget: target.fats,
      fatsPercent: Math.min(100, Math.round((current.fats / target.fats) * 100)),
      
      caloriesDisplay: `${current.calories} / ${target.calories} kcal`,
      proteinDisplay: `${current.protein}g protein`,
      carbsDisplay: `${current.carbs}g carbs`,
      fatsDisplay: `${current.fats}g fats`,
      
      lastUpdated: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };
  }

  /**
   * Generate streak widget data
   */
  generateStreakData(): StreakWidgetData {
    const store = useUserStore.getState();
    const streak = store.streak || 0;
    const longestStreak = store.longestStreak || streak;
    
    // Determine fire intensity
    let fireIntensity: StreakWidgetData['fireIntensity'] = 'spark';
    if (streak >= 30) fireIntensity = 'legend';
    else if (streak >= 14) fireIntensity = 'inferno';
    else if (streak >= 7) fireIntensity = 'fire';

    // Check if streak is at risk (no logs today after 9pm)
    const now = new Date();
    const hour = now.getHours();
    const hasLoggedToday = Object.keys(store.dailyLogs || {}).includes(
      now.toISOString().split('T')[0]
    );
    
    let streakStatus: StreakWidgetData['streakStatus'] = 'active';
    if (!hasLoggedToday && hour >= 21) {
      streakStatus = 'at_risk';
    }

    return {
      currentStreak: streak,
      longestStreak,
      lastLoggedDate: now.toISOString().split('T')[0],
      streakStatus,
      fireIntensity,
      displayText: streak === 0 
        ? 'Start your streak!' 
        : `${streak} day${streak > 1 ? 's' : ''} 🔥`,
    };
  }

  /**
   * Generate water widget data
   */
  generateWaterData(): WaterWidgetData {
    const store = useUserStore.getState();
    const current = store.waterIntake || 0;
    const target = store.waterGoal || 2500;
    const percent = Math.min(100, Math.round((current / target) * 100));
    const remaining = Math.max(0, target - current);
    const glassCount = Math.floor(current / 250);

    return {
      current,
      target,
      percent,
      remaining,
      displayText: `${current}ml / ${target}ml`,
      glassCount,
      lastLoggedTime: new Date().toISOString(),
    };
  }

  /**
   * Generate health widget data
   */
  generateHealthData(): HealthWidgetData {
    const store = useUserStore.getState();
    const metrics = store.healthMetrics || {};

    const steps = metrics.steps || 0;
    const stepsTarget = 10000;
    const sleepHours = (metrics.sleepMinutes || 0) / 60;
    const sleepTarget = 8;

    let sleepQuality: HealthWidgetData['sleepQuality'] = 'poor';
    if (sleepHours >= 7.5) sleepQuality = 'excellent';
    else if (sleepHours >= 7) sleepQuality = 'good';
    else if (sleepHours >= 6) sleepQuality = 'fair';

    return {
      steps,
      stepsTarget,
      stepsPercent: Math.min(100, Math.round((steps / stepsTarget) * 100)),
      sleepHours: Math.round(sleepHours * 10) / 10,
      sleepTarget,
      sleepQuality,
      hrv: undefined, // HRV would come from wearable integration
      restingHeartRate: metrics.heartRate ?? undefined,
      recoveryScore: undefined, // Would come from wearable
      displayText: `${steps.toLocaleString()} steps`,
    };
  }

  /**
   * Generate quick log widget data
   */
  generateQuickLogData(): QuickLogWidgetData {
    // Would pull from recent logs
    return {
      recentFoods: [
        { id: '1', name: 'Chicken Breast', calories: 165 },
        { id: '2', name: 'Rice', calories: 130 },
        { id: '3', name: 'Broccoli', calories: 55 },
      ],
      recentMeals: [
        { id: '1', name: 'Protein Shake', calories: 180 },
        { id: '2', name: 'Lunch Bowl', calories: 450 },
      ],
      suggestedAction: 'Log your lunch',
    };
  }

  /**
   * Generate all widget data
   */
  generateAllData(): AllWidgetData {
    const store = useUserStore.getState();
    
    return {
      macros: this.generateMacroData(),
      streak: this.generateStreakData(),
      water: this.generateWaterData(),
      health: this.generateHealthData(),
      quickLog: this.generateQuickLogData(),
      theme: {
        accentColor: '#FF5C00', // Would come from theme provider
        isDarkMode: store.preferences?.theme === 'dark',
      },
      user: {
        name: store.user?.name || 'User',
        avatarUrl: undefined,
      },
    };
  }

  // ==========================================================================
  // DATA PERSISTENCE
  // ==========================================================================

  /**
   * Save widget data to shared storage
   */
  async saveWidgetData(data?: AllWidgetData): Promise<void> {
    const widgetData = data || this.generateAllData();

    try {
      if (Platform.OS === 'ios') {
        // iOS: Use App Groups UserDefaults
        await this.saveToAppGroup(widgetData);
      } else {
        // Android: Use SharedPreferences
        await this.saveToSharedPreferences(widgetData);
      }

      console.log('[WidgetData] Saved successfully');
    } catch (error) {
      console.error('[WidgetData] Save failed:', error);
    }
  }

  /**
   * Save to iOS App Group
   */
  private async saveToAppGroup(data: AllWidgetData): Promise<void> {
    // This requires a native module to access App Group UserDefaults
    // For now, use AsyncStorage as fallback
    const json = JSON.stringify(data);
    await AsyncStorage.setItem(WIDGET_STORAGE_KEY, json);

    // If native module exists, use it
    if (NativeModules.WidgetBridge) {
      await NativeModules.WidgetBridge.setWidgetData(json);
    }
  }

  /**
   * Save to Android SharedPreferences
   */
  private async saveToSharedPreferences(data: AllWidgetData): Promise<void> {
    const json = JSON.stringify(data);
    await AsyncStorage.setItem(WIDGET_STORAGE_KEY, json);

    // If native module exists, use it
    if (NativeModules.WidgetBridge) {
      await NativeModules.WidgetBridge.setWidgetData(json);
    }
  }

  /**
   * Request widget refresh (iOS WidgetKit)
   */
  async refreshWidgets(): Promise<void> {
    // Save latest data
    await this.saveWidgetData();

    // Request widget reload
    if (Platform.OS === 'ios' && NativeModules.WidgetBridge) {
      await NativeModules.WidgetBridge.reloadAllTimelines();
    }
  }

  // ==========================================================================
  // AUTO-UPDATE
  // ==========================================================================

  /**
   * Start automatic updates
   */
  startAutoUpdate(intervalMs: number = 60000): void {
    this.stopAutoUpdate();
    
    // Initial save
    this.saveWidgetData();

    // Set up interval
    this.updateInterval = setInterval(() => {
      this.saveWidgetData();
    }, intervalMs);

    // Subscribe to store changes
    useUserStore.subscribe(() => {
      this.saveWidgetData();
    });
  }

  /**
   * Stop automatic updates
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // ==========================================================================
  // WIDGET-SPECIFIC DATA
  // ==========================================================================

  /**
   * Get data for a specific widget type
   */
  getDataForWidget(widgetType: string, size: WidgetSize): any {
    const allData = this.generateAllData();

    switch (widgetType) {
      case 'macros':
        return size === 'small' 
          ? {
              calories: allData.macros.calories,
              target: allData.macros.caloriesTarget,
              percent: allData.macros.caloriesPercent,
            }
          : allData.macros;

      case 'streak':
        return allData.streak;

      case 'water':
        return allData.water;

      case 'health':
        return allData.health;

      case 'quick_log':
        return allData.quickLog;

      default:
        return allData;
    }
  }

  /**
   * Get lock screen widget data (iOS 16+)
   */
  getLockScreenWidgetData(): {
    circular: { value: number; label: string };
    rectangular: { title: string; value: string; subtitle: string };
    inline: string;
  } {
    const macros = this.generateMacroData();
    const streak = this.generateStreakData();

    return {
      circular: {
        value: macros.caloriesPercent,
        label: `${macros.caloriesRemaining}`,
      },
      rectangular: {
        title: 'Calories',
        value: `${macros.calories}`,
        subtitle: `${macros.caloriesRemaining} left`,
      },
      inline: `${macros.calories}/${macros.caloriesTarget} kcal • ${streak.currentStreak}🔥`,
    };
  }
}

// Export singleton
export const WidgetDataProvider = new WidgetDataProviderClass();
export default WidgetDataProvider;
