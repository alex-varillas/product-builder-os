create table time_blocks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  project_id   uuid references projects(id) on delete cascade,
  mvp_item_id  uuid references mvp_items(id) on delete set null,
  label        text not null,
  start_at     timestamptz not null,
  end_at       timestamptz not null,
  color        text not null default '#6D28D9',
  done         boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table time_blocks enable row level security;

create policy "users can select own time_blocks"
  on time_blocks for select using (auth.uid() = user_id);

create policy "users can insert own time_blocks"
  on time_blocks for insert with check (auth.uid() = user_id);

create policy "users can update own time_blocks"
  on time_blocks for update using (auth.uid() = user_id);

create policy "users can delete own time_blocks"
  on time_blocks for delete using (auth.uid() = user_id);

create trigger set_time_blocks_updated_at
  before update on time_blocks
  for each row execute function set_updated_at();

create index time_blocks_user_start_idx on time_blocks (user_id, start_at);
