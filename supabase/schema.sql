-- Tarot Italia — schema Supabase
-- Admin di riferimento: info@tarotitalia.com
-- Eseguire nell'editor SQL del progetto Supabase (dopo aver abilitato Auth).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profili
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  consent_privacy boolean not null default false,
  consent_adult boolean not null default false,
  consent_refund boolean not null default false,
  consents_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Acquisti / prenotazioni consulti
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consult_type text not null check (consult_type in ('focus', 'deep')),
  minutes integer not null check (minutes in (30, 60)),
  consult_price numeric(10, 2) not null,
  pdf_report boolean not null default false,
  pdf_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null,
  mode text not null check (mode in ('studio', 'remote')),
  session_date date,
  slot text,
  guest_name text,
  phone text,
  birth date,
  query text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  consent_privacy boolean not null default false,
  consent_adult boolean not null default false,
  consent_refund boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_id_created_at_idx
  on public.purchases (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Trigger: profilo alla registrazione
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper admin (email di riferimento)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'info@tarotitalia.com';
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.purchases enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own"
  on public.purchases for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "purchases_insert_own" on public.purchases;
create policy "purchases_insert_own"
  on public.purchases for insert
  to authenticated
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "purchases_update_admin" on public.purchases;
create policy "purchases_update_admin"
  on public.purchases for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.purchases to authenticated;
grant update on public.purchases to authenticated;
