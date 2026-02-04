/**
 * PredictiveAnalytics - "Time-Travel" Analytics
 * 
 * Uses historical data to project future outcomes:
 * - Weight trajectory predictions
 * - Sleep debt accumulation
 * - Recovery score projections
 * - Goal achievement dates
 * 
 * The ultimate retention hook - users stay to beat the prediction.
 */

import { useUserStore } from '@/src/store/UserStore';

// ============================================================================
// TYPES
// ============================================================================

export interface WeightPrediction {
  currentWeight: number;
  targetWeight: number;
  currentDeficit: number; // daily average
  projectedDate: string;
  daysRemaining: number;
  weeklyRate: number;
  confidence: 'high' | 'medium' | 'low';
  insight: string;
  trend: 'on_track' | 'ahead' | 'behind' | 'stalled';
}

export interface SleepDebtPrediction {
  currentDebt: number; // hours
  weeklyTrend: number; // hours gaining/losing per week
  projectedDebtIn7Days: number;
  recoveryScoreImpact: number;
  insight: string;
  severity: 'healthy' | 'caution' | 'warning' | 'critical';
}

export interface RecoveryPrediction {
  currentScore: number;
  trend: 'improving' | 'stable' | 'declining';
  projectedScoreIn7Days: number;
  factors: RecoveryFactor[];
  insight: string;
}

export interface RecoveryFactor {
  name: string;
  impact: 'positive' | 'neutral' | 'negative';
  contribution: number; // -100 to +100
}

export interface StreakPrediction {
  currentStreak: number;
  longestStreak: number;
  projectedMilestone: number;
  daysToMilestone: number;
  riskLevel: 'low' | 'medium' | 'high';
  insight: string;
}

export interface MacroCompliancePrediction {
  weeklyAverage: number; // percentage
  trend: 'improving' | 'stable' | 'declining';
  projectedMonthlyAverage: number;
  strongestMacro: 'calories' | 'protein' | 'carbs' | 'fats';
  weakestMacro: 'calories' | 'protein' | 'carbs' | 'fats';
  insight: string;
}

export interface TrajectoryCard {
  type: 'weight' | 'sleep' | 'recovery' | 'streak' | 'compliance';
  title: string;
  subtitle: string;
  primaryValue: string;
  secondaryValue?: string;
  trend: 'up' | 'down' | 'stable';
  trendColor: string;
  insight: string;
  actionLabel?: string;
  actionRoute?: string;
}

// ============================================================================
// PREDICTIVE ANALYTICS SERVICE
// ============================================================================

class PredictiveAnalyticsService {
  
  // ============================================================================
  // WEIGHT PREDICTION
  // ============================================================================
  
  /**
   * Predict when user will reach their goal weight
   */
  async predictWeight(): Promise<WeightPrediction> {
    const store = useUserStore.getState();
    const healthMetrics = store.healthMetrics;
    const dailyTarget = store.dailyTarget;
    const currentIntake = store.currentIntake;
    const dailyIntakes = store.dailyIntakes || {};
    
    // Get current weight
    const currentWeight = healthMetrics?.weight || 70;
    
    // Assume target weight (could be stored in user preferences)
    const targetWeight = currentWeight - 5; // Default: 5kg loss goal
    
    // Calculate average daily deficit from past 7 days
    const last7Days = this.getLast7DaysIntakes(dailyIntakes, dailyTarget);
    const avgDailyDeficit = this.calculateAverageDeficit(last7Days, dailyTarget?.calories || 2000);
    
    // Weight loss calculation: 7700 kcal = 1kg fat
    const weeklyRate = (avgDailyDeficit * 7) / 7700; // kg per week
    const weightToLose = currentWeight - targetWeight;
    const weeksToGoal = weightToLose > 0 && weeklyRate > 0 
      ? weightToLose / weeklyRate 
      : 0;
    const daysToGoal = Math.ceil(weeksToGoal * 7);
    
    // Calculate projected date
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToGoal);
    
