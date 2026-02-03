# MyMacroAI Monetization Strategy

## Overview

This document defines the complete monetization strategy for MyMacroAI, including tier definitions, feature gating, and backend integrations.

---

## Tier Structure

### FREE TIER
**Target:** New users, casual trackers, students
**Goal:** Provide enough value to hook users while creating clear upgrade paths

| Category | Feature | Limit |
|----------|---------|-------|
| **Food Logging** | Manual food search & log | Unlimited |
| **Food Logging** | Barcode scanning | 10/day |
| **Food Logging** | AI Photo Estimation | 3/day |
| **Food Logging** | Voice logging | 5/day |
| **AI Coach** | Chat messages | 20/day |
| **AI Coach** | Daily insights | Basic (1 insight) |
| **Health** | Basic dashboard | ✓ |
| **Health** | Steps & calories | ✓ |
| **Health** | Basic sleep data | ✓ |
| **Health** | Wearable sync | 1 device |
| **Community** | Browse recipes | ✓ |
| **Community** | React to recipes | ✓ |
| **Community** | Publish recipes | 2/month |
| **Squad** | View leaderboards | ✓ |
| **Squad** | Add friends | 10 max |
| **Gamification** | Streak tracking | ✓ |
| **Gamification** | Earn MacroCoins | 50% rate |
| **Data** | History retention | 30 days |
| **Ads** | Occasional prompts | Upgrade banners |

---

### PRO TIER ($9.99/month or $79.99/year)
**Target:** Serious fitness enthusiasts, athletes, health-conscious users
**Goal:** Remove all friction, unlock advanced features

| Category | Feature | Limit |
|----------|---------|-------|
| **Food Logging** | Manual food search & log | Unlimited |
| **Food Logging** | Barcode scanning | Unlimited |
| **Food Logging** | AI Photo Estimation | Unlimited |
| **Food Logging** | Voice logging | Unlimited |
| **AI Coach** | Chat messages | Unlimited |
| **AI Coach** | Daily insights | Detailed (5+ insights) |
| **AI Coach** | Priority response | ✓ |
| **AI Coach** | Custom protocols | ✓ |
| **Health** | Full dashboard | ✓ |
| **Health** | HRV analysis | ✓ |
| **Health** | Stress tracking | ✓ |
| **Health** | Recovery scoring | ✓ |
| **Health** | Sleep phase analysis | ✓ |
| **Health** | Cycle tracking + macro adjustments | ✓ |
| **Health** | Wearable sync | Unlimited devices |
| **Community** | Browse recipes | ✓ |
| **Community** | React to recipes | ✓ |
| **Community** | Publish recipes | Unlimited |
| **Community** | Featured placement | Priority |
| **Squad** | View leaderboards | ✓ |
| **Squad** | Add friends | Unlimited |
| **Squad** | Create challenges | ✓ |
| **Squad** | Private squads | ✓ |
| **Body Scan** | 3-angle body scan | ✓ |
| **Body Scan** | Progress photos | ✓ |
| **Body Scan** | AI body composition | ✓ |
| **Gamification** | Streak tracking | ✓ |
| **Gamification** | Streak freeze (1/month free) | ✓ |
| **Gamification** | Earn MacroCoins | 100% rate |
| **Data** | History retention | Unlimited |
| **Data** | Export data | ✓ |
| **Support** | Priority support | ✓ |
| **Ads** | Ad-free experience | ✓ |

---

### FOUNDER TIER (Limited - First 500 users)
**Target:** Early adopters, brand ambassadors
**Goal:** Create exclusivity and loyalty

Everything in Pro PLUS:
- Lifetime Pro access (one-time $149.99)
- Exclusive Founder badge
- Founder-only Discord/community
- Direct feature request channel
- Name in app credits
- Early access to new features
- 2x MacroCoin earning rate
- Exclusive cosmetics/themes

---

## Feature Gating Implementation

### Usage Limits by Tier

```typescript
export const TIER_LIMITS = {
  free: {
    aiChat: 20,           // messages per day
    photoEstimate: 3,     // per day
    voiceLog: 5,          // per day
    barcodeScan: 10,      // per day
    recipesPublish: 2,    // per month
    friendsMax: 10,       // total
    historyDays: 30,      // data retention
    wearables: 1,         // connected devices
    macroCoinRate: 0.5,   // 50% earning rate
  },
  pro: {
    aiChat: -1,           // unlimited (-1)
    photoEstimate: -1,
    voiceLog: -1,
    barcodeScan: -1,
    recipesPublish: -1,
    friendsMax: -1,
    historyDays: -1,
    wearables: -1,
    macroCoinRate: 1.0,
  },
  founder: {
    aiChat: -1,
    photoEstimate: -1,
    voiceLog: -1,
    barcodeScan: -1,
    recipesPublish: -1,
    friendsMax: -1,
    historyDays: -1,
    wearables: -1,
    macroCoinRate: 2.0,   // 2x earning
  }
};
```

### Premium-Only Features

These features show a paywall when free users try to access:

