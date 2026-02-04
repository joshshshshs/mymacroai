-- Migration: Create core app tables for MyMacroAI
-- Tables: recovery_data, cycle_tracking, squad_members, reactions

-- =====================================================
-- 1. RECOVERY DATA TABLE
-- Stores daily recovery metrics from wearables
-- =====================================================
create table if not exists public.recovery_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  hrv_score integer,
  resting_hr integer,
  sleep_hours numeric(4,2),
  sleep_quality integer, -- 0-100 scale
  strain_score numeric(4,2), -- 0-21 scale (WHOOP style)
  recovery_score integer, -- 0-100 scale
  readiness_status text check (readiness_status in ('red', 'yellow', 'green')),
  source text, -- 'apple_health', 'whoop', 'oura', 'garmin', 'manual'
  raw_data jsonb, -- Store original wearable data
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Enable RLS
alter table public.recovery_data enable row level security;

-- Policies
create policy "Users can view own recovery data"
  on public.recovery_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own recovery data"
  on public.recovery_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recovery data"
  on public.recovery_data for update
  using (auth.uid() = user_id);

-- Index for faster date-based queries
create index if not exists idx_recovery_data_user_date
  on public.recovery_data(user_id, date desc);

-- =====================================================
-- 2. CYCLE TRACKING TABLE
-- Stores menstrual cycle data for female users
-- =====================================================
create table if not exists public.cycle_tracking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  cycle_start_date date not null,
  cycle_length integer default 28,
  period_length integer default 5,
  current_phase text check (current_phase in ('menstrual', 'follicular', 'ovulation', 'luteal')),
  phase_day integer,
  symptoms jsonb, -- Array of symptoms: ['cramps', 'bloating', etc.]
  notes text,
  predicted_next_start date,
  source text default 'manual', -- 'manual', 'apple_health', 'flo', 'clue'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.cycle_tracking enable row level security;

-- Policies
create policy "Users can view own cycle data"
  on public.cycle_tracking for select
  using (auth.uid() = user_id);

create policy "Users can insert own cycle data"
  on public.cycle_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cycle data"
  on public.cycle_tracking for update
  using (auth.uid() = user_id);

create policy "Users can delete own cycle data"
  on public.cycle_tracking for delete
  using (auth.uid() = user_id);

-- Index for user queries
create index if not exists idx_cycle_tracking_user
  on public.cycle_tracking(user_id, cycle_start_date desc);

-- =====================================================
-- 3. SQUAD MEMBERS TABLE
-- Stores squad/accountability group memberships
-- =====================================================
create table if not exists public.squad_members (
  id uuid default gen_random_uuid() primary key,
  squad_id uuid not null,
  user_id uuid references auth.users(id) not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  nickname text,
  avatar_url text,
  status text default 'active' check (status in ('active', 'inactive', 'pending')),
  streak_days integer default 0,
  total_points integer default 0,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active_at timestamp with time zone,
  unique(squad_id, user_id)
);

-- Enable RLS
alter table public.squad_members enable row level security;

-- Policies - Squad members can see each other
create policy "Squad members can view squad data"
  on public.squad_members for select
  using (
    squad_id in (
      select squad_id from public.squad_members where user_id = auth.uid()
    )
  );

create policy "Users can insert themselves to squads"
  on public.squad_members for insert
  with check (auth.uid() = user_id);

create policy "Users can update own squad membership"
  on public.squad_members for update
  using (auth.uid() = user_id);

create policy "Users can leave squads"
  on public.squad_members for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_squad_members_squad
  on public.squad_members(squad_id);
create index if not exists idx_squad_members_user
  on public.squad_members(user_id);

-- =====================================================
-- 4. REACTIONS TABLE
-- Stores emoji reactions/nudges between squad members
-- =====================================================
drop table if exists public.reactions cascade;
create table if not exists public.reactions (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references auth.users(id) not null,
  to_user_id uuid references auth.users(id) not null,
  squad_id uuid not null,
  reaction_type text not null, -- 'fire', 'clap', 'muscle', 'eyes', 'nudge'
  message text, -- Optional message with nudge
  context text, -- 'streak', 'workout', 'meal', 'general'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reactions enable row level security;

-- Policies
create policy "Users can view reactions they sent or received"
  on public.reactions for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can send reactions"
  on public.reactions for insert
  with check (auth.uid() = from_user_id);

create policy "Recipients can mark reactions as read"
  on public.reactions for update
  using (auth.uid() = to_user_id);

-- Indexes
create index if not exists idx_reactions_to_user
  on public.reactions(to_user_id, is_read, created_at desc);
create index if not exists idx_reactions_squad
  on public.reactions(squad_id, created_at desc);

-- =====================================================
-- 5. SQUADS TABLE (Parent table for squad_members)
-- =====================================================
create table if not exists public.squads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  invite_code text unique,
  max_members integer default 10,
  is_public boolean default false,
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.squads enable row level security;

-- Policies
create policy "Anyone can view public squads"
  on public.squads for select
  using (is_public = true or id in (
    select squad_id from public.squad_members where user_id = auth.uid()
  ));

create policy "Users can create squads"
  on public.squads for insert
  with check (auth.uid() = created_by);

create policy "Squad owners can update"
  on public.squads for update
  using (auth.uid() = created_by);

-- Add foreign key to squad_members after squads table exists
alter table public.squad_members
  add constraint fk_squad_members_squad
  foreign key (squad_id) references public.squads(id) on delete cascade;

alter table public.reactions
  add constraint fk_reactions_squad
  foreign key (squad_id) references public.squads(id) on delete cascade;

-- =====================================================
-- 6. FOUNDERS TABLE (For founder status tracking)
-- =====================================================
create table if not exists public.founders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) unique not null,
  email text not null,
  founder_number integer unique not null,
  tier text default 'founding_member' check (tier in ('founding_member', 'early_adopter', 'pioneer')),
  perks jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.founders enable row level security;

-- Policies
create policy "Users can view own founder status"
  on public.founders for select
  using (auth.uid() = user_id);

-- Service role handles inserts via edge function

-- Sequence for founder numbers
create sequence if not exists founder_number_seq start 1;

-- Function to auto-assign founder number
create or replace function assign_founder_number()
returns trigger as $$
begin
  if new.founder_number is null then
    new.founder_number := nextval('founder_number_seq');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_founder_number
  before insert on public.founders
  for each row
  execute function assign_founder_number();
