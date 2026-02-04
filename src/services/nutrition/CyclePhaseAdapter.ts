/**
 * Cycle Phase Adapter
 * Adjusts macro targets based on menstrual cycle phase
 * Based on research showing metabolic changes across cycle phases
 */

import { logger } from '../../../utils/logger';
import { getSupabase } from '../../lib/supabase';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';

export interface CycleData {
  phase: CyclePhase;
  dayOfCycle: number; // 1-35 typically
  cycleLength: number; // Average cycle length
  lastPeriodStart: string;
  symptoms?: string[];
  timestamp: string;
}

export interface MacroAdjustment {
  calorieAdjustment: number; // +/- calories
  proteinAdjustment: number; // +/- grams
  carbAdjustment: number; // +/- grams
  fatAdjustment: number; // +/- grams
  reason: string;
  recommendations: string[];
}

export interface CycleBasedNutrition {
  phase: CyclePhase;
  dayOfCycle: number;
  adjustment: MacroAdjustment;
  foodRecommendations: string[];
  avoidFoods: string[];
}

class CyclePhaseAdapterService {
  /**
   * Determine cycle phase from day of cycle
   */
  determinePhase(dayOfCycle: number, cycleLength: number = 28): CyclePhase {
    if (dayOfCycle <= 5) {
      return 'menstrual'; // Days 1-5: Menstruation
    } else if (dayOfCycle <= 13) {
      return 'follicular'; // Days 6-13: Follicular phase
    } else if (dayOfCycle <= 16) {
      return 'ovulatory'; // Days 14-16: Ovulation
    } else if (dayOfCycle <= cycleLength) {
      return 'luteal'; // Days 17-28: Luteal phase
    }
    return 'unknown';
  }

  /**
   * Calculate macro adjustments based on cycle phase
   * Research-backed adjustments for metabolic changes
   */
  calculatePhaseAdjustments(
    phase: CyclePhase,
    baseCalories: number,
    baseProtein: number,
    baseCarbs: number,
    baseFat: number
  ): MacroAdjustment {
    switch (phase) {
      case 'menstrual':
        return this.menstrualAdjustments(baseCalories, baseProtein, baseCarbs, baseFat);
      case 'follicular':
        return this.follicularAdjustments(baseCalories, baseProtein, baseCarbs, baseFat);
      case 'ovulatory':
        return this.ovulatoryAdjustments(baseCalories, baseProtein, baseCarbs, baseFat);
      case 'luteal':
        return this.lutealAdjustments(baseCalories, baseProtein, baseCarbs, baseFat);
      default:
        return this.noAdjustments();
    }
  }

  /**
   * Menstrual Phase (Days 1-5)
   * Lower energy, inflammation, cramps
   * Strategy: Slight calorie increase, anti-inflammatory foods
   */
  private menstrualAdjustments(
    baseCalories: number,
    baseProtein: number,
    baseCarbs: number,
    baseFat: number
  ): MacroAdjustment {
    return {
      calorieAdjustment: Math.round(baseCalories * 0.05), // +5% calories
      proteinAdjustment: Math.round(baseProtein * 0.05), // Slight protein increase
      carbAdjustment: Math.round(baseCarbs * 0.05), // Slight carb increase for energy
      fatAdjustment: Math.round(baseFat * 0.1), // +10% healthy fats (anti-inflammatory)
      reason: 'Menstrual phase: Body needs extra energy and anti-inflammatory support',
      recommendations: [
        'Increase iron-rich foods (red meat, spinach, lentils)',
        'Add omega-3 fatty acids (salmon, flaxseed) for inflammation',
        'Include magnesium (dark chocolate, almonds) for cramps',
        'Stay hydrated to reduce bloating',
        'Reduce training intensity if needed',
      ],
    };
  }

  /**
   * Follicular Phase (Days 6-13)
   * Rising estrogen, higher energy, better insulin sensitivity
   * Strategy: Optimal for performance, can handle higher carbs
   */
  private follicularAdjustments(
    baseCalories: number,
    baseProtein: number,
    baseCarbs: number,
    baseFat: number
  ): MacroAdjustment {
    return {
      calorieAdjustment: 0, // Baseline calories
      proteinAdjustment: Math.round(baseProtein * 0.1), // +10% protein for muscle building
      carbAdjustment: Math.round(baseCarbs * 0.1), // +10% carbs (insulin sensitive)
      fatAdjustment: 0,
      reason: 'Follicular phase: Peak energy and insulin sensitivity - optimal for performance',
      recommendations: [
        'Increase training intensity - your body can handle it',
        'Focus on complex carbs (oats, quinoa, sweet potato)',
        'Emphasize lean protein for muscle building',
        'Take advantage of higher energy levels',
        'Perfect time for strength training',
      ],
    };
  }

