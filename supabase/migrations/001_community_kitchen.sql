-- Community Kitchen Schema
-- Run this migration in Supabase SQL Editor

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

create table if not exists public.profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  
  -- Social links
  instagram_handle text,
  tiktok_handle text,
  personal_link text,
  
  -- Privacy settings
  show_goals boolean default false,
  show_weight boolean default false,
  
  -- Stats (denormalized for performance)
  follower_count int default 0,
  following_count int default 0,
  recipe_count int default 0,
  
  -- Gamification
  is_verified boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS policies for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================================================
-- PUBLIC RECIPES TABLE
-- ============================================================================

create table if not exists public.public_recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) not null,
  
  -- Recipe data
  name text not null,
  description text,
  instructions text,
  image_url text not null,
  
  -- Locked macros (from verified log)
  calories int not null,
  protein numeric(5,1) not null,
  carbs numeric(5,1) not null,
  fats numeric(5,1) not null,
  
  -- Metadata
  categories text[] default '{}',
  prep_time_minutes int,
  servings int default 1,
  
  -- Source reference (original local meal ID)
  local_meal_id text,
  ingredients jsonb not null default '[]',
  
  -- Engagement (denormalized for performance)
  heart_count int default 0,
  thumbs_up_count int default 0,
  thumbs_down_count int default 0,
  
  -- Moderation
  is_flagged boolean default false,
  is_approved boolean default true,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for feed queries
create index if not exists idx_recipes_created on public.public_recipes(created_at desc);
create index if not exists idx_recipes_calories on public.public_recipes(calories);
create index if not exists idx_recipes_protein on public.public_recipes(protein desc);
create index if not exists idx_recipes_author on public.public_recipes(author_id);

-- RLS policies for recipes
alter table public.public_recipes enable row level security;

create policy "Public recipes are viewable by everyone"
  on public.public_recipes for select
  using (is_approved = true and is_flagged = false);

create policy "Users can create own recipes"
  on public.public_recipes for insert
  with check (auth.uid() = author_id);

create policy "Users can update own recipes"
  on public.public_recipes for update
  using (auth.uid() = author_id);

create policy "Users can delete own recipes"
  on public.public_recipes for delete
  using (auth.uid() = author_id);

-- ============================================================================
-- REACTIONS TABLE
-- ============================================================================

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  recipe_id uuid references public.public_recipes(id) on delete cascade not null,
  reaction_type text check (reaction_type in ('heart', 'thumbs_up', 'thumbs_down')),
  created_at timestamptz default now(),
  
  unique(user_id, recipe_id)
);

-- RLS policies for reactions
alter table public.reactions enable row level security;

create policy "Users can view all reactions"
  on public.reactions for select
  using (true);

create policy "Users can create own reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reactions"
  on public.reactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- FOLLOWS TABLE
-- ============================================================================

create table if not exists public.follows (
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  created_at timestamptz default now(),
  
  primary key (follower_id, following_id)
);

-- RLS policies for follows
alter table public.follows enable row level security;

create policy "Anyone can view follows"
  on public.follows for select
  using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================================================
-- FUNCTIONS: Update counts on reaction changes
-- ============================================================================

create or replace function update_recipe_reaction_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.reaction_type = 'heart' then
      update public.public_recipes set heart_count = heart_count + 1 where id = NEW.recipe_id;
    elsif NEW.reaction_type = 'thumbs_up' then
      update public.public_recipes set thumbs_up_count = thumbs_up_count + 1 where id = NEW.recipe_id;
    elsif NEW.reaction_type = 'thumbs_down' then
      update public.public_recipes set thumbs_down_count = thumbs_down_count + 1 where id = NEW.recipe_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.reaction_type = 'heart' then
      update public.public_recipes set heart_count = heart_count - 1 where id = OLD.recipe_id;
    elsif OLD.reaction_type = 'thumbs_up' then
      update public.public_recipes set thumbs_up_count = thumbs_up_count - 1 where id = OLD.recipe_id;
    elsif OLD.reaction_type = 'thumbs_down' then
      update public.public_recipes set thumbs_down_count = thumbs_down_count - 1 where id = OLD.recipe_id;
    end if;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

create trigger on_reaction_change
  after insert or delete on public.reactions
  for each row execute function update_recipe_reaction_counts();

-- ============================================================================
-- FUNCTIONS: Update follower counts
-- ============================================================================

create or replace function update_follower_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles set follower_count = follower_count + 1 where id = NEW.following_id;
    update public.profiles set following_count = following_count + 1 where id = NEW.follower_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles set follower_count = follower_count - 1 where id = OLD.following_id;
    update public.profiles set following_count = following_count - 1 where id = OLD.follower_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute function update_follower_counts();

-- ============================================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  return NEW;
end;
$$ language plpgsql security definer;

-- Only create trigger if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function handle_new_user();
  end if;
end;
$$;
