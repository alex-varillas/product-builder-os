-- User preferences (Pomodoro durations, daily focus goal)
create table if not exists user_preferences (
  user_id                          uuid primary key references auth.users(id) on delete cascade,
  pomodoro_focus_min               integer not null default 25,
  pomodoro_break_min               integer not null default 5,
  pomodoro_long_break              integer not null default 15,
  pomodoro_sessions_to_long_break  integer not null default 4,
  daily_focus_goal_min             integer not null default 240,
  created_at                       timestamptz not null default now(),
  updated_at                       timestamptz not null default now()
);

-- RLS
alter table user_preferences enable row level security;

create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger set_updated_at_user_preferences
  before update on user_preferences
  for each row execute function set_updated_at();
