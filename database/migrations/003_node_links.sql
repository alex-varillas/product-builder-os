-- Migration 003: node_links
-- Stores manual cross-links between Canvas, MVP, and Log nodes.
-- Automatic structural/affinity links are computed client-side and NOT stored here.

create table if not exists public.node_links (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  project_id  uuid not null references public.projects(id) on delete cascade,
  source_kind text not null check (source_kind in ('canvas', 'mvp', 'log')),
  source_id   uuid not null,
  target_kind text not null check (target_kind in ('canvas', 'mvp', 'log')),
  target_id   uuid not null,
  created_at  timestamptz not null default now()
);

-- Prevent duplicate links in the same direction
create unique index if not exists node_links_unique_idx
  on public.node_links (project_id, source_kind, source_id, target_kind, target_id);

-- RLS: mirror existing tables (users own their rows)
alter table public.node_links enable row level security;

create policy "Users can read own node_links"
  on public.node_links for select
  using (auth.uid() = user_id);

create policy "Users can insert own node_links"
  on public.node_links for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own node_links"
  on public.node_links for delete
  using (auth.uid() = user_id);
