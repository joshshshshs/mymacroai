/**
 * Wearable Adapter Service
 * Normalizes recovery data from Oura, Whoop, and Garmin
 */

import { logger } from '../../../utils/logger';
import { getSupabase } from '../../lib/supabase';

export type WearableProvider = 'oura' | 'whoop' | 'garmin' | 'manual';

export interface RawRecoveryData {
  provider: WearableProvider;
  sleepScore?: number; // 0-100
  hrvScore?: number; // milliseconds or normalized
  restingHeartRate?: number; // bpm
  strain?: number; // provider-specific
  readiness?: number; // 0-100
  timestamp: string;
  rawData?: Record<string, any>; // Original provider data
}

export interface NormalizedRecoveryData {
  // Normalized 0-100 scores
  recoveryScore: number; // Overall recovery (0-100)
  sleepQuality: number; // Sleep quality (0-100)
  hrvReadiness: number; // HRV-based readiness (0-100)
  strain: number; // Activity strain (0-100)

  // Raw metrics
  sleepHours?: number;
  restingHeartRate?: number;
  hrvMs?: number;

  // Metadata
  provider: WearableProvider;
  timestamp: string;
  confidence: number; // Data quality confidence (0-1)
}

export interface RecoveryRecommendation {
  status: 'optimal' | 'moderate' | 'low';
  calorieAdjustment: number; // Positive = increase, negative = decrease
  trainingRecommendation: 'full' | 'light' | 'rest';
  message: string;
  // UI display properties
  title?: string;
  description?: string;
  intensity?: 'high' | 'medium' | 'low';
}

class WearableAdapterService {
  /**
   * Normalize recovery data from any provider to standard format
   */
  normalizeRecoveryData(raw: RawRecoveryData): NormalizedRecoveryData {
    switch (raw.provider) {
      case 'oura':
        return this.normalizeOuraData(raw);
      case 'whoop':
        return this.normalizeWhoopData(raw);
      case 'garmin':
        return this.normalizeGarminData(raw);
      case 'manual':
        return this.normalizeManualData(raw);
      default:
        logger.warn('Unknown provider:', raw.provider);
        return this.generateFallbackData(raw);
    }
  }

  /**
   * Normalize Oura Ring data
   * Oura provides: readiness (0-100), sleep score (0-100), HRV balance
   */
  private normalizeOuraData(raw: RawRecoveryData): NormalizedRecoveryData {
    const readiness = raw.readiness ?? 70;
    const sleepScore = raw.sleepScore ?? 70;
    const hrvScore = raw.hrvScore ?? 50;

    // Oura's readiness is already a good recovery indicator
    const recoveryScore = readiness;

    // Sleep quality from Oura sleep score
    const sleepQuality = sleepScore;

    // HRV readiness (Oura uses HRV balance, normalized to 0-100)
    const hrvReadiness = Math.min(100, Math.max(0, hrvScore));

    // Estimate strain from readiness (inverse relationship)
    const strain = Math.max(0, 100 - readiness);

    return {
      recoveryScore,
      sleepQuality,
      hrvReadiness,
      strain,
      restingHeartRate: raw.restingHeartRate,
      provider: 'oura',
      timestamp: raw.timestamp,
      confidence: this.calculateConfidence(raw),
    };
  }

  /**
   * Normalize Whoop data
   * Whoop provides: recovery (0-100), sleep performance (0-100), strain (0-21)
   */
  private normalizeWhoopData(raw: RawRecoveryData): NormalizedRecoveryData {
    const recovery = raw.readiness ?? 70;
    const sleepScore = raw.sleepScore ?? 70;
    const whoopStrain = raw.strain ?? 10; // Whoop strain is 0-21

    // Whoop recovery is the main metric
    const recoveryScore = recovery;

    // Sleep quality from Whoop sleep performance
    const sleepQuality = sleepScore;

    // Whoop includes HRV in recovery, extract estimate
    const hrvReadiness = Math.min(100, recovery + 10); // Rough estimate

    // Normalize Whoop strain (0-21) to 0-100
    const strain = Math.min(100, (whoopStrain / 21) * 100);

    return {
      recoveryScore,
      sleepQuality,
      hrvReadiness,
      strain,
      restingHeartRate: raw.restingHeartRate,
      provider: 'whoop',
      timestamp: raw.timestamp,
      confidence: this.calculateConfidence(raw),
    };
  }

