-- Create table to track API usage for rate limiting and auditing
create table if not exists public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  tokens_used integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.usage_logs enable row level security;

-- Policies
-- 1. Users can ONLY view their own logs (Audit trail)
create policy "Users can view own usage logs" 
  on public.usage_logs for select 
  using (auth.uid() = user_id);

-- 2. Service Role (Edge Functions) can insert logs
-- (No specific policy needed for service_role if RLS basic rules apply, but explicitly:)
-- Note: Service Role bypasses RLS, so this is mainly for documentation or strict setups.
