-- =============================================================================
-- Tarot Italia — schema Supabase unificato (Auth + consulti + Itha/PayPal)
-- =============================================================================
-- Fonte: supabase/schema.sql + supabase/itha.sql + bookings-user-cancel.sql
-- Allineato a: AuthContext, purchases, serverPaypal, serverDecode, client Itha
--
-- Uso: copiare ed eseguire nell'SQL Editor del progetto Supabase (dopo Auth attivo).
-- Idempotente: sicuro rieseguire su DB già parzialmente creato.
-- Admin di riferimento (is_admin): info@tarotitalia.com
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  consent_privacy boolean not null default false,
  consent_adult boolean not null default false,
  consent_refund boolean not null default false,
  consents_accepted_at timestamptz,
  itha_credits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists itha_credits integer not null default 0;

-- ---------------------------------------------------------------------------
-- 2. bookings (prenotazioni consulti — tabella canonica)
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  consult_type text not null check (consult_type in ('focus', 'deep')),
  minutes integer not null check (minutes in (30, 60)),
  consult_price numeric(10, 2) not null check (consult_price in (40, 60)),
  pdf_report boolean not null default false,
  pdf_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null,
  mode text not null check (mode in ('studio', 'remote')),
  session_date date not null,
  slot text not null,
  guest_name text not null,
  phone text not null,
  birth date,
  query text,
  status text not null default 'pending_whatsapp'
    check (status in ('pending', 'pending_whatsapp', 'confirmed', 'completed', 'cancelled')),
  consent_privacy boolean not null default false,
  consent_adult boolean not null default false,
  consent_refund boolean not null default false,
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists bookings_user_id_created_at_idx
  on public.bookings (user_id, created_at desc);

create index if not exists bookings_session_date_slot_idx
  on public.bookings (session_date, slot);

-- ---------------------------------------------------------------------------
-- 3. purchases (legacy, allineata a bookings — fallback AuthContext)
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
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
  status text not null default 'pending_whatsapp',
  consent_privacy boolean not null default false,
  consent_adult boolean not null default false,
  consent_refund boolean not null default false,
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.purchases alter column user_id drop not null;
alter table public.purchases add column if not exists whatsapp_sent_at timestamptz;

do $$
begin
  alter table public.purchases drop constraint if exists purchases_status_check;
  alter table public.purchases
    add constraint purchases_status_check
    check (status in ('pending', 'pending_whatsapp', 'confirmed', 'completed', 'cancelled'));
exception
  when duplicate_object then null;
end $$;

create index if not exists purchases_user_id_created_at_idx
  on public.purchases (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. itha_readings (archivio stese — insert da /api/itha-decode)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 5. itha_orders (ordini PayPal — create/capture/webhook via service_role)
--    status: created → completed (capture) → refunded (webhook rimborso)
-- ---------------------------------------------------------------------------
create table if not exists public.itha_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  credits integer not null,
  amount numeric(10, 2) not null,
  paypal_order_id text unique,
  status text not null default 'created',
  created_at timestamptz not null default now()
);

do $$
begin
  alter table public.itha_orders drop constraint if exists itha_orders_status_check;
  alter table public.itha_orders
    add constraint itha_orders_status_check
    check (status in ('created', 'completed', 'refunded'));
exception
  when duplicate_object then null;
  when undefined_table then null;
end $$;

do $$
begin
  alter table public.itha_orders drop constraint if exists itha_orders_plan_id_check;
  alter table public.itha_orders
    add constraint itha_orders_plan_id_check
    check (plan_id in ('singola', 'pacchetto3', 'pass5'));
exception
  when duplicate_object then null;
  when undefined_table then null;
end $$;

create index if not exists itha_orders_user_id_created_at_idx
  on public.itha_orders (user_id, created_at desc);

create index if not exists itha_orders_paypal_order_id_idx
  on public.itha_orders (paypal_order_id);

-- ---------------------------------------------------------------------------
-- 6. Funzioni di supporto
-- ---------------------------------------------------------------------------

-- Profilo alla registrazione Auth
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

-- updated_at su profiles
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

-- Admin (JWT email)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'info@tarotitalia.com';
$$;

-- Blocca modifiche dirette a itha_credits (solo RPC con flag o service_role)
create or replace function public.protect_itha_credits()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.itha_credits is distinct from old.itha_credits then
    if coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' then
      return new;
    end if;
    if current_setting('itha.credit_ok', true) = '1' then
      return new;
    end if;
    new.itha_credits := old.itha_credits;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_itha_credits on public.profiles;
create trigger profiles_protect_itha_credits
  before update on public.profiles
  for each row execute procedure public.protect_itha_credits();

-- ---------------------------------------------------------------------------
-- 7. RPC crediti Itha
-- ---------------------------------------------------------------------------

