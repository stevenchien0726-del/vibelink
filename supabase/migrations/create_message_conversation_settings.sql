create extension if not exists pgcrypto;

create table if not exists public.message_conversation_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  is_pinned boolean not null default false,
  is_hidden boolean not null default false,
  pinned_at timestamptz null,
  hidden_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, conversation_id)
);

create index if not exists message_conversation_settings_user_pinned_idx
  on public.message_conversation_settings (user_id, is_pinned, pinned_at desc);

create index if not exists message_conversation_settings_user_hidden_idx
  on public.message_conversation_settings (user_id, is_hidden);

create index if not exists message_conversation_settings_conversation_idx
  on public.message_conversation_settings (conversation_id);

alter table public.message_conversation_settings enable row level security;

create policy "message settings select own"
  on public.message_conversation_settings
  for select
  using (auth.uid() = user_id);

create policy "message settings insert own"
  on public.message_conversation_settings
  for insert
  with check (auth.uid() = user_id);

create policy "message settings update own"
  on public.message_conversation_settings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "message settings delete own"
  on public.message_conversation_settings
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_message_conversation_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_message_conversation_settings_updated_at
  on public.message_conversation_settings;

create trigger set_message_conversation_settings_updated_at
  before update on public.message_conversation_settings
  for each row
  execute function public.set_message_conversation_settings_updated_at();
