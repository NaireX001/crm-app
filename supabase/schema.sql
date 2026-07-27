-- =============================================================================
-- CRM Database Schema
-- Run this in the Supabase Dashboard -> SQL Editor (whole file, top to bottom).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where practical.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'sales_rep', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_type as enum ('call', 'email', 'note', 'meeting');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('pending', 'completed');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- profiles
-- One row per auth.users row. Holds the role used for access control.
-- Created automatically on signup via the trigger below.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'sales_rep',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- companies
-- -----------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  industry text,
  phone text,
  address text,
  notes text,
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- contacts
-- -----------------------------------------------------------------------------
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text,
  phone text,
  company_id uuid references public.companies (id) on delete set null,
  tags text[] not null default '{}',
  notes text,
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_company_id_idx on public.contacts (company_id);
create index if not exists contacts_owner_id_idx on public.contacts (owner_id);

-- -----------------------------------------------------------------------------
-- pipeline_stages
-- Shared, ordered list of stages. Editable by admins only.
-- -----------------------------------------------------------------------------
create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- deals
-- -----------------------------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_id uuid references public.contacts (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  stage_id uuid not null references public.pipeline_stages (id),
  value numeric(14, 2) not null default 0,
  currency text not null default 'USD',
  close_date date,
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_stage_id_idx on public.deals (stage_id);
create index if not exists deals_owner_id_idx on public.deals (owner_id);
create index if not exists deals_contact_id_idx on public.deals (contact_id);
create index if not exists deals_company_id_idx on public.deals (company_id);

-- -----------------------------------------------------------------------------
-- activities (calls, emails, notes, meetings)
-- -----------------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  type activity_type not null,
  subject text,
  body text,
  contact_id uuid references public.contacts (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete cascade,
  owner_id uuid references public.profiles (id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint activities_linked_to_something check (
    contact_id is not null or deal_id is not null
  )
);

create index if not exists activities_contact_id_idx on public.activities (contact_id);
create index if not exists activities_deal_id_idx on public.activities (deal_id);

-- -----------------------------------------------------------------------------
-- tasks (follow-ups)
-- -----------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date,
  status task_status not null default 'pending',
  assigned_to uuid references public.profiles (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- =============================================================================
-- updated_at trigger (generic)
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.companies;
create trigger set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.contacts;
create trigger set_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.deals;
create trigger set_updated_at before update on public.deals
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Auto-create a profile row whenever a new user signs up via Supabase Auth.
-- New users default to 'sales_rep'. Promote yourself to admin manually the
-- first time (see instructions at the bottom of this file).
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    'sales_rep'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Helper function: current user's role (SECURITY DEFINER avoids RLS recursion
-- when policies on `profiles` need to check `profiles` itself).
-- =============================================================================
create or replace function public.current_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function public.is_admin()
returns boolean as $$
  select public.current_role() = 'admin';
$$ language sql stable security definer set search_path = public;

-- =============================================================================
-- Row Level Security
--
-- Access model:
--   admin      -> full read/write on everything
--   sales_rep  -> read/write only rows they own (owner_id / assigned_to =
--                 their own profile id); can create new rows for themselves
--   viewer     -> read-only access to everything, no writes
--
-- pipeline_stages is shared config: everyone signed in can read it,
-- only admins can write it.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;

-- ---- profiles -----------------------------------------------------------
drop policy if exists "profiles: self and admin can read" on public.profiles;
create policy "profiles: self and admin can read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: self and admin can update" on public.profiles;
create policy "profiles: self and admin can update"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: admin can insert" on public.profiles;
create policy "profiles: admin can insert"
  on public.profiles for insert
  with check (public.is_admin() or id = auth.uid());

-- ---- companies ------------------------------------------------------------
drop policy if exists "companies: read own or admin or viewer" on public.companies;
create policy "companies: read own or admin or viewer"
  on public.companies for select
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or public.current_role() = 'viewer'
  );

drop policy if exists "companies: write own or admin" on public.companies;
create policy "companies: write own or admin"
  on public.companies for insert
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "companies: update own or admin" on public.companies;
create policy "companies: update own or admin"
  on public.companies for update
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "companies: delete own or admin" on public.companies;
create policy "companies: delete own or admin"
  on public.companies for delete
  using (owner_id = auth.uid() or public.is_admin());

-- ---- contacts ---------------------------------------------------------
drop policy if exists "contacts: read own or admin or viewer" on public.contacts;
create policy "contacts: read own or admin or viewer"
  on public.contacts for select
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or public.current_role() = 'viewer'
  );