    // Determine confidence based on data consistency
    const confidence = this.calculateConfidence(last7Days);
    
    // Determine trend
    const trend = this.determineTrend(weeklyRate, 0.5); // 0.5kg/week is "on track"
    
    // Generate insight
    const insight = this.generateWeightInsight(weeklyRate, daysToGoal, trend);
    
    return {
      currentWeight,
      targetWeight,
      currentDeficit: avgDailyDeficit,
      projectedDate: projectedDate.toISOString().split('T')[0],
      daysRemaining: daysToGoal,
      weeklyRate: Math.round(weeklyRate * 100) / 100,
      confidence,
      insight,
      trend,
    };
  }
  
  // ============================================================================
  // SLEEP DEBT PREDICTION
  // ============================================================================
  
  /**
   * Predict sleep debt accumulation and its impact
   */
  async predictSleepDebt(): Promise<SleepDebtPrediction> {
    const store = useUserStore.getState();
    const healthMetrics = store.healthMetrics;
    
    // Sleep target: 8 hours
    const sleepTarget = 8 * 60; // minutes
    const currentSleep = healthMetrics?.sleepMinutes || 420; // default 7 hours
    
    // Calculate current debt (assuming 8 hours is optimal)
    const dailyDebt = (sleepTarget - currentSleep) / 60; // hours
    const currentDebt = Math.max(0, dailyDebt * 3); // Assume 3-day average debt
    
    // Weekly trend (would come from historical data)
    const weeklyTrend = dailyDebt * 7;
    
    // Project 7 days forward
    const projectedDebtIn7Days = Math.max(0, currentDebt + weeklyTrend);
    
    // Recovery score impact (rough estimate: -5% per hour of debt)
    const recoveryScoreImpact = Math.min(0, -5 * projectedDebtIn7Days);
    
    // Determine severity
    const severity = this.determineSleepSeverity(projectedDebtIn7Days);
    
    // Generate insight
    const insight = this.generateSleepInsight(currentDebt, weeklyTrend, severity);
    
    return {
      currentDebt: Math.round(currentDebt * 10) / 10,
      weeklyTrend: Math.round(weeklyTrend * 10) / 10,
      projectedDebtIn7Days: Math.round(projectedDebtIn7Days * 10) / 10,
      recoveryScoreImpact: Math.round(recoveryScoreImpact),
      insight,
      severity,
    };
  }
  
  // ============================================================================
  // RECOVERY PREDICTION
  // ============================================================================
  
  /**
   * Predict recovery score trajectory
   */
  async predictRecovery(): Promise<RecoveryPrediction> {
    const store = useUserStore.getState();
    const healthMetrics = store.healthMetrics;
    
    // Current recovery score (would come from wearable)
    const currentScore = 75; // Default
    
    // Analyze factors affecting recovery
    const factors: RecoveryFactor[] = [];
    
    // Sleep factor
    const sleepHours = (healthMetrics?.sleepMinutes || 420) / 60;
    factors.push({
      name: 'Sleep Quality',
      impact: sleepHours >= 7 ? 'positive' : sleepHours >= 6 ? 'neutral' : 'negative',
      contribution: sleepHours >= 7 ? 15 : sleepHours >= 6 ? 0 : -20,
    });
    
    // Activity factor
    const steps = healthMetrics?.steps || 0;
    factors.push({
      name: 'Activity Level',
      impact: steps >= 8000 ? 'positive' : steps >= 5000 ? 'neutral' : 'negative',
      contribution: steps >= 8000 ? 10 : steps >= 5000 ? 0 : -10,
    });
    
    // Stress factor (placeholder)
    factors.push({
      name: 'Stress Level',
      impact: 'neutral',
      contribution: 0,
    });
    
    // Calculate trend and projection
    const totalContribution = factors.reduce((sum, f) => sum + f.contribution, 0);
    const trend = totalContribution > 5 ? 'improving' : totalContribution < -5 ? 'declining' : 'stable';
    const projectedScore = Math.max(0, Math.min(100, currentScore + totalContribution));
    
    // Generate insight
    const insight = this.generateRecoveryInsight(currentScore, projectedScore, trend);
    
    return {
      currentScore,
      trend,
      projectedScoreIn7Days: Math.round(projectedScore),
      factors,
      insight,
    };
  }
  
  // ============================================================================
  // STREAK PREDICTION
  // ============================================================================
  
  /**
   * Predict streak milestones and risk
   */
  async predictStreak(): Promise<StreakPrediction> {
    const store = useUserStore.getState();
    const currentStreak = store.streak || 0;
    const longestStreak = store.longestStreak || currentStreak;
    
    // Define milestones
    const milestones = [7, 14, 21, 30, 50, 100, 365];
    const nextMilestone = milestones.find(m => m > currentStreak) || currentStreak + 100;
    const daysToMilestone = nextMilestone - currentStreak;
    
    // Calculate risk based on recent behavior (placeholder)
    const riskLevel = currentStreak < 7 ? 'high' : currentStreak < 30 ? 'medium' : 'low';
    
    // Generate insight
    const insight = this.generateStreakInsight(currentStreak, nextMilestone, daysToMilestone);
    
    return {
      currentStreak,
      longestStreak,
      projectedMilestone: nextMilestone,
      daysToMilestone,
      riskLevel,
      insight,
    };
  }
  
  // ============================================================================
  // MACRO COMPLIANCE PREDICTION
  // ============================================================================
  
  /**
   * Predict macro compliance trends
   */
  async predictMacroCompliance(): Promise<MacroCompliancePrediction> {
    const store = useUserStore.getState();
    const dailyIntakes = store.dailyIntakes || {};
    const dailyTarget = store.dailyTarget;
    
    // Calculate weekly compliance
    const last7Days = this.getLast7DaysIntakes(dailyIntakes, dailyTarget);
    const weeklyAverage = this.calculateComplianceAverage(last7Days, dailyTarget);
    
    // Determine trend (placeholder - would use more historical data)
    const trend = weeklyAverage >= 80 ? 'improving' : weeklyAverage >= 60 ? 'stable' : 'declining';
    
    // Project monthly (assume same trend continues)
    const projectedMonthlyAverage = weeklyAverage;
    
    // Find strongest/weakest macro
    const macroCompliance = this.calculateMacroCompliance(last7Days, dailyTarget);
    const sortedMacros = Object.entries(macroCompliance).sort((a, b) => b[1] - a[1]);
    
    const strongestMacro = sortedMacros[0]?.[0] as any || 'protein';
    const weakestMacro = sortedMacros[sortedMacros.length - 1]?.[0] as any || 'fats';
    
    // Generate insight
    const insight = this.generateComplianceInsight(weeklyAverage, trend, weakestMacro);
    
    return {
      weeklyAverage: Math.round(weeklyAverage),
      trend,
      projectedMonthlyAverage: Math.round(projectedMonthlyAverage),
      strongestMacro,
      weakestMacro,
      insight,
    };
  }
  
  // ============================================================================
  // TRAJECTORY CARDS
  // ============================================================================
  
  /**
   * Get all trajectory cards for dashboard
   */
  async getTrajectoryCards(): Promise<TrajectoryCard[]> {
    const [weight, sleep, recovery, streak, compliance] = await Promise.all([
      this.predictWeight(),
      this.predictSleepDebt(),
      this.predictRecovery(),
      this.predictStreak(),
      this.predictMacroCompliance(),
    ]);
    
    const cards: TrajectoryCard[] = [];
    
    // Weight card
    if (weight.daysRemaining > 0) {
      cards.push({
        type: 'weight',
        title: 'Goal Weight',
        subtitle: `${weight.currentWeight}kg → ${weight.targetWeight}kg`,
        primaryValue: this.formatDate(weight.projectedDate),
        secondaryValue: `${weight.daysRemaining} days`,
        trend: weight.weeklyRate >= 0.4 ? 'down' : 'stable',
        trendColor: weight.trend === 'on_track' ? '#22C55E' : weight.trend === 'behind' ? '#EF4444' : '#F59E0B',
        insight: weight.insight,
        actionLabel: 'View Progress',
        actionRoute: '/(modals)/weight-progress',
      });
    }
    
    // Sleep card
    if (sleep.severity !== 'healthy') {
      cards.push({
        type: 'sleep',
        title: 'Sleep Debt',
        subtitle: 'Projected in 7 days',
        primaryValue: `${sleep.projectedDebtIn7Days}h`,
        secondaryValue: `${sleep.recoveryScoreImpact}% recovery`,
        trend: sleep.weeklyTrend > 0 ? 'up' : 'down',
        trendColor: sleep.severity === 'warning' ? '#EF4444' : sleep.severity === 'caution' ? '#F59E0B' : '#22C55E',
        insight: sleep.insight,
        actionLabel: 'Sleep Tips',
        actionRoute: '/(modals)/sleep-detail',
      });
    }
    
    // Recovery card
    cards.push({
      type: 'recovery',
      title: 'Recovery Score',
      subtitle: '7-day projection',
      primaryValue: `${recovery.projectedScoreIn7Days}%`,
      secondaryValue: recovery.trend,
      trend: recovery.trend === 'improving' ? 'up' : recovery.trend === 'declining' ? 'down' : 'stable',
      trendColor: recovery.trend === 'improving' ? '#22C55E' : recovery.trend === 'declining' ? '#EF4444' : '#F59E0B',
      insight: recovery.insight,
    });
    
    // Streak card
    cards.push({
      type: 'streak',
      title: 'Next Milestone',
      subtitle: `${streak.currentStreak} → ${streak.projectedMilestone} day streak`,
      primaryValue: `${streak.daysToMilestone} days`,
      trend: 'up',
      trendColor: streak.riskLevel === 'low' ? '#22C55E' : streak.riskLevel === 'medium' ? '#F59E0B' : '#EF4444',
      insight: streak.insight,
    });
    
    // Compliance card
    cards.push({
      type: 'compliance',
      title: 'Macro Compliance',
      subtitle: 'Weekly average',
      primaryValue: `${compliance.weeklyAverage}%`,
      secondaryValue: `Weakest: ${compliance.weakestMacro}`,
      trend: compliance.trend === 'improving' ? 'up' : compliance.trend === 'declining' ? 'down' : 'stable',
      trendColor: compliance.weeklyAverage >= 80 ? '#22C55E' : compliance.weeklyAverage >= 60 ? '#F59E0B' : '#EF4444',
      insight: compliance.insight,
    });
    
    return cards;
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private getLast7DaysIntakes(dailyIntakes: Record<string, any>, target: any): any[] {
    const result: any[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const intake = dailyIntakes[dateStr];
      if (intake) {
        result.push({ ...intake, target });
      }
    }
    return result;
  }
  
  private calculateAverageDeficit(intakes: any[], targetCalories: number): number {
    if (intakes.length === 0) return 300; // Default assumption
    
    const totalDeficit = intakes.reduce((sum, intake) => {
      const consumed = intake.calories || 0;
      return sum + (targetCalories - consumed);
    }, 0);
    
    return totalDeficit / intakes.length;
  }
  
  private calculateConfidence(intakes: any[]): 'high' | 'medium' | 'low' {
    if (intakes.length >= 6) return 'high';
    if (intakes.length >= 3) return 'medium';
    return 'low';
  }
  
  private determineTrend(rate: number, target: number): 'on_track' | 'ahead' | 'behind' | 'stalled' {
    if (rate >= target * 1.2) return 'ahead';
    if (rate >= target * 0.8) return 'on_track';
    if (rate > 0) return 'behind';
    return 'stalled';
  }
  
  private determineSleepSeverity(debt: number): 'healthy' | 'caution' | 'warning' | 'critical' {
    if (debt <= 2) return 'healthy';
    if (debt <= 5) return 'caution';
    if (debt <= 10) return 'warning';
    return 'critical';
  }
  
  private calculateComplianceAverage(intakes: any[], target: any): number {
    if (intakes.length === 0 || !target) return 80; // Default
    
    let totalCompliance = 0;
    for (const intake of intakes) {
      const calorieCompliance = Math.min(100, (intake.calories || 0) / (target.calories || 2000) * 100);
      totalCompliance += calorieCompliance;
    }
    
    return totalCompliance / intakes.length;
  }
  
  private calculateMacroCompliance(intakes: any[], target: any): Record<string, number> {
    if (intakes.length === 0 || !target) {
      return { calories: 80, protein: 80, carbs: 80, fats: 80 };
    }
    
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    
    for (const intake of intakes) {
      totals.calories += Math.min(100, (intake.calories || 0) / (target.calories || 2000) * 100);
      totals.protein += Math.min(100, (intake.protein || 0) / (target.protein || 150) * 100);
      totals.carbs += Math.min(100, (intake.carbs || 0) / (target.carbs || 200) * 100);
      totals.fats += Math.min(100, (intake.fats || 0) / (target.fats || 65) * 100);
    }
    
    const count = intakes.length;
    return {
      calories: totals.calories / count,
      protein: totals.protein / count,
      carbs: totals.carbs / count,
      fats: totals.fats / count,
    };
  }
  
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // ============================================================================
  // INSIGHT GENERATORS
  // ============================================================================
  
  private generateWeightInsight(rate: number, days: number, trend: string): string {
    if (trend === 'ahead') {
      return `You're losing faster than planned! Consider increasing calories slightly for sustainability.`;
    }
    if (trend === 'on_track') {
      return `Perfect pace! At ${rate.toFixed(2)}kg/week, you'll reach your goal in ${days} days.`;
    }
    if (trend === 'behind') {
      return `You're slightly behind. A 100 calorie reduction or extra 15min walk daily would get you back on track.`;
    }
    return `Weight loss has stalled. Consider a refeed day or adjusting your approach.`;
  }
  
  private generateSleepInsight(debt: number, trend: number, severity: string): string {
    if (severity === 'healthy') {
      return `Your sleep is on track. Keep it up!`;
    }
    if (severity === 'caution') {
      return `Minor sleep debt building. Try getting to bed 30 minutes earlier this week.`;
    }
    if (severity === 'warning') {
      return `Your sleep debt is affecting recovery. Prioritize sleep over workouts this week.`;
    }
    return `Critical sleep debt. This will significantly impact your results and health.`;
  }
  
  private generateRecoveryInsight(current: number, projected: number, trend: string): string {
    if (trend === 'improving') {
      return `Recovery trending up! Your sleep and activity balance is working.`;
    }
    if (trend === 'stable') {
      return `Recovery is stable. Consider optimizing sleep timing for improvement.`;
    }
    return `Recovery declining. Take a rest day and prioritize 8+ hours sleep.`;
  }
  
  private generateStreakInsight(current: number, milestone: number, days: number): string {
    if (days <= 3) {
      return `Almost there! Just ${days} more days to hit ${milestone} days! 🔥`;
    }
    if (current >= 30) {
      return `Incredible consistency! You're building a lasting habit.`;
    }
    if (current >= 7) {
      return `One week down! The first week is the hardest. Keep going!`;
    }
    return `Building momentum. Each day makes the next one easier.`;
  }
  
  private generateComplianceInsight(average: number, trend: string, weakest: string): string {
    if (average >= 90) {
      return `Elite compliance! You're in the top 5% of users.`;
    }
    if (average >= 80) {
      return `Great job! Focus on improving your ${weakest} tracking for even better results.`;
    }
    if (average >= 60) {
      return `Room for improvement. Try meal prepping to hit ${weakest} more consistently.`;
    }
    return `Struggling with consistency. Start by just tracking calories before worrying about all macros.`;
  }
}

// Export singleton
export const PredictiveAnalytics = new PredictiveAnalyticsService();
export default PredictiveAnalytics;
