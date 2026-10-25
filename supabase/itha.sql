-- Itha · Crocicchio di Ecate — archivio letture
-- Eseguire dopo supabase/schema.sql (public.profiles, public.is_admin).

create table if not exists public.itha_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  question text not null,
  cards jsonb not null,
  analisi text not null,
  coerenza text not null,
  spunto text not null,
  created_at timestamptz not null default now()
);

create index if not exists itha_readings_user_id_created_at_idx
  on public.itha_readings (user_id, created_at desc);

alter table public.itha_readings enable row level security;

drop policy if exists "itha_readings_select_own" on public.itha_readings;
create policy "itha_readings_select_own"
  on public.itha_readings for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "itha_readings_insert_own" on public.itha_readings;
create policy "itha_readings_insert_own"
  on public.itha_readings for insert
  to authenticated
  with check (auth.uid() = user_id or public.is_admin());

grant select, insert on public.itha_readings to authenticated;
