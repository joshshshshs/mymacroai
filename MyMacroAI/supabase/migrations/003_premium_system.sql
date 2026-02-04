-- ============================================================================
-- Premium System Migration
-- Adds subscription tracking, usage limits, and founder claims
-- ============================================================================

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'founder')),
    rc_customer_id TEXT,
    rc_entitlement TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_trial BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own subscription"
    ON user_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
    ON user_subscriptions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier);

-- ============================================================================
-- Usage Tracking Table (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    period_start DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, feature, period_start)
);

-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own usage"
    ON usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
    ON usage_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
    ON usage_tracking FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date
    ON usage_tracking(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature
    ON usage_tracking(feature, period_start);

-- ============================================================================
-- Founder Claims Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS founder_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    founder_number INTEGER NOT NULL UNIQUE,
    email TEXT NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE founder_claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own founder status"
    ON founder_claims FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view founder count"
    ON founder_claims FOR SELECT
    USING (true);

-- Sequence for founder numbers (max 500)
CREATE SEQUENCE IF NOT EXISTS founder_number_seq START 1 MAXVALUE 500 NO CYCLE;

-- Index
CREATE INDEX IF NOT EXISTS idx_founder_claims_number ON founder_claims(founder_number);

-- ============================================================================
-- Functions
-- ============================================================================

-- Increment usage count (upsert)
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_feature TEXT,
    p_period_start DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO usage_tracking (user_id, feature, count, period_start, updated_at)
    VALUES (p_user_id, p_feature, 1, p_period_start, now())
    ON CONFLICT (user_id, feature, period_start)
    DO UPDATE SET
        count = usage_tracking.count + 1,
        updated_at = now();
END;
$$;

-- Get usage count for a feature
CREATE OR REPLACE FUNCTION get_usage_count(
    p_user_id UUID,
    p_feature TEXT,
    p_period_start DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT count INTO v_count
    FROM usage_tracking
    WHERE user_id = p_user_id
      AND feature = p_feature
      AND period_start = p_period_start;

    RETURN COALESCE(v_count, 0);
END;
$$;

-- Claim founder spot
CREATE OR REPLACE FUNCTION claim_founder_spot(
    p_user_id UUID,
    p_email TEXT
)
RETURNS TABLE(success BOOLEAN, founder_number INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_founder_number INTEGER;
    v_existing INTEGER;
BEGIN
    -- Check if user already claimed
    SELECT fc.founder_number INTO v_existing
    FROM founder_claims fc
    WHERE fc.user_id = p_user_id;

    IF v_existing IS NOT NULL THEN
        RETURN QUERY SELECT true, v_existing, 'Already a founder';
        RETURN;
    END IF;

    -- Try to get next founder number
    BEGIN
        v_founder_number := nextval('founder_number_seq');
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT false, NULL::INTEGER, 'No founder spots remaining';
        RETURN;
    END;

    -- Insert founder claim
    INSERT INTO founder_claims (user_id, founder_number, email)
    VALUES (p_user_id, v_founder_number, p_email);

    -- Update user subscription to founder tier
    INSERT INTO user_subscriptions (user_id, tier, created_at, updated_at)
    VALUES (p_user_id, 'founder', now(), now())
    ON CONFLICT (user_id)
    DO UPDATE SET tier = 'founder', updated_at = now();

    RETURN QUERY SELECT true, v_founder_number, 'Founder spot claimed!';
END;
$$;

-- Get founder spots remaining
CREATE OR REPLACE FUNCTION get_founder_spots_remaining()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_claimed INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_claimed FROM founder_claims;
    RETURN 500 - v_claimed;
END;
$$;

-- Check if user can use a feature (within limits)
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_user_id UUID,
    p_feature TEXT,
    p_limit INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Unlimited (-1) always returns true
    IF p_limit = -1 THEN
        RETURN true;
    END IF;

    SELECT count INTO v_count
    FROM usage_tracking
    WHERE user_id = p_user_id
      AND feature = p_feature
      AND period_start = v_today;

    RETURN COALESCE(v_count, 0) < p_limit;
END;
$$;

-- Update subscription from webhook
CREATE OR REPLACE FUNCTION update_subscription(
    p_user_id UUID,
    p_tier TEXT,
    p_rc_customer_id TEXT,
    p_rc_entitlement TEXT,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_subscriptions (
        user_id, tier, rc_customer_id, rc_entitlement, expires_at, updated_at
    )
    VALUES (
        p_user_id, p_tier, p_rc_customer_id, p_rc_entitlement, p_expires_at, now()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        tier = p_tier,
        rc_customer_id = p_rc_customer_id,
        rc_entitlement = p_rc_entitlement,
        expires_at = p_expires_at,
        updated_at = now();
END;
$$;

-- ============================================================================
-- Email Tracking Table (for Resend campaigns)
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    template TEXT NOT NULL,
    resend_id TEXT,
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Service role can manage emails"
    ON email_sends FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Index
CREATE INDEX IF NOT EXISTS idx_email_sends_user ON email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_template ON email_sends(template, sent_at);

-- ============================================================================
-- Subscription Events (for analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'trial_started', 'trial_ended', 'subscribed', 'cancelled', 'renewed', 'upgraded', 'downgraded'
    from_tier TEXT,
    to_tier TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own events"
    ON subscription_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage events"
    ON subscription_events FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Index
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type, created_at);

-- ============================================================================
-- Trigger: Auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
