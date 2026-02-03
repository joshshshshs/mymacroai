/**
 * WhoopService
 * Complete API integration for WHOOP band
 * Fetches recovery, strain, and sleep data from WHOOP Developer API
 */

import { wearableAuthService } from './WearableAuthService';
import { RawRecoveryData } from '@/src/services/wearables/WearableAdapter';
import { logger } from '@/utils/logger';

// ============================================================================
// Types - WHOOP API Response Types
// ============================================================================

export interface WhoopRecovery {
    cycle_id: number;
    sleep_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
    score: {
        user_calibrating: boolean;
        recovery_score: number;
        resting_heart_rate: number;
        hrv_rmssd_milli: number;
        spo2_percentage?: number;
        skin_temp_celsius?: number;
    };
}

export interface WhoopCycle {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    start: string;
    end?: string;
    timezone_offset: string;
    score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
    score?: {
        strain: number;
        kilojoule: number;
        average_heart_rate: number;
        max_heart_rate: number;
    };
}

export interface WhoopSleep {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    start: string;
    end: string;
    timezone_offset: string;
    nap: boolean;
    score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
    score?: {
        stage_summary: {
            total_in_bed_time_milli: number;
            total_awake_time_milli: number;
            total_no_data_time_milli: number;
            total_light_sleep_time_milli: number;
            total_slow_wave_sleep_time_milli: number;
            total_rem_sleep_time_milli: number;
            sleep_cycle_count: number;
            disturbance_count: number;
        };
        sleep_needed: {
            baseline_milli: number;
            need_from_sleep_debt_milli: number;
            need_from_recent_strain_milli: number;
            need_from_recent_nap_milli: number;
        };
        respiratory_rate: number;
        sleep_performance_percentage: number;
        sleep_consistency_percentage: number;
        sleep_efficiency_percentage: number;
    };
}

export interface WhoopWorkout {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    start: string;
    end: string;
    timezone_offset: string;
    sport_id: number;
    score_state: 'SCORED' | 'PENDING_SCORE' | 'UNSCORABLE';
    score?: {
        strain: number;
        average_heart_rate: number;
        max_heart_rate: number;
        kilojoule: number;
        percent_recorded: number;
        distance_meter?: number;
        altitude_gain_meter?: number;
        altitude_change_meter?: number;
        zone_duration: {
            zone_zero_milli: number;
            zone_one_milli: number;
            zone_two_milli: number;
            zone_three_milli: number;
            zone_four_milli: number;
            zone_five_milli: number;
        };
    };
}

export interface WhoopBodyMeasurement {
    height_meter: number;
    weight_kilogram: number;
    max_heart_rate: number;
}

export interface WhoopUserProfile {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
}

// API response wrappers
interface WhoopListResponse<T> {
    records: T[];
    next_token?: string;
}

// ============================================================================
// WhoopService Class
// ============================================================================

const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1';

class WhoopServiceClass {
    /**
     * Make authenticated request to WHOOP API
     */
    private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
        try {
            const accessToken = await wearableAuthService.getValidAccessToken('whoop');

            if (!accessToken) {
                logger.warn('WHOOP: No valid access token');
                return null;
            }

            let url = `${WHOOP_API_BASE}${endpoint}`;
            if (params) {
                const searchParams = new URLSearchParams(params);
                url += `?${searchParams.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    logger.warn('WHOOP: Token expired, attempting refresh');
                    await wearableAuthService.refreshAccessToken('whoop');
                    return this.request(endpoint, params);
                }
                logger.error(`WHOOP API error: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            logger.error('WHOOP API request failed:', error);
            return null;
        }
    }

