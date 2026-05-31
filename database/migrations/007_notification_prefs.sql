-- Desktop notification preferences (v0.3)
alter table user_preferences add column if not exists desktop_notifications boolean not null default false;
alter table user_preferences add column if not exists block_reminder_min   integer not null default 5;