  /**
   * Normalize Garmin data
   * Garmin provides: Body Battery (0-100), sleep score, stress, HRV
   */
  private normalizeGarminData(raw: RawRecoveryData): NormalizedRecoveryData {
    const bodyBattery = raw.readiness ?? 70; // Garmin Body Battery
    const sleepScore = raw.sleepScore ?? 70;
    const hrvScore = raw.hrvScore ?? 50;

    // Body Battery is Garmin's recovery indicator
    const recoveryScore = bodyBattery;

    // Sleep quality from Garmin sleep score
    const sleepQuality = sleepScore;

    // HRV from Garmin (typically in ms, normalize to 0-100)
    const hrvReadiness = this.normalizeHRV(hrvScore);

    // Estimate strain from body battery depletion
    const strain = Math.max(0, 100 - bodyBattery);

    return {
      recoveryScore,
      sleepQuality,
      hrvReadiness,
      strain,
      restingHeartRate: raw.restingHeartRate,
      hrvMs: raw.hrvScore,
      provider: 'garmin',
      timestamp: raw.timestamp,
      confidence: this.calculateConfidence(raw),
    };
  }

  /**
   * Normalize manual entry data
   */
  private normalizeManualData(raw: RawRecoveryData): NormalizedRecoveryData {
    return {
      recoveryScore: raw.readiness ?? 70,
      sleepQuality: raw.sleepScore ?? 70,
      hrvReadiness: raw.hrvScore ?? 50,
      strain: raw.strain ?? 50,
      restingHeartRate: raw.restingHeartRate,
      provider: 'manual',
      timestamp: raw.timestamp,
      confidence: 0.6, // Lower confidence for manual entry
    };
  }

  /**
   * Generate fallback data when provider is unknown
   */
  private generateFallbackData(raw: RawRecoveryData): NormalizedRecoveryData {
    return {
      recoveryScore: 70,
      sleepQuality: 70,
      hrvReadiness: 50,
      strain: 50,
      provider: raw.provider,
      timestamp: raw.timestamp,
      confidence: 0.3,
    };
  }

  /**
   * Normalize HRV from milliseconds to 0-100 scale
   * Typical HRV ranges: 20-100ms (varies by age, fitness)
   */
  private normalizeHRV(hrvMs: number): number {
    if (hrvMs < 20) return 0;
    if (hrvMs > 100) return 100;

    // Linear normalization from 20-100ms to 0-100 scale
    return Math.round(((hrvMs - 20) / 80) * 100);
  }

