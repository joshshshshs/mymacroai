-- ============================================================================
-- Background Jobs & Scheduling
-- Enables pg_cron for automated tasks like daily summaries
-- ============================================================================

-- Enable pg_cron extension (requires Supabase Pro plan)
-- Uncomment when ready to deploy:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- User Preferences Table (for notification settings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

    -- Notification preferences
    daily_summary_enabled BOOLEAN DEFAULT false,
    weekly_digest_enabled BOOLEAN DEFAULT true,
    streak_reminders_enabled BOOLEAN DEFAULT true,

    -- Timing preferences
    timezone TEXT DEFAULT 'America/New_York',
    preferred_summary_time TIME DEFAULT '20:00:00',

    -- Communication preferences
    marketing_emails_enabled BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient timezone-based queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_timezone
    ON user_preferences(timezone)
    WHERE daily_summary_enabled = true;

-- ============================================================================
-- Daily Summary Logs (prevent duplicate sends)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_summary_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL,

    UNIQUE(user_id, date)
);

-- Index for checking if summary already sent
CREATE INDEX IF NOT EXISTS idx_daily_summary_logs_lookup
    ON daily_summary_logs(user_id, date);

-- Auto-cleanup old logs (keep 30 days)
CREATE INDEX IF NOT EXISTS idx_daily_summary_logs_cleanup
    ON daily_summary_logs(sent_at);

-- ============================================================================
-- Scheduled Jobs Table (for tracking job runs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running', -- running, completed, failed
    result JSONB,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for job history queries
CREATE INDEX IF NOT EXISTS idx_scheduled_job_runs_name_date
    ON scheduled_job_runs(job_name, started_at DESC);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summary_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_job_runs ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own preferences
CREATE POLICY "Users can manage own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own summary logs
CREATE POLICY "Users can view own summary logs"
    ON daily_summary_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can write to summary logs (from edge function)
CREATE POLICY "Service role can manage summary logs"
    ON daily_summary_logs FOR ALL
    USING (auth.role() = 'service_role');

-- Only service role can manage job runs
CREATE POLICY "Service role can manage job runs"
    ON scheduled_job_runs FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- Helper Function: Update timestamp trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- pg_cron Job Definitions (uncomment when pg_cron is enabled)
-- ============================================================================

-- Schedule daily summary for each major timezone
-- Runs at 8 PM local time for each timezone batch

/*
-- US Eastern (8 PM EST = 1 AM UTC next day)
SELECT cron.schedule(
    'daily-summary-us-eastern',
    '0 1 * * *',  -- 1 AM UTC
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-summary',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{"timezone": "America/New_York"}'
    );
    $$
);

-- US Pacific (8 PM PST = 4 AM UTC next day)
SELECT cron.schedule(
    'daily-summary-us-pacific',
    '0 4 * * *',  -- 4 AM UTC
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-summary',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{"timezone": "America/Los_Angeles"}'
    );
    $$
);

-- Europe/London (8 PM GMT = 8 PM UTC)
SELECT cron.schedule(
    'daily-summary-europe',
    '0 20 * * *',  -- 8 PM UTC
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-summary',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
            'Content-Type', 'application/json'
        ),
        body := '{"timezone": "Europe/London"}'
    );
    $$
);

-- Cleanup old summary logs (runs daily at 3 AM UTC)
SELECT cron.schedule(
    'cleanup-old-summary-logs',
    '0 3 * * *',
    $$
    DELETE FROM daily_summary_logs WHERE sent_at < now() - interval '30 days';
    DELETE FROM scheduled_job_runs WHERE created_at < now() - interval '7 days';
    $$
);
*/

-- ============================================================================
-- Done!
-- ============================================================================

COMMENT ON TABLE user_preferences IS 'User notification and app preferences';
COMMENT ON TABLE daily_summary_logs IS 'Tracks daily summary emails to prevent duplicates';
COMMENT ON TABLE scheduled_job_runs IS 'Logs scheduled background job executions';
