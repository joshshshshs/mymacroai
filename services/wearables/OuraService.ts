/**
 * OuraService
 * Complete API integration for Oura Ring
 * Fetches readiness, sleep, and activity data from Oura Cloud API v2
 */

import { wearableAuthService } from './WearableAuthService';
import { RawRecoveryData } from '../../src/services/wearables/WearableAdapter';
import { logger } from '@/utils/logger';

// ============================================================================
// Types - Oura API v2 Response Types
// ============================================================================

export interface OuraDailyReadiness {
    id: string;
    day: string;
    score: number;
    temperature_deviation: number;
    temperature_trend_deviation: number;
    timestamp: string;
    contributors: {
        activity_balance: number;
        body_temperature: number;
        hrv_balance: number;
        previous_day_activity: number;
        previous_night: number;
        recovery_index: number;
        resting_heart_rate: number;
        sleep_balance: number;
    };
}

export interface OuraDailySleep {
    id: string;
    day: string;
    score: number;
    timestamp: string;
    contributors: {
        deep_sleep: number;
        efficiency: number;
        latency: number;
        rem_sleep: number;
        restfulness: number;
        timing: number;
        total_sleep: number;
    };
}

export interface OuraSleepSession {
    id: string;
    day: string;
    bedtime_start: string;
    bedtime_end: string;
    type: 'deleted' | 'sleep' | 'long_sleep' | 'late_nap' | 'rest';
    total_sleep_duration: number;
    awake_time: number;
    rem_sleep_duration: number;
    light_sleep_duration: number;
    deep_sleep_duration: number;
    restless_periods: number;
    time_in_bed: number;
    average_heart_rate: number;
    lowest_heart_rate: number;
    average_hrv: number;
    efficiency: number;
}

export interface OuraDailyActivity {
    id: string;
    day: string;
    score: number;
    active_calories: number;
    average_met_minutes: number;
    high_activity_met_minutes: number;
    low_activity_met_minutes: number;
    medium_activity_met_minutes: number;
    sedentary_met_minutes: number;
    steps: number;
    target_calories: number;
    total_calories: number;
    equivalent_walking_distance: number;
}

export interface OuraHeartRate {
    bpm: number;
    source: 'awake' | 'rest' | 'sleep' | 'session' | 'live';
    timestamp: string;
}

export interface OuraPersonalInfo {
    id: string;
    age: number;
    weight: number;
    height: number;
    biological_sex: string;
    email: string;
}

// API response wrappers
interface OuraListResponse<T> {
    data: T[];
    next_token?: string;
}

// ============================================================================
// OuraService Class
// ============================================================================

const OURA_API_BASE = 'https://api.ouraring.com/v2';

