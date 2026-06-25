create extension if not exists pgcrypto;

create table if not exists public.ai_radar_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  success boolean not null default true,
  source text default 'ai-radar',
  metadata jsonb default '{}'::jsonb
);

create index if not exists ai_radar_usage_events_user_success_created_idx
  on public.ai_radar_usage_events (user_id, success, created_at desc);

create table if not exists public.ai_radar_cooldowns (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cooldown_until timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_radar_cooldowns_until_idx
  on public.ai_radar_cooldowns (cooldown_until);

alter table public.ai_radar_usage_events enable row level security;
alter table public.ai_radar_cooldowns enable row level security;

create policy "ai radar usage select own"
  on public.ai_radar_usage_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "ai radar cooldown select own"
  on public.ai_radar_cooldowns
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_ai_radar_cooldowns_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_radar_cooldowns_updated_at
  on public.ai_radar_cooldowns;

create trigger set_ai_radar_cooldowns_updated_at
  before update on public.ai_radar_cooldowns
  for each row
  execute function public.set_ai_radar_cooldowns_updated_at();