  /**
   * Ovulatory Phase (Days 14-16)
   * Peak estrogen and testosterone, highest energy
   * Strategy: Maximum performance potential
   */
  private ovulatoryAdjustments(
    baseCalories: number,
    baseProtein: number,
    baseCarbs: number,
    baseFat: number
  ): MacroAdjustment {
    return {
      calorieAdjustment: Math.round(baseCalories * 0.05), // +5% for peak performance
      proteinAdjustment: Math.round(baseProtein * 0.15), // +15% protein (anabolic window)
      carbAdjustment: Math.round(baseCarbs * 0.1), // +10% carbs for energy
      fatAdjustment: 0,
      reason: 'Ovulatory phase: Peak hormones - maximize performance and muscle building',
      recommendations: [
        'Peak strength training window - lift heavy',
        'Your PR window - attempt personal records',
        'High-protein post-workout meals',
        'Maximize training volume',
        'Excellent recovery capacity',
      ],
    };
  }

  /**
   * Luteal Phase (Days 17-28)
   * Rising progesterone, slower metabolism, increased appetite
   * Strategy: Slight calorie increase, focus on satiety
   */
  private lutealAdjustments(
    baseCalories: number,
    baseProtein: number,
    baseCarbs: number,
    baseFat: number
  ): MacroAdjustment {
    return {
      calorieAdjustment: Math.round(baseCalories * 0.1), // +10% calories (higher BMR)
      proteinAdjustment: Math.round(baseProtein * 0.1), // +10% protein (satiety)
      carbAdjustment: 0,
      fatAdjustment: Math.round(baseFat * 0.05), // Slight fat increase
      reason: 'Luteal phase: Higher metabolic rate and cravings - honor your hunger',
      recommendations: [
        'Increase calories to match higher metabolic rate (~10%)',
        'Focus on protein and fiber for satiety',
        'Include complex carbs to manage cravings',
        'B-vitamins (whole grains) for PMS symptoms',
        'Reduce training intensity in late luteal phase',
        'Honor cravings but choose nutrient-dense options',
      ],
    };
  }

  /**
   * No adjustments (unknown phase or opt-out)
   */
  private noAdjustments(): MacroAdjustment {
    return {
      calorieAdjustment: 0,
      proteinAdjustment: 0,
      carbAdjustment: 0,
      fatAdjustment: 0,
      reason: 'No cycle tracking data available',
      recommendations: ['Enable cycle tracking for personalized nutrition adjustments'],
    };
  }

  /**
   * Get food recommendations for cycle phase
   */
  getPhaseNutritionGuidance(phase: CyclePhase): CycleBasedNutrition {
    const baseRecommendations = this.getPhaseSpecificFoods(phase);

    return {
      phase,
      dayOfCycle: 0, // Will be filled by caller
      adjustment: this.noAdjustments(), // Will be calculated by caller
      foodRecommendations: baseRecommendations.recommended,
      avoidFoods: baseRecommendations.avoid,
    };
  }

  private getPhaseSpecificFoods(phase: CyclePhase): {
    recommended: string[];
    avoid: string[];
  } {
    switch (phase) {
      case 'menstrual':
        return {
          recommended: [
            'Leafy greens (iron)',
            'Red meat (iron, protein)',
            'Salmon (omega-3)',
            'Dark chocolate (magnesium)',
            'Ginger tea (anti-inflammatory)',
            'Lentils (iron, fiber)',
          ],
          avoid: [
            'Excessive caffeine (increases cramps)',
            'High-sodium foods (bloating)',
            'Alcohol (inflammation)',
          ],
        };

      case 'follicular':
        return {
          recommended: [
            'Lean protein (chicken, fish)',
            'Fermented foods (sauerkraut, kimchi)',
            'Sprouted grains',
            'Fresh vegetables',
            'Citrus fruits',
            'Pumpkin seeds',
          ],
          avoid: ['Heavy, fatty foods', 'Processed foods'],
        };

      case 'ovulatory':
        return {
          recommended: [
            'Cruciferous vegetables (broccoli, cauliflower)',
            'Berries (antioxidants)',
            'Almonds',
            'Quinoa',
            'Wild-caught fish',
            'Colorful vegetables',
          ],
          avoid: ['Excess sugar', 'Fried foods'],
        };

      case 'luteal':
        return {
          recommended: [
            'Sweet potato (complex carbs)',
            'Dark leafy greens (calcium)',
            'Chickpeas (B6)',
            'Brown rice',
            'Magnesium-rich foods',
            'Whole grains',
          ],
          avoid: [
            'Refined sugar (blood sugar spikes)',
            'High salt (water retention)',
            'Excess caffeine',
          ],
        };

      default:
        return {
          recommended: ['Balanced, whole-food diet'],
          avoid: ['Processed foods'],
        };
    }
  }