class OuraServiceClass {
    /**
     * Make authenticated request to Oura API
     */
    private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
        try {
            const accessToken = await wearableAuthService.getValidAccessToken('oura');

            if (!accessToken) {
                logger.warn('Oura: No valid access token');
                return null;
            }

            let url = `${OURA_API_BASE}${endpoint}`;
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
                    logger.warn('Oura: Token expired, attempting refresh');
                    await wearableAuthService.refreshAccessToken('oura');
                    // Retry once after refresh
                    return this.request(endpoint, params);
                }
                logger.error(`Oura API error: ${response.status} ${response.statusText}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            logger.error('Oura API request failed:', error);
            return null;
        }
    }

    /**
     * Get date range params for API requests
     */
    private getDateParams(startDate?: Date, endDate?: Date): Record<string, string> {
        const end = endDate ?? new Date();
        const start = startDate ?? new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days default

        return {
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0],
        };
    }

    /**
     * Get user's personal info
     */
    async getPersonalInfo(): Promise<OuraPersonalInfo | null> {
        return this.request<OuraPersonalInfo>('/usercollection/personal_info');
    }

    /**
     * Get daily readiness scores
     */
    async getDailyReadiness(startDate?: Date, endDate?: Date): Promise<OuraDailyReadiness[]> {
        const response = await this.request<OuraListResponse<OuraDailyReadiness>>(
            '/usercollection/daily_readiness',
            this.getDateParams(startDate, endDate)
        );
        return response?.data ?? [];
    }

    /**
     * Get daily sleep scores
     */
    async getDailySleep(startDate?: Date, endDate?: Date): Promise<OuraDailySleep[]> {
        const response = await this.request<OuraListResponse<OuraDailySleep>>(
            '/usercollection/daily_sleep',
            this.getDateParams(startDate, endDate)
        );
        return response?.data ?? [];
    }

    /**
     * Get detailed sleep sessions
     */
    async getSleepSessions(startDate?: Date, endDate?: Date): Promise<OuraSleepSession[]> {
        const response = await this.request<OuraListResponse<OuraSleepSession>>(
            '/usercollection/sleep',
            this.getDateParams(startDate, endDate)
        );
        return response?.data ?? [];
    }

    /**
     * Get daily activity data
     */
    async getDailyActivity(startDate?: Date, endDate?: Date): Promise<OuraDailyActivity[]> {
        const response = await this.request<OuraListResponse<OuraDailyActivity>>(
            '/usercollection/daily_activity',
            this.getDateParams(startDate, endDate)
        );
        return response?.data ?? [];
    }

    /**
     * Get heart rate data
     */
    async getHeartRate(startDate?: Date, endDate?: Date): Promise<OuraHeartRate[]> {
        const response = await this.request<OuraListResponse<OuraHeartRate>>(
            '/usercollection/heartrate',
            {
                ...this.getDateParams(startDate, endDate),
            }
        );
        return response?.data ?? [];
    }

    /**
     * Get the most recent daily readiness score
     */
    async getLatestReadiness(): Promise<OuraDailyReadiness | null> {
        const readiness = await this.getDailyReadiness();
        return readiness.length > 0 ? readiness[readiness.length - 1] : null;
    }

    /**
     * Get the most recent sleep session
     */
    async getLatestSleep(): Promise<OuraSleepSession | null> {
        const sessions = await this.getSleepSessions();
        return sessions.length > 0 ? sessions[sessions.length - 1] : null;
    }

    /**
     * Convert Oura data to normalized recovery format
     * Used by WearableAdapter
     */
    async fetchRecoveryData(): Promise<RawRecoveryData | null> {
        try {
            // Fetch latest data
            const [readiness, sleepSessions, heartRates] = await Promise.all([
                this.getLatestReadiness(),
                this.getLatestSleep(),
                this.getHeartRate(),
            ]);

            if (!readiness && !sleepSessions) {
                logger.warn('Oura: No recent data available');
                return null;
            }

            // Get resting heart rate from sleep data
            const restingHR = sleepSessions?.lowest_heart_rate ?? heartRates
                .filter(hr => hr.source === 'rest' || hr.source === 'sleep')
                .reduce((min, hr) => Math.min(min, hr.bpm), Infinity);

            return {
                provider: 'oura',
                readiness: readiness?.score,
                sleepScore: readiness?.contributors.previous_night ??
                    (sleepSessions ? Math.round(sleepSessions.efficiency) : undefined),
                hrvScore: sleepSessions?.average_hrv,
                restingHeartRate: restingHR !== Infinity ? restingHR : undefined,
                timestamp: readiness?.timestamp ?? sleepSessions?.bedtime_end ?? new Date().toISOString(),
                rawData: {
                    readiness,
                    sleep: sleepSessions,
                },
            };
        } catch (error) {
            logger.error('Failed to fetch Oura recovery data:', error);
            return null;
        }
    }

    /**
     * Get comprehensive daily summary
     */
    async getDailySummary(date?: Date): Promise<{
        readiness: OuraDailyReadiness | null;
        sleep: OuraSleepSession | null;
        activity: OuraDailyActivity | null;
    } | null> {
        try {
            const targetDate = date ?? new Date();
            const startDate = new Date(targetDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(targetDate);
            endDate.setHours(23, 59, 59, 999);

            const [readinessData, sleepData, activityData] = await Promise.all([
                this.getDailyReadiness(startDate, endDate),
                this.getSleepSessions(startDate, endDate),
                this.getDailyActivity(startDate, endDate),
            ]);

            return {
                readiness: readinessData[0] ?? null,
                sleep: sleepData[0] ?? null,
                activity: activityData[0] ?? null,
            };
        } catch (error) {
            logger.error('Failed to fetch Oura daily summary:', error);
            return null;
        }
    }

    /**
     * Check if user is connected to Oura
     */
    async isConnected(): Promise<boolean> {
        const status = await wearableAuthService.getConnectionStatus('oura');
        return status.connected;
    }
}

// Singleton export
export const ouraService = new OuraServiceClass();
export default ouraService;
