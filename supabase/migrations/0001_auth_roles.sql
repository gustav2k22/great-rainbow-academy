-- ============================================================
-- 0001_auth_roles.sql
-- Profiles, roles, and helper functions
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---- Role enum -------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'system_administrator',
      'school_administrator',
      'teacher',
      'staff',
      'parent',
      'student'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('active', 'suspended', 'pending');
  end if;
end $$;

-- ---- Profiles --------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique,
  full_name   text not null default '',
  role        public.user_role not null default 'staff',
  status      public.account_status not null default 'active',
  phone       text,
  avatar_url  text,
  title       text,                 -- e.g. "Mr", "Mrs", job title
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Application users mirrored from auth.users with role information.';

-- ---- updated_at trigger helper --------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---- Auto-create profile when an auth user is created ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Role helper functions (used by RLS everywhere) -----------
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff_member()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('system_administrator','school_administrator','teacher','staff')
      and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('system_administrator','school_administrator')
      and status = 'active'
  );
$$;

create or replace function public.is_system_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'system_administrator'
      and status = 'active'
  );
$$;

-- ---- RLS for profiles -----------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.is_staff_member());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles admin all" on public.profiles;
create policy "profiles admin all" on public.profiles
  for all using (public.is_system_admin()) with check (public.is_system_admin());