  /**
   * Calculate data quality confidence
   */
  private calculateConfidence(raw: RawRecoveryData): number {
    let confidence = 1.0;

    // Reduce confidence if key metrics are missing
    if (!raw.readiness) confidence -= 0.2;
    if (!raw.sleepScore) confidence -= 0.2;
    if (!raw.hrvScore) confidence -= 0.1;
    if (!raw.restingHeartRate) confidence -= 0.1;

    // Provider-specific confidence
    if (raw.provider === 'manual') confidence *= 0.6;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate recovery-based recommendations
   */
  generateRecommendation(recovery: NormalizedRecoveryData): RecoveryRecommendation {
    const { recoveryScore, sleepQuality, strain } = recovery;

    // Critical: Low recovery + high strain
    if (recoveryScore < 40 && strain > 70) {
      return {
        status: 'low',
        calorieAdjustment: Math.round(strain * 3), // Reduce deficit significantly
        trainingRecommendation: 'rest',
        message: `Recovery critical (${recoveryScore}/100). Prioritize rest and increase calories by ${Math.round(strain * 3)}kcal to support recovery.`,
      };
    }

    // Moderate: Decent recovery but high strain or poor sleep
    if (recoveryScore < 60 || sleepQuality < 60) {
      return {
        status: 'moderate',
        calorieAdjustment: Math.round(strain * 1.5),
        trainingRecommendation: 'light',
        message: `Recovery moderate (${recoveryScore}/100). Light training recommended. Consider adding ${Math.round(strain * 1.5)}kcal for better recovery.`,
      };
    }

    // Optimal: Good recovery
    return {
      status: 'optimal',
      calorieAdjustment: 0,
      trainingRecommendation: 'full',
      message: `Recovery optimal (${recoveryScore}/100). You're ready for full training. Maintain current nutrition.`,
    };
  }

  /**
   * Fetch recovery data - simplified version for UI
   * Returns normalized recovery data or mock data for manual provider
   */
  async fetchRecoveryData(
    provider: WearableProvider,
    userId: string
  ): Promise<NormalizedRecoveryData | null> {
    try {
      // For manual provider, return mock data
      if (provider === 'manual') {
        return this.normalizeManualData({
          provider: 'manual',
          timestamp: new Date().toISOString(),
        });
      }

      // For real providers, would fetch from DB or API
      return await this.getLatestRecovery(userId);
    } catch (error) {
      logger.error(`Failed to fetch recovery data for ${provider}:`, error);
      return null;
    }
  }

  /**
   * Fetch recovery data from provider APIs
   * (Placeholder - implement actual OAuth flows in production)
   */
  async fetchProviderData(
    provider: WearableProvider,
    userId: string,
    accessToken: string
  ): Promise<RawRecoveryData | null> {
    try {
      // In production, implement actual API calls to each provider
      switch (provider) {
        case 'oura':
          return await this.fetchOuraData(userId, accessToken);
        case 'whoop':
          return await this.fetchWhoopData(userId, accessToken);
        case 'garmin':
          return await this.fetchGarminData(userId, accessToken);
        default:
          return null;
      }
    } catch (error) {
      logger.error(`Failed to fetch ${provider} data:`, error);
      return null;
    }
  }

  private async fetchOuraData(userId: string, accessToken: string): Promise<RawRecoveryData | null> {
    // Placeholder: Implement Oura API v2 call
    // GET https://api.ouraring.com/v2/usercollection/daily_readiness
    logger.info('Oura API integration pending');
    return null;
  }

  private async fetchWhoopData(userId: string, accessToken: string): Promise<RawRecoveryData | null> {
    // Placeholder: Implement Whoop API call
    // GET https://api.prod.whoop.com/developer/v1/recovery
    logger.info('Whoop API integration pending');
    return null;
  }

  private async fetchGarminData(userId: string, accessToken: string): Promise<RawRecoveryData | null> {
    // Placeholder: Implement Garmin Connect API call
    logger.info('Garmin API integration pending');
    return null;
  }

  /**
   * Save normalized recovery data to database
   */
  async saveRecoveryData(userId: string, data: NormalizedRecoveryData): Promise<boolean> {
    try {
      const { error } = await getSupabase().from('recovery_data').insert({
        user_id: userId,
        recovery_score: data.recoveryScore,
        sleep_quality: data.sleepQuality,
        hrv_readiness: data.hrvReadiness,
        strain: data.strain,
        resting_heart_rate: data.restingHeartRate,
        hrv_ms: data.hrvMs,
        provider: data.provider,
        confidence: data.confidence,
        timestamp: data.timestamp,
      });

      if (error) {
        logger.error('Failed to save recovery data:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error saving recovery data:', error);
      return false;
    }
  }

  /**
   * Get latest recovery data for user
   */
  async getLatestRecovery(userId: string): Promise<NormalizedRecoveryData | null> {
    try {
      const { data, error } = await getSupabase()
        .from('recovery_data')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        recoveryScore: data.recovery_score,
        sleepQuality: data.sleep_quality,
        hrvReadiness: data.hrv_readiness,
        strain: data.strain,
        restingHeartRate: data.resting_heart_rate,
        hrvMs: data.hrv_ms,
        provider: data.provider,
        timestamp: data.timestamp,
        confidence: data.confidence,
      };
    } catch (error) {
      logger.error('Error fetching recovery data:', error);
      return null;
    }
  }
}

// Singleton instance
export const wearableAdapter = new WearableAdapterService();
export default wearableAdapter;
