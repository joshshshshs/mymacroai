/**
 * ContextAggregator - The AI Brain's Data Collector
 * 
 * Aggregates user context from ALL app sources to provide the AI
 * with complete awareness of the user's health, nutrition, activity,
 * goals, and social engagement.
 * 
 * Uses defensive coding with optional chaining and defaults to handle
 * missing or incomplete data gracefully.
 */

import {
  UserContext,
  UserProfile,
  DailySnapshot,
  HealthMetrics as AIHealthMetrics,
  UserGoals,
  UserPreferences as AIUserPreferences,
  ActiveProtocols,
  SocialContext,
  MealEntry,
  WorkoutEntry,
} from '@/src/types/ai-coach';
import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// CONTEXT AGGREGATOR SERVICE
// ============================================================================

class ContextAggregatorService {
  /**
   * Build complete user context for AI consumption
   */
  async buildContext(): Promise<UserContext> {
    const [
      profile,
      todaySnapshot,
      recentHistory,
      healthMetrics,
      goals,
      preferences,
      activeProtocols,
      socialContext,
    ] = await Promise.all([
      this.getProfile(),
      this.getTodaySnapshot(),
      this.getRecentHistory(7),
      this.getHealthMetrics(),
      this.getGoals(),
      this.getPreferences(),
      this.getActiveProtocols(),
      this.getSocialContext(),
    ]);

    return {
      profile,
      todaySnapshot,
      recentHistory,
      healthMetrics,
      goals,
      preferences,
      activeProtocols,
      socialContext,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Build a lightweight context for quick queries
   */
  async buildLightContext(): Promise<Partial<UserContext>> {
    const [profile, todaySnapshot, goals] = await Promise.all([
      this.getProfile(),
      this.getTodaySnapshot(),
      this.getGoals(),
    ]);

    return {
      profile,
      todaySnapshot,
      goals,
      generatedAt: new Date().toISOString(),
    };
  }

  // ============================================================================
  // PROFILE
  // ============================================================================

  private async getProfile(): Promise<UserProfile> {
    const store = useUserStore.getState();
    const user = store.user;
    const athleteProfile = store.athleteProfile;
    const healthMetrics = store.healthMetrics;

    return {
      id: user?.id || 'anonymous',
      name: user?.name || athleteProfile?.displayName || 'User',
      age: healthMetrics?.age || 30,
      sex: (healthMetrics?.gender as 'male' | 'female' | 'other') || 'other',
      height: healthMetrics?.height || 170,
      weight: healthMetrics?.weight || 70,
      activityLevel: 'moderate',
      fitnessGoal: 'maintain',
      dietType: undefined,
      allergies: [],
      medicalConditions: [],
      isPro: store.isPro || false,
      isFounder: store.founderStatus?.isFounder || false,
      joinedAt: user?.createdAt || new Date().toISOString(),
    };
  }

  // ============================================================================
  // TODAY'S SNAPSHOT
  // ============================================================================

  private async getTodaySnapshot(): Promise<DailySnapshot> {
    const store = useUserStore.getState();
    const today = new Date().toISOString().split('T')[0];
    const currentIntake = store.currentIntake;
    const dailyTarget = store.dailyTarget;
    const dailyLogs = store.dailyLogs?.[today] || [];

    // Get meals from today's logs
    const meals = this.extractMeals(dailyLogs);

    // Calculate totals
    const nutrition = {
      calories: {
        consumed: currentIntake?.calories || 0,
        target: dailyTarget?.calories || 2000,
      },
      protein: {
        consumed: currentIntake?.protein || 0,
        target: dailyTarget?.protein || 150,
      },
      carbs: {
        consumed: currentIntake?.carbs || 0,
        target: dailyTarget?.carbs || 200,
      },
      fat: {
        consumed: currentIntake?.fats || 0,
        target: dailyTarget?.fats || 65,
      },
      water: {
        consumed: store.waterIntake || 0,
        target: store.waterGoal || 2500,
      },
      meals,
    };

    // Get activity from health metrics
    const healthMetrics = store.healthMetrics;
    const workouts = this.extractWorkouts(dailyLogs);
    const activity = {
      steps: healthMetrics?.steps || 0,
      stepsGoal: 10000,
      activeMinutes: 0,
      caloriesBurned: healthMetrics?.activeCalories || 0,
      workouts,
    };

    // Get health metrics
    const health = await this.getTodayHealth();

    // Get cycle data if applicable
    const cycle = await this.getCycleData();

    return {
      date: today,
      nutrition,
      activity,
      health,
      cycle,
    };
  }

  // ============================================================================
  // RECENT HISTORY (LAST N DAYS)
  // ============================================================================

  private async getRecentHistory(days: number): Promise<DailySnapshot[]> {
    const store = useUserStore.getState();
    const history: DailySnapshot[] = [];
    const dailyIntakes = store.dailyIntakes || {};
    const dailyTarget = store.dailyTarget;
    const dailyLogs = store.dailyLogs || {};

    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Get historical data from store
      const dayIntake = dailyIntakes[dateStr];
      const dayLogs = dailyLogs[dateStr] || [];

      if (dayIntake || dayLogs.length > 0) {
        history.push({
          date: dateStr,
          nutrition: {
            calories: { consumed: dayIntake?.calories || 0, target: dailyTarget?.calories || 2000 },
            protein: { consumed: dayIntake?.protein || 0, target: dailyTarget?.protein || 150 },
            carbs: { consumed: dayIntake?.carbs || 0, target: dailyTarget?.carbs || 200 },
            fat: { consumed: dayIntake?.fats || 0, target: dailyTarget?.fats || 65 },
            water: { consumed: 0, target: store.waterGoal || 2500 },
            meals: this.extractMeals(dayLogs),
          },
          activity: {
            steps: 0,
            stepsGoal: 10000,
            activeMinutes: 0,
            caloriesBurned: 0,
            workouts: this.extractWorkouts(dayLogs),
          },
          health: {},
        });
      }
    }

    return history;
  }

  // ============================================================================
  // HEALTH METRICS
  // ============================================================================

  private async getHealthMetrics(): Promise<AIHealthMetrics> {
    const store = useUserStore.getState();
    const healthMetrics = store.healthMetrics;
    const hardware = store.hardware;

    // Get connected wearables based on hardware
    const connectedWearables: string[] = [];
    if (hardware?.hasWearable && hardware?.deviceType) {
      connectedWearables.push(hardware.deviceType);
    }

    return {
      wearables: {
        connected: connectedWearables,
        lastSync: undefined,
      },
      body: {
        currentWeight: healthMetrics?.weight || 70,
        weightTrend: 'stable',
        weeklyWeightChange: undefined,
        bodyFat: healthMetrics?.bodyFat || undefined,
        muscleMass: healthMetrics?.muscleMass || undefined,
        lastBodyScan: undefined,
      },
      averages: {
        sleep: healthMetrics?.sleepMinutes ? healthMetrics.sleepMinutes / 60 : 7,
        hrv: 45,
        restingHR: healthMetrics?.heartRate || 65,
        steps: healthMetrics?.steps || 8000,
        calories: store.currentIntake?.calories || 2000,
      },
    };
  }

  // ============================================================================
  // GOALS
  // ============================================================================

  private async getGoals(): Promise<UserGoals> {
    const store = useUserStore.getState();
    const dailyTarget = store.dailyTarget;

    return {
      primary: 'maintain',
      targetWeight: undefined,
      weeklyWeightChange: undefined,
      dailyCalories: dailyTarget?.calories || 2000,
      proteinTarget: dailyTarget?.protein || 150,
      carbTarget: dailyTarget?.carbs || 200,
      fatTarget: dailyTarget?.fats || 65,
      dailySteps: 10000,
      weeklyWorkouts: 4,
      waterTarget: store.waterGoal || 2500,
    };
  }

  // ============================================================================
  // PREFERENCES
  // ============================================================================

  private async getPreferences(): Promise<AIUserPreferences> {
    const store = useUserStore.getState();
    const preferences = store.preferences;

    return {
      weightUnit: (preferences as any)?.weightUnit || 'kg',
      heightUnit: (preferences as any)?.heightUnit || 'cm',
      energyUnit: 'kcal',
      coachPersonality: 'supportive',
      notificationFrequency: 'moderate',
      proactiveInsights: true,
      mealFrequency: 3,
      fastingWindow: undefined,
      avoidFoods: [],
      favoriteFoods: [],
    };
  }

  // ============================================================================
  // ACTIVE PROTOCOLS
  // ============================================================================

  private async getActiveProtocols(): Promise<ActiveProtocols> {
    const store = useUserStore.getState();
    const bioProfile = store.bioOptimizationProfile;

    // Check if user has disclosed peptide usage
    const isPeptideActive = bioProfile?.peptideStatus === 'ACTIVE_DISCLOSED' || 
                           bioProfile?.peptideStatus === 'ACTIVE_UNDISCLOSED';

    return {
      peptides: isPeptideActive ? {
        active: true,
        compounds: bioProfile?.activeCompounds?.map(c => c.name) || [],
        schedule: 'daily',
        startDate: new Date().toISOString(),
      } : undefined,
      supplements: undefined,
      trainingProgram: undefined,
      dietProtocol: undefined,
    };
  }

  // ============================================================================
  // SOCIAL CONTEXT
  // ============================================================================

  private async getSocialContext(): Promise<SocialContext> {
    const store = useUserStore.getState();
    const social = store.social;

    // Safely access squad data with defensive checks
    const squad = (social as any)?.squad || (social as any)?.currentSquad;

    return {
      squad: squad ? {
        id: squad.id || '',
        name: squad.name || '',
        memberCount: squad.memberCount || 0,
        activeChallenge: undefined,
      } : undefined,
      savedRecipes: 0,
      publishedRecipes: 0,
      currentStreak: store.streak || 0,
      totalMilestones: 0,
      recentMilestones: [],
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async getTodayHealth(): Promise<DailySnapshot['health']> {
    const store = useUserStore.getState();
    const healthMetrics = store.healthMetrics;

    return {
      sleep: healthMetrics?.sleepMinutes ? { 
        duration: healthMetrics.sleepMinutes / 60, 
        quality: 'good',
      } : undefined,
      hrv: undefined,
      restingHR: healthMetrics?.heartRate || undefined,
      stress: undefined,
      recovery: undefined,
      weight: healthMetrics?.weight || undefined,
      bodyFat: healthMetrics?.bodyFat || undefined,
    };
  }

  private async getCycleData(): Promise<DailySnapshot['cycle']> {
    // Cycle tracking would be handled by a separate service/store
    // For now, return undefined as it's not part of the core BioOptimizationProfile
    // This can be extended when menstrual tracking is implemented
    return undefined;
  }

  private extractMeals(logs: any[]): MealEntry[] {
    if (!logs || logs.length === 0) return [];

    const mealMap = new Map<string, MealEntry>();

    for (const entry of logs) {
      if (entry.type !== 'food') continue;
      
      const mealType = entry.mealType || 'snacks';
      
      if (!mealMap.has(mealType)) {
        mealMap.set(mealType, {
          id: `meal-${mealType}-${Date.now()}`,
          mealType,
          foods: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          loggedAt: entry.createdAt || new Date().toISOString(),
          source: 'manual',
        });
      }

      const meal = mealMap.get(mealType)!;
      meal.foods.push({
        name: entry.foodName || 'Food',
        calories: entry.calories || 0,
        protein: entry.protein || 0,
        carbs: entry.carbs || 0,
        fat: entry.fats || 0,
        servingSize: '1 serving',
      });
      meal.totalCalories += entry.calories || 0;
      meal.totalProtein += entry.protein || 0;
      meal.totalCarbs += entry.carbs || 0;
      meal.totalFat += entry.fats || 0;
    }

    return Array.from(mealMap.values());
  }

  private extractWorkouts(logs: any[]): WorkoutEntry[] {
    if (!logs || logs.length === 0) return [];

    return logs
      .filter(log => log.type === 'workout')
      .map(w => ({
        id: w.id || `workout-${Date.now()}`,
        type: w.workoutType || 'general',
        name: w.workoutName || 'Workout',
        duration: w.duration || 30,
        caloriesBurned: w.caloriesBurned,
        intensity: w.intensity,
        exercises: [],
        source: 'manual' as const,
        loggedAt: w.createdAt || new Date().toISOString(),
      }));
  }

  // ============================================================================
  // CONTEXT FORMATTERS FOR AI PROMPTS
  // ============================================================================

  /**
   * Format context as a concise string for AI prompts
   */
  formatForPrompt(context: UserContext): string {
    const { profile, todaySnapshot, healthMetrics, goals, activeProtocols } = context;
    const today = todaySnapshot;

    let prompt = `## USER PROFILE
Name: ${profile.name}
Age: ${profile.age}, Sex: ${profile.sex}
Height: ${profile.height}cm, Weight: ${profile.weight}kg
Goal: ${profile.fitnessGoal}
Activity Level: ${profile.activityLevel}
${profile.allergies.length ? `Allergies: ${profile.allergies.join(', ')}` : ''}
Account: ${profile.isPro ? 'Pro' : 'Free'}${profile.isFounder ? ' (Founder)' : ''}

## TODAY'S PROGRESS (${today.date})
Nutrition:
- Calories: ${today.nutrition.calories.consumed}/${today.nutrition.calories.target} kcal
- Protein: ${today.nutrition.protein.consumed}/${today.nutrition.protein.target}g
- Carbs: ${today.nutrition.carbs.consumed}/${today.nutrition.carbs.target}g
- Fat: ${today.nutrition.fat.consumed}/${today.nutrition.fat.target}g
- Water: ${today.nutrition.water.consumed}/${today.nutrition.water.target}ml

Activity:
- Steps: ${today.activity.steps}/${today.activity.stepsGoal}
- Workouts: ${today.activity.workouts.length > 0 ? today.activity.workouts.map(w => w.name).join(', ') : 'None'}
- Calories Burned: ${today.activity.caloriesBurned} kcal

Health:
${today.health.sleep ? `- Sleep: ${today.health.sleep.duration}h (${today.health.sleep.quality})` : ''}
${today.health.restingHR ? `- Resting HR: ${today.health.restingHR} bpm` : ''}

${today.cycle ? `Cycle: ${today.cycle.phase} phase (Day ${today.cycle.day})` : ''}

## GOALS
- Primary: ${goals.primary}
- Daily Calories: ${goals.dailyCalories} kcal
- Protein: ${goals.proteinTarget}g
- Weekly Workouts: ${goals.weeklyWorkouts}
${goals.targetWeight ? `- Target Weight: ${goals.targetWeight}kg` : ''}

## HEALTH TRENDS (7-day avg)
- Sleep: ${healthMetrics.averages.sleep.toFixed(1)}h
- Steps: ${healthMetrics.averages.steps}
- Weight Trend: ${healthMetrics.body.weightTrend}

${activeProtocols.peptides?.active ? `
## PEPTIDE PROTOCOL
- Compounds: ${activeProtocols.peptides.compounds.join(', ')}
- Schedule: ${activeProtocols.peptides.schedule}
` : ''}
`;

    return prompt.trim();
  }
}

// Export singleton
export const ContextAggregator = new ContextAggregatorService();
export default ContextAggregator;