  /**
   * Save cycle data to database
   */
  async logCycleData(userId: string, cycleData: CycleData): Promise<boolean> {
    try {
      const { error } = await getSupabase().from('cycle_tracking').insert({
        user_id: userId,
        phase: cycleData.phase,
        day_of_cycle: cycleData.dayOfCycle,
        cycle_length: cycleData.cycleLength,
        last_period_start: cycleData.lastPeriodStart,
        symptoms: cycleData.symptoms,
        timestamp: cycleData.timestamp,
      });

      if (error) {
        logger.error('Failed to save cycle data:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error saving cycle data:', error);
      return false;
    }
  }

  /**
   * Get latest cycle data for user
   */
  async getLatestCycleData(userId: string): Promise<CycleData | null> {
    try {
      const { data, error } = await getSupabase()
        .from('cycle_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        phase: data.phase,
        dayOfCycle: data.day_of_cycle,
        cycleLength: data.cycle_length,
        lastPeriodStart: data.last_period_start,
        symptoms: data.symptoms,
        timestamp: data.timestamp,
      };
    } catch (error) {
      logger.error('Error fetching cycle data:', error);
      return null;
    }
  }

  /**
   * Get current cycle phase for a user
   * Used by UI components to display phase-specific content
   */
  async getCurrentPhase(userId: string): Promise<CyclePhase | null> {
    try {
      const cycleData = await this.getLatestCycleData(userId);
      if (!cycleData) return null;

      const dayOfCycle = this.calculateDayOfCycle(cycleData.lastPeriodStart);
      return this.determinePhase(dayOfCycle, cycleData.cycleLength);
    } catch (error) {
      logger.error('Error getting current phase:', error);
      return null;
    }
  }

  /**
   * Log a cycle phase entry
   * Used when user manually logs their cycle phase
   */
  async logCyclePhase(
    userId: string,
    phase: CyclePhase,
    lastPeriodStart?: string,
    symptoms?: string[]
  ): Promise<boolean> {
    try {
      const now = new Date();
      const periodStart = lastPeriodStart || now.toISOString();
      const dayOfCycle = this.calculateDayOfCycle(periodStart);

      const cycleData: CycleData = {
        phase,
        dayOfCycle,
        cycleLength: 28, // Default, can be customized
        lastPeriodStart: periodStart,
        symptoms,
        timestamp: now.toISOString(),
      };

      return await this.logCycleData(userId, cycleData);
    } catch (error) {
      logger.error('Error logging cycle phase:', error);
      return false;
    }
  }

  /**
   * Calculate day of cycle from last period start
   */
  calculateDayOfCycle(lastPeriodStart: string): number {
    const lastPeriod = new Date(lastPeriodStart);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPeriod.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get complete cycle-adjusted nutrition plan
   */
  async getCycleAdjustedNutrition(
    userId: string,
    baseMacros: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  ): Promise<CycleBasedNutrition | null> {
    try {
      const cycleData = await this.getLatestCycleData(userId);
      if (!cycleData) return null;

      const dayOfCycle = this.calculateDayOfCycle(cycleData.lastPeriodStart);
      const phase = this.determinePhase(dayOfCycle, cycleData.cycleLength);

      const adjustment = this.calculatePhaseAdjustments(
        phase,
        baseMacros.calories,
        baseMacros.protein,
        baseMacros.carbs,
        baseMacros.fat
      );

      const guidance = this.getPhaseNutritionGuidance(phase);

      return {
        ...guidance,
        phase,
        dayOfCycle,
        adjustment,
      };
    } catch (error) {
      logger.error('Error calculating cycle nutrition:', error);
      return null;
    }
  }
}

// Singleton instance
export const cyclePhaseAdapter = new CyclePhaseAdapterService();
export default cyclePhaseAdapter;

// Type alias for backward compatibility
export type CyclePhaseAdjustments = {
  adjustedCalories: number;
  adjustedProtein: number;
  adjustedCarbs: number;
  adjustedFat: number;
  reason: string;
  recommendations: string[];
};