    /**
     * Get date range params for API requests
     */
    private getDateParams(startDate?: Date, endDate?: Date): Record<string, string> {
        const end = endDate ?? new Date();
        const start = startDate ?? new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            start: start.toISOString(),
            end: end.toISOString(),
        };
    }

    /**
     * Get user profile
     */
    async getUserProfile(): Promise<WhoopUserProfile | null> {
        return this.request<WhoopUserProfile>('/user/profile/basic');
    }

    /**
     * Get body measurements
     */
    async getBodyMeasurement(): Promise<WhoopBodyMeasurement | null> {
        return this.request<WhoopBodyMeasurement>('/user/measurement/body');
    }

    /**
     * Get recovery data
     */
    async getRecovery(startDate?: Date, endDate?: Date): Promise<WhoopRecovery[]> {
        const response = await this.request<WhoopListResponse<WhoopRecovery>>(
            '/recovery',
            {
                ...this.getDateParams(startDate, endDate),
                limit: '25',
            }
        );
        return response?.records ?? [];
    }

    /**
     * Get cycles (days)
     */
    async getCycles(startDate?: Date, endDate?: Date): Promise<WhoopCycle[]> {
        const response = await this.request<WhoopListResponse<WhoopCycle>>(
            '/cycle',
            {
                ...this.getDateParams(startDate, endDate),
                limit: '25',
            }
        );
        return response?.records ?? [];
    }

    /**
     * Get sleep data
     */
    async getSleep(startDate?: Date, endDate?: Date): Promise<WhoopSleep[]> {
        const response = await this.request<WhoopListResponse<WhoopSleep>>(
            '/activity/sleep',
            {
                ...this.getDateParams(startDate, endDate),
                limit: '25',
            }
        );
        return response?.records ?? [];
    }

    /**
     * Get workouts
     */
    async getWorkouts(startDate?: Date, endDate?: Date): Promise<WhoopWorkout[]> {
        const response = await this.request<WhoopListResponse<WhoopWorkout>>(
            '/activity/workout',
            {
                ...this.getDateParams(startDate, endDate),
                limit: '25',
            }
        );
        return response?.records ?? [];
    }

    /**
     * Get latest recovery score
     */
    async getLatestRecovery(): Promise<WhoopRecovery | null> {
        const recovery = await this.getRecovery();
        const scored = recovery.filter(r => r.score_state === 'SCORED');
        return scored.length > 0 ? scored[0] : null;
    }

    /**
     * Get latest cycle (today's strain)
     */
    async getLatestCycle(): Promise<WhoopCycle | null> {
        const cycles = await this.getCycles();
        return cycles.length > 0 ? cycles[0] : null;
    }

    /**
     * Get latest sleep
     */
    async getLatestSleep(): Promise<WhoopSleep | null> {
        const sleep = await this.getSleep();
        const scored = sleep.filter(s => s.score_state === 'SCORED' && !s.nap);
        return scored.length > 0 ? scored[0] : null;
    }

    /**
     * Convert WHOOP data to normalized recovery format
     * Used by WearableAdapter
     */
    async fetchRecoveryData(): Promise<RawRecoveryData | null> {
        try {
            const [recovery, cycle, sleep] = await Promise.all([
                this.getLatestRecovery(),
                this.getLatestCycle(),
                this.getLatestSleep(),
            ]);

            if (!recovery || recovery.score_state !== 'SCORED') {
                logger.warn('WHOOP: No scored recovery data available');
                return null;
            }

            return {
                provider: 'whoop',
                readiness: recovery.score.recovery_score,
                sleepScore: sleep?.score?.sleep_performance_percentage,
                hrvScore: recovery.score.hrv_rmssd_milli,
                restingHeartRate: recovery.score.resting_heart_rate,
                strain: cycle?.score?.strain,
                timestamp: recovery.created_at,
                rawData: {
                    recovery,
                    cycle,
                    sleep,
                },
            };
        } catch (error) {
            logger.error('Failed to fetch WHOOP recovery data:', error);
            return null;
        }
    }

    /**
     * Get comprehensive daily summary
     */
    async getDailySummary(): Promise<{
        recovery: WhoopRecovery | null;
        cycle: WhoopCycle | null;
        sleep: WhoopSleep | null;
        workouts: WhoopWorkout[];
    } | null> {
        try {
            const [recovery, cycle, sleep, workouts] = await Promise.all([
                this.getLatestRecovery(),
                this.getLatestCycle(),
                this.getLatestSleep(),
                this.getWorkouts(),
            ]);

            return {
                recovery,
                cycle,
                sleep,
                workouts: workouts.slice(0, 5), // Last 5 workouts
            };
        } catch (error) {
            logger.error('Failed to fetch WHOOP daily summary:', error);
            return null;
        }
    }

    /**
     * Check if user is connected to WHOOP
     */
    async isConnected(): Promise<boolean> {
        const status = await wearableAuthService.getConnectionStatus('whoop');
        return status.connected;
    }
}

// Singleton export
export const whoopService = new WhoopServiceClass();
export default whoopService;
