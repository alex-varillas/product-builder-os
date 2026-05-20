-- BoardOS v0.1 — add missing mvp_items columns
-- Run this in Supabase SQL editor if you already ran 001_initial.sql

alter table mvp_items
  add column if not exists priority text not null default 'P3',
  add column if not exists why      text not null default '',
  add column if not exists done     boolean not null default false;
