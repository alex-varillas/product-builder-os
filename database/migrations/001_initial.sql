-- BoardOS v0.1 — initial schema
-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New query)

-- ─── Projects ─────────────────────────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text not null default '',
  color       text not null default '#6D28D9',
  version     text not null default 'v0.1',
  stage       text not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table projects enable row level security;

create policy "users can select own projects"
  on projects for select using (auth.uid() = user_id);

create policy "users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "users can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- ─── Canvas cards ─────────────────────────────────────────────────────────────
create table if not exists canvas_cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  slot        text not null,         -- "problem" | "user" | "solution" | custom
  title       text not null default '',
  content     text not null default '',
  badge       text not null default 'core',
  updated_at  timestamptz not null default now()
);

alter table canvas_cards enable row level security;

create policy "users can select own canvas cards"
  on canvas_cards for select using (auth.uid() = user_id);

create policy "users can insert own canvas cards"
  on canvas_cards for insert with check (auth.uid() = user_id);

create policy "users can update own canvas cards"
  on canvas_cards for update using (auth.uid() = user_id);

create policy "users can delete own canvas cards"
  on canvas_cards for delete using (auth.uid() = user_id);

-- ─── MVP items ────────────────────────────────────────────────────────────────
create table if not exists mvp_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  column_id   text not null default 'core',   -- "core" | "later" | "not_now" | "validate"
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table mvp_items enable row level security;

create policy "users can select own mvp items"
  on mvp_items for select using (auth.uid() = user_id);

create policy "users can insert own mvp items"
  on mvp_items for insert with check (auth.uid() = user_id);

create policy "users can update own mvp items"
  on mvp_items for update using (auth.uid() = user_id);

create policy "users can delete own mvp items"
  on mvp_items for delete using (auth.uid() = user_id);

-- ─── Log entries ──────────────────────────────────────────────────────────────
create table if not exists log_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  project_id  uuid not null references projects(id) on delete cascade,
  type        text not null default 'update',  -- "update" | "decision" | "learning" | "blocker"
  text        text not null,
  created_at  timestamptz not null default now()
);

alter table log_entries enable row level security;

create policy "users can select own log entries"
  on log_entries for select using (auth.uid() = user_id);

create policy "users can insert own log entries"
  on log_entries for insert with check (auth.uid() = user_id);

create policy "users can update own log entries"
  on log_entries for update using (auth.uid() = user_id);

create policy "users can delete own log entries"
  on log_entries for delete using (auth.uid() = user_id);

-- ─── Inbox ideas ──────────────────────────────────────────────────────────────
create table if not exists inbox_ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table inbox_ideas enable row level security;

create policy "users can select own inbox ideas"
  on inbox_ideas for select using (auth.uid() = user_id);

create policy "users can insert own inbox ideas"
  on inbox_ideas for insert with check (auth.uid() = user_id);

create policy "users can update own inbox ideas"
  on inbox_ideas for update using (auth.uid() = user_id);

create policy "users can delete own inbox ideas"
  on inbox_ideas for delete using (auth.uid() = user_id);

-- ─── updated_at triggers ──────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger canvas_cards_updated_at
  before update on canvas_cards
  for each row execute function set_updated_at();

create trigger inbox_ideas_updated_at
  before update on inbox_ideas
  for each row execute function set_updated_at();
