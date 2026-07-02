create extension if not exists pgcrypto;

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  -- 'post' -> public.posts, 'video' -> public.short_videos，故不設單一外鍵
  target_type text not null check (target_type in ('post', 'video')),
  target_post_id uuid not null,
  reason text not null default 'other' check (
    reason in (
      'spam',
      'harassment',
      'violence',
      'hate_or_abuse',
      'scam_or_fraud',
      'self_harm',
      'other'
    )
  ),
  note text null,
  created_at timestamptz not null default now(),
  -- 同一人對同一內容只能檢舉一次；lib/reportContent.ts 依 23505 判斷重複
  unique (reporter_id, target_type, target_post_id)
);

create index if not exists content_reports_target_idx
  on public.content_reports (target_type, target_post_id);

create index if not exists content_reports_reporter_idx
  on public.content_reports (reporter_id, created_at desc);

alter table public.content_reports enable row level security;

create policy "content reports select own"
  on public.content_reports
  for select
  using (auth.uid() = reporter_id);

create policy "content reports insert own"
  on public.content_reports
  for insert
  with check (auth.uid() = reporter_id);

-- 刻意不開 update/delete policy：檢舉送出後不可由使用者撤銷或竄改，
-- 審核與移除由後台以 service role 處理。
