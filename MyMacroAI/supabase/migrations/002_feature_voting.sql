-- Feature Voting Board Schema
-- Run this migration in Supabase SQL Editor

-- ============================================================================
-- FEATURE REQUESTS TABLE
-- ============================================================================

create table if not exists public.feature_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) not null,
  
  -- Request details
  title text not null,
  description text not null,
  category text check (category in ('feature', 'improvement', 'bug', 'integration')),
  
  -- Status
  status text check (status in ('pending', 'planned', 'in_progress', 'completed', 'rejected')) default 'pending',
  dev_notes text,  -- Admin response
  
  -- Voting (denormalized)
  upvote_count int default 0,
  downvote_count int default 0,
  score int generated always as (upvote_count - downvote_count) stored,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_feature_requests_score on public.feature_requests(score desc);
create index if not exists idx_feature_requests_status on public.feature_requests(status);

-- RLS
alter table public.feature_requests enable row level security;

create policy "Anyone can view feature requests"
  on public.feature_requests for select
  using (true);

create policy "Authenticated users can create requests"
  on public.feature_requests for insert
  with check (auth.uid() = author_id);

create policy "Authors can update their own requests"
  on public.feature_requests for update
  using (auth.uid() = author_id);

-- ============================================================================
-- FEATURE VOTES TABLE
-- ============================================================================

create table if not exists public.feature_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  request_id uuid references public.feature_requests(id) on delete cascade not null,
  vote_type text check (vote_type in ('up', 'down')) not null,
  created_at timestamptz default now(),
  
  unique(user_id, request_id)
);

-- RLS
alter table public.feature_votes enable row level security;

create policy "Users can view all votes"
  on public.feature_votes for select
  using (true);

create policy "Users can create own votes"
  on public.feature_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.feature_votes for update
  using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.feature_votes for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER: Update vote counts
-- ============================================================================

create or replace function update_feature_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.vote_type = 'up' then
      update public.feature_requests set upvote_count = upvote_count + 1 where id = NEW.request_id;
    else
      update public.feature_requests set downvote_count = downvote_count + 1 where id = NEW.request_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote_type = 'up' then
      update public.feature_requests set upvote_count = upvote_count - 1 where id = OLD.request_id;
    else
      update public.feature_requests set downvote_count = downvote_count - 1 where id = OLD.request_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    -- User changed their vote
    if OLD.vote_type = 'up' then
      update public.feature_requests set upvote_count = upvote_count - 1 where id = OLD.request_id;
    else
      update public.feature_requests set downvote_count = downvote_count - 1 where id = OLD.request_id;
    end if;
    if NEW.vote_type = 'up' then
      update public.feature_requests set upvote_count = upvote_count + 1 where id = NEW.request_id;
    else
      update public.feature_requests set downvote_count = downvote_count + 1 where id = NEW.request_id;
    end if;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

create trigger on_feature_vote_change
  after insert or update or delete on public.feature_votes
  for each row execute function update_feature_vote_counts();

-- ============================================================================
-- ANALYTICS EVENTS TABLE (for admin dashboard)
-- ============================================================================

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  event_type text not null,  -- 'screen_view', 'action', 'error'
  event_name text not null,  -- e.g., 'nutrition_tab', 'log_food', 'crash'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Index for analytics queries
create index if not exists idx_analytics_created on public.analytics_events(created_at desc);
create index if not exists idx_analytics_event on public.analytics_events(event_type, event_name);

-- RLS (only service role can insert/read)
alter table public.analytics_events enable row level security;

create policy "Users can insert own events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id or user_id is null);

-- ============================================================================
-- REPORTS TABLE (for content moderation)
-- ============================================================================

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) not null,
  recipe_id uuid references public.public_recipes(id) on delete cascade,
  reason text not null,
  additional_info text,
  status text check (status in ('pending', 'reviewed', 'resolved', 'dismissed')) default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table public.reports enable row level security;

create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);
