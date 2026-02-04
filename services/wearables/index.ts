/**
 * Wearable Services Index
 * Exports all wearable-related services for easy imports
 */

// OAuth and Authentication
export { wearableAuthService, type WearableProviderId, type TokenData, type ConnectionStatus } from './WearableAuthService';

// Provider-specific services
export { ouraService } from './OuraService';
export { whoopService } from './WhoopService';

// Re-export types
export type {
    OuraDailyReadiness,
    OuraDailySleep,
    OuraSleepSession,
    OuraDailyActivity,
    OuraHeartRate,
    OuraPersonalInfo,
} from './OuraService';

export type {
    WhoopRecovery,
    WhoopCycle,
    WhoopSleep,
    WhoopWorkout,
    WhoopBodyMeasurement,
    WhoopUserProfile,
} from './WhoopService';
