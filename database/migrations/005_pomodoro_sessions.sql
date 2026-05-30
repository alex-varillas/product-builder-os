create table pomodoro_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  time_block_id   uuid references time_blocks(id) on delete set null,
  project_id      uuid references projects(id) on delete set null,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  duration_min    integer not null,
  kind            text not null check (kind in ('focus','break')),
  completed       boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table pomodoro_sessions enable row level security;

create policy "users can select own pomodoro_sessions"
  on pomodoro_sessions for select using (auth.uid() = user_id);

create policy "users can insert own pomodoro_sessions"
  on pomodoro_sessions for insert with check (auth.uid() = user_id);

create policy "users can update own pomodoro_sessions"
  on pomodoro_sessions for update using (auth.uid() = user_id);

create index pomodoro_sessions_user_started_idx on pomodoro_sessions (user_id, started_at);