-- Consumo 1 credito (utente autenticato → /api/itha-decode)
create or replace function public.consume_itha_credit()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare remaining integer;
begin
  perform set_config('itha.credit_ok', '1', true);
  update public.profiles
  set itha_credits = itha_credits - 1
  where id = auth.uid()
    and itha_credits > 0
  returning itha_credits into remaining;
  if remaining is null then
    raise exception 'NO_CREDITS';
  end if;
  return remaining;
end;
$$;

-- Accredito dopo PayPal capture / webhook (solo service_role)
create or replace function public.add_itha_credits(p_user uuid, p_credits integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare remaining integer;
begin
  if p_credits is null or p_credits < 1 then
    raise exception 'INVALID_CREDITS';
  end if;
  perform set_config('itha.credit_ok', '1', true);
  update public.profiles
  set itha_credits = itha_credits + p_credits
  where id = p_user
  returning itha_credits into remaining;
  if remaining is null then
    insert into public.profiles (id, itha_credits)
    values (p_user, p_credits)
    on conflict (id) do update
      set itha_credits = public.profiles.itha_credits + excluded.itha_credits
    returning public.profiles.itha_credits into remaining;
  end if;
  return remaining;
end;
$$;

-- Storno crediti su rimborso PayPal (solo service_role)
create or replace function public.subtract_itha_credits(p_user uuid, p_credits integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare remaining integer;
begin
  if p_credits is null or p_credits < 1 then
    raise exception 'INVALID_CREDITS';
  end if;
  perform set_config('itha.credit_ok', '1', true);
  update public.profiles
  set itha_credits = greatest(itha_credits - p_credits, 0)
  where id = p_user
  returning itha_credits into remaining;
  return coalesce(remaining, 0);
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.purchases enable row level security;
alter table public.itha_readings enable row level security;
alter table public.itha_orders enable row level security;

-- profiles
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

-- bookings
drop policy if exists "bookings_insert_guest" on public.bookings;
create policy "bookings_insert_guest"
  on public.bookings for insert
  to anon
  with check (user_id is null);

drop policy if exists "bookings_insert_auth" on public.bookings;
create policy "bookings_insert_auth"
  on public.bookings for insert
  to authenticated
  with check (user_id is null or auth.uid() = user_id or public.is_admin());

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "bookings_update_admin" on public.bookings;
create policy "bookings_update_admin"
  on public.bookings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "bookings_update_own_cancel" on public.bookings;
create policy "bookings_update_own_cancel"
  on public.bookings for update
  to authenticated
  using (
    auth.uid() = user_id
    and status in ('pending', 'pending_whatsapp', 'confirmed')
  )
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );

-- purchases
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

drop policy if exists "purchases_update_own_cancel" on public.purchases;
create policy "purchases_update_own_cancel"
  on public.purchases for update
  to authenticated
  using (
    auth.uid() = user_id
    and status in ('pending', 'pending_whatsapp', 'confirmed')
  )
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );

-- itha_readings
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

-- itha_orders (insert/update operativi via service_role nelle API PayPal; select per l’utente)
drop policy if exists "itha_orders_select_own" on public.itha_orders;
create policy "itha_orders_select_own"
  on public.itha_orders for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "itha_orders_insert_own" on public.itha_orders;
create policy "itha_orders_insert_own"
  on public.itha_orders for insert
  to authenticated
  with check (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- 9. Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;

grant insert on public.bookings to anon, authenticated;
grant select on public.bookings to authenticated;
grant update on public.bookings to authenticated;

grant select, insert on public.purchases to authenticated;
grant update on public.purchases to authenticated;

grant select, insert on public.itha_readings to authenticated;
grant select, insert on public.itha_orders to authenticated;

revoke all on function public.consume_itha_credit() from public;
revoke all on function public.add_itha_credits(uuid, integer) from public;
revoke all on function public.subtract_itha_credits(uuid, integer) from public;

grant execute on function public.consume_itha_credit() to authenticated;
grant execute on function public.add_itha_credits(uuid, integer) to service_role;
grant execute on function public.subtract_itha_credits(uuid, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 10. Migrazione opzionale: storico purchases → bookings
-- ---------------------------------------------------------------------------
insert into public.bookings (
  id, user_id, consult_type, minutes, consult_price, pdf_report, pdf_price, total_price,
  mode, session_date, slot, guest_name, phone, birth, query, status,
  consent_privacy, consent_adult, consent_refund, whatsapp_sent_at, created_at
)
select
  id, user_id, consult_type, minutes,
  case when consult_price in (40, 60) then consult_price else 60 end,
  pdf_report, pdf_price, total_price,
  mode, session_date, slot, coalesce(guest_name, ''), coalesce(phone, ''), birth, query,
  case when status = 'pending' then 'pending_whatsapp' else status end,
  consent_privacy, consent_adult, consent_refund, whatsapp_sent_at, created_at
from public.purchases
where session_date is not null and slot is not null
on conflict (id) do nothing;