drop policy if exists "contacts: insert own or admin" on public.contacts;
create policy "contacts: insert own or admin"
  on public.contacts for insert
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "contacts: update own or admin" on public.contacts;
create policy "contacts: update own or admin"
  on public.contacts for update
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "contacts: delete own or admin" on public.contacts;
create policy "contacts: delete own or admin"
  on public.contacts for delete
  using (owner_id = auth.uid() or public.is_admin());

-- ---- pipeline_stages (shared config) --------------------------------------
drop policy if exists "pipeline_stages: any signed-in user can read" on public.pipeline_stages;
create policy "pipeline_stages: any signed-in user can read"
  on public.pipeline_stages for select
  using (auth.uid() is not null);

drop policy if exists "pipeline_stages: admin can write" on public.pipeline_stages;
create policy "pipeline_stages: admin can write"
  on public.pipeline_stages for insert
  with check (public.is_admin());

drop policy if exists "pipeline_stages: admin can update" on public.pipeline_stages;
create policy "pipeline_stages: admin can update"
  on public.pipeline_stages for update
  using (public.is_admin());

drop policy if exists "pipeline_stages: admin can delete" on public.pipeline_stages;
create policy "pipeline_stages: admin can delete"
  on public.pipeline_stages for delete
  using (public.is_admin());

-- ---- deals ------------------------------------------------------------
drop policy if exists "deals: read own or admin or viewer" on public.deals;
create policy "deals: read own or admin or viewer"
  on public.deals for select
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or public.current_role() = 'viewer'
  );

drop policy if exists "deals: insert own or admin" on public.deals;
create policy "deals: insert own or admin"
  on public.deals for insert
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "deals: update own or admin" on public.deals;
create policy "deals: update own or admin"
  on public.deals for update
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "deals: delete own or admin" on public.deals;
create policy "deals: delete own or admin"
  on public.deals for delete
  using (owner_id = auth.uid() or public.is_admin());

-- ---- activities -------------------------------------------------------
drop policy if exists "activities: read own or admin or viewer" on public.activities;
create policy "activities: read own or admin or viewer"
  on public.activities for select
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or public.current_role() = 'viewer'
  );

drop policy if exists "activities: insert own or admin" on public.activities;
create policy "activities: insert own or admin"
  on public.activities for insert
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "activities: update own or admin" on public.activities;
create policy "activities: update own or admin"
  on public.activities for update
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "activities: delete own or admin" on public.activities;
create policy "activities: delete own or admin"
  on public.activities for delete
  using (owner_id = auth.uid() or public.is_admin());

-- ---- tasks --------------------------------------------------------------
drop policy if exists "tasks: read own or admin or viewer" on public.tasks;
create policy "tasks: read own or admin or viewer"
  on public.tasks for select
  using (
    assigned_to = auth.uid()
    or public.is_admin()
    or public.current_role() = 'viewer'
  );

drop policy if exists "tasks: insert own or admin" on public.tasks;
create policy "tasks: insert own or admin"
  on public.tasks for insert
  with check (assigned_to = auth.uid() or public.is_admin());

drop policy if exists "tasks: update own or admin" on public.tasks;
create policy "tasks: update own or admin"
  on public.tasks for update
  using (assigned_to = auth.uid() or public.is_admin());

drop policy if exists "tasks: delete own or admin" on public.tasks;
create policy "tasks: delete own or admin"
  on public.tasks for delete
  using (assigned_to = auth.uid() or public.is_admin());

-- =============================================================================
-- Seed default pipeline stages (safe to re-run)
-- =============================================================================
insert into public.pipeline_stages (name, sort_order, is_won, is_lost)
values
  ('Lead', 1, false, false),
  ('Contacted', 2, false, false),
  ('Proposal', 3, false, false),
  ('Won', 4, true, false),
  ('Lost', 5, false, true)
on conflict (name) do nothing;

-- =============================================================================
-- POST-SETUP: make your own account an admin
-- =============================================================================
-- 1. Sign up once through the app (once auth pages exist) OR create a user
--    manually in Supabase Dashboard -> Authentication -> Users -> Add user.
-- 2. Then run this, replacing the email:
--
--    update public.profiles set role = 'admin' where email = 'you@example.com';
-- =============================================================================