1. **Advanced Health Widgets**
   - HRV Analysis card → Paywall
   - Stress Tracking details → Paywall
   - Sleep Phase breakdown → Paywall
   - Cycle macro adjustments → Paywall

2. **Body Composition**
   - 3-angle body scan → Paywall
   - Progress photos vault → Paywall
   - AI composition analysis → Paywall

3. **Squad Features**
   - Create challenges → Paywall
   - Private squads → Paywall
   - More than 10 friends → Paywall

4. **Data & Export**
   - View history > 30 days → Paywall
   - Export data → Paywall

---

## Backend Architecture

### Supabase Tables

#### `user_subscriptions` (new table)
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'founder')),
  rc_customer_id TEXT,
  rc_entitlement TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_trial BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);
```

#### `usage_tracking` (enhanced)
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, feature, period_start)
);

-- Index for fast lookups
CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, period_start);
```

#### `founder_claims` (new table)
```sql
CREATE TABLE founder_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  founder_number INTEGER NOT NULL UNIQUE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Sequence for founder numbers
CREATE SEQUENCE founder_number_seq START 1 MAXVALUE 500;
```

### RevenueCat Configuration

#### Products to Create in Dashboard:
1. `mymacro_pro_monthly` - $9.99/month
2. `mymacro_pro_yearly` - $79.99/year (33% savings)
3. `mymacro_founder_lifetime` - $149.99 one-time

#### Entitlements:
1. `pro` - Grants Pro tier access
2. `founder` - Grants Founder tier access (includes pro)

#### Offerings:
1. `default` - Standard offering with monthly/yearly
2. `founder_special` - Founder lifetime (limited availability)

### Resend Email Campaigns

#### Transactional Emails:
1. **Welcome Email** - On signup
2. **Trial Started** - When trial begins
3. **Trial Ending** - 3 days before trial ends
4. **Trial Expired** - Convert to paid
5. **Subscription Confirmed** - Payment success
6. **Subscription Cancelled** - Win-back campaign
7. **Founder Welcome** - Exclusive founder onboarding
8. **Streak Milestone** - Celebration emails (7, 30, 100 days)
9. **Weekly Summary** - Engagement digest

#### Marketing Sequences:
1. **Free User Nurture** (Days 1, 3, 7, 14)
   - Day 1: Welcome + quick start
   - Day 3: Feature highlight (AI logging)
   - Day 7: Social proof + testimonials
   - Day 14: Limited time offer

2. **Churned User Win-back** (Days 3, 7, 30)
   - Day 3: "We miss you" + incentive
   - Day 7: Feature update highlights
   - Day 30: Special comeback offer

---

## Conversion Points (Soft Paywalls)

### Strategic Upgrade Prompts:

1. **Limit Reached**
   - "You've used 3/3 photo estimates today. Upgrade for unlimited!"
   - Show progress bar: [|||------] 3/3

2. **Premium Feature Tap**
   - Blur/lock icon on premium widgets
   - "HRV Analysis is a Pro feature. Unlock now?"

3. **Achievement Unlocked**
   - "Congrats on 7-day streak! Pro members earn 2x coins."

4. **Data Milestone**
   - "You've logged 100 meals! Export your data with Pro."

5. **Social Trigger**
   - "3 friends have Pro. Join them for squad challenges!"

6. **Time-Based**
   - After 14 days: "Loving MyMacro? Get 50% off your first month!"

---

## Analytics & KPIs

### Track These Metrics:

1. **Conversion Funnel**
   - Free → Trial: X%
   - Trial → Paid: X%
   - Paid → Churned: X%

2. **Feature Usage by Tier**
   - Which features drive upgrades?
   - Which limits are hit most?

3. **Revenue Metrics**
   - MRR (Monthly Recurring Revenue)
   - ARPU (Average Revenue Per User)
   - LTV (Lifetime Value)
   - CAC (Customer Acquisition Cost)

4. **Engagement**
   - DAU/MAU ratio
   - Session length by tier
   - Feature adoption rates

---

## Implementation Phases

### Phase 1: Core Premium Infrastructure
- [ ] Create `usePremium` hook
- [ ] Create `useUsageLimits` hook
- [ ] Add Supabase tables
- [ ] Update RevenueCat service
- [ ] Create PaywallSheet v2

### Phase 2: Feature Gating
- [ ] Gate AI features
- [ ] Gate health widgets
- [ ] Gate body scan
- [ ] Gate squad features
- [ ] Add upgrade prompts

### Phase 3: Email Campaigns
- [ ] Welcome sequence
- [ ] Trial flow
- [ ] Win-back campaign
- [ ] Weekly digest

### Phase 4: Analytics
- [ ] Conversion tracking
- [ ] Feature usage tracking
- [ ] Revenue dashboard

---

## Pricing Psychology

1. **Anchoring**: Show yearly first (best value)
2. **Savings Badge**: "Save 33%" on yearly
3. **Social Proof**: "Join 10,000+ Pro members"
4. **Urgency**: "Founder spots remaining: 47/500"
5. **Risk Reversal**: "7-day free trial, cancel anytime"
6. **Feature Comparison**: Side-by-side Free vs Pro table
