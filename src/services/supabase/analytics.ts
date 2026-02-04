/**
 * Analytics Service
 * 
 * Tracks user events for admin dashboard and nightly reports.
 */

import { getSupabase, supabase } from '@/src/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type EventType = 'screen_view' | 'action' | 'error';

export interface AnalyticsEvent {
    event_type: EventType;
    event_name: string;
    metadata?: Record<string, any>;
}

// ============================================================================
// TRACKING
// ============================================================================

/**
 * Track a screen view
 */
export async function trackScreenView(screenName: string): Promise<void> {
    await trackEvent({
        event_type: 'screen_view',
        event_name: screenName,
    });
}

/**
 * Track a user action
 */
export async function trackAction(
    actionName: string,
    metadata?: Record<string, any>
): Promise<void> {
    await trackEvent({
        event_type: 'action',
        event_name: actionName,
        metadata,
    });
}

/**
 * Track an error
 */
export async function trackError(
    errorName: string,
    metadata?: Record<string, any>
): Promise<void> {
    await trackEvent({
        event_type: 'error',
        event_name: errorName,
        metadata,
    });
}

/**
 * Core event tracking function
 */
async function trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
        const { data: { user } } = await getSupabase().auth.getUser();

        await getSupabase().from('analytics_events').insert({
            user_id: user?.id || null,
            event_type: event.event_type,
            event_name: event.event_name,
            metadata: event.metadata || {},
        });
    } catch (error) {
        // Silently fail analytics to not disrupt user experience
        console.debug('[Analytics] Failed to track event:', error);
    }
}

// ============================================================================
// AGGREGATION (for admin dashboard)
// ============================================================================

export interface DailyStats {
    date: string;
    dau: number;
    totalEvents: number;
    screenViews: number;
    actions: number;
    errors: number;
    topScreens: { name: string; count: number }[];
    topActions: { name: string; count: number }[];
}

/**
 * Get daily stats for a date range (admin only)
 */
export async function getDailyStats(days: number = 7): Promise<DailyStats[]> {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await getSupabase().rpc('get_daily_analytics_stats', {
            start_date: startDate.toISOString(),
        });

        if (error) {
            console.error('[Analytics] Stats error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('[Analytics] Error:', error);
        return [];
    }
}

/**
 * Get today's quick stats
 */
export async function getTodayQuickStats(): Promise<{
    activeUsers: number;
    totalEvents: number;
    errors: number;
}> {
    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await getSupabase()
            .from('analytics_events')
            .select('id, user_id, event_type')
            .gte('created_at', `${today}T00:00:00`)
            .lt('created_at', `${today}T23:59:59`);

        if (error || !data) {
            return { activeUsers: 0, totalEvents: 0, errors: 0 };
        }

        const uniqueUsers = new Set(data.filter((e: { user_id: string | null }) => e.user_id).map((e: { user_id: string | null }) => e.user_id));
        const errors = data.filter((e: { event_type: string }) => e.event_type === 'error').length;

        return {
            activeUsers: uniqueUsers.size,
            totalEvents: data.length,
            errors,
        };
    } catch (error) {
        return { activeUsers: 0, totalEvents: 0, errors: 0 };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AnalyticsService = {
    trackScreenView,
    trackAction,
    trackError,
    getDailyStats,
    getTodayQuickStats,
};

export default AnalyticsService;
