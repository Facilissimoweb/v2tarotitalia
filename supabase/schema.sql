-- Tarot Italia — schema Supabase
-- Admin di riferimento: info@tarotitalia.com
-- Eseguire nell'editor SQL del progetto Supabase (dopo aver abilitato Auth).
-- Prenotazioni canoniche: user_id = auth.uid(). L’inserimento guest resta solo per compatibilità storica.

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
-- Prenotazioni consulti (canonica)
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
    check (status in ('pending', 'pending_payment', 'pending_whatsapp', 'confirmed', 'completed', 'cancelled')),
  consent_privacy boolean not null default false,
  consent_adult boolean not null default false,
  consent_refund boolean not null default false,
  whatsapp_sent_at timestamptz,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_amount_total integer,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_id_created_at_idx
  on public.bookings (user_id, created_at desc);

create index if not exists bookings_session_date_slot_idx
  on public.bookings (session_date, slot);

create unique index if not exists bookings_active_slot_unique
  on public.bookings (session_date, slot)
  where status <> 'cancelled';

create unique index if not exists bookings_stripe_session_unique
  on public.bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- ---------------------------------------------------------------------------
-- Acquisti (tabella legacy, allineata)
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
    check (status in ('pending', 'pending_payment', 'pending_whatsapp', 'confirmed', 'completed', 'cancelled'));
exception
  when duplicate_object then null;
end $$;

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
alter table public.bookings enable row level security;
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
    and status in ('pending', 'pending_payment', 'pending_whatsapp', 'confirmed')
  )
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );

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

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant insert on public.bookings to anon, authenticated;
grant select on public.bookings to authenticated;
grant update on public.bookings to authenticated;
grant select, insert on public.purchases to authenticated;
grant update on public.purchases to authenticated;

create or replace function public.occupied_slots(from_date date, to_date date)
returns table (session_date date, slot text)
language sql
stable
security definer
set search_path = public
as $$
  select b.session_date, b.slot
  from public.bookings b
  where b.status <> 'cancelled'
    and b.session_date between from_date and to_date;
$$;

revoke all on function public.occupied_slots(date, date) from public;
grant execute on function public.occupied_slots(date, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Ordini digitali (dispense e materiali): sblocco per titolo
-- ---------------------------------------------------------------------------
create table if not exists public.digital_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null check (product_id in ('trattato', 'velo', 'taccuino', 'alchemici')),
  title text not null,
  format text not null,
  price numeric(10, 2) not null check (price > 0),
  guest_name text not null,
  phone text not null,
  status text not null default 'pending_payment'
    check (status in ('pending', 'pending_payment', 'confirmed', 'completed', 'cancelled')),
  consent_privacy boolean not null default false,
  consent_adult boolean not null default false,
  consent_refund boolean not null default false,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_amount_total integer,
  paid_at timestamptz,
  email_sent_at timestamptz,
  email_message_id text,
  email_error text,
  first_download_at timestamptz,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists digital_orders_user_id_created_at_idx
  on public.digital_orders (user_id, created_at desc);

create unique index if not exists digital_orders_owned_unique
  on public.digital_orders (user_id, product_id)
  where status in ('confirmed', 'completed');

create unique index if not exists digital_orders_stripe_session_unique
  on public.digital_orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

drop trigger if exists digital_orders_set_updated_at on public.digital_orders;
create trigger digital_orders_set_updated_at
  before update on public.digital_orders
  for each row execute procedure public.set_updated_at();

alter table public.digital_orders enable row level security;

drop policy if exists "digital_orders_select_own" on public.digital_orders;
create policy "digital_orders_select_own"
  on public.digital_orders for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "digital_orders_update_own_cancel" on public.digital_orders;
create policy "digital_orders_update_own_cancel"
  on public.digital_orders for update
  to authenticated
  using (
    auth.uid() = user_id
    and status in ('pending', 'pending_payment')
  )
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );

create table if not exists public.digital_download_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.digital_orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null check (product_id in ('trattato', 'velo', 'taccuino', 'alchemici')),
  asset text not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists digital_download_events_order_id_created_at_idx
  on public.digital_download_events (order_id, created_at desc);

create index if not exists digital_download_events_user_id_created_at_idx
  on public.digital_download_events (user_id, created_at desc);

alter table public.digital_download_events enable row level security;

drop policy if exists "digital_download_events_select_own" on public.digital_download_events;
create policy "digital_download_events_select_own"
  on public.digital_download_events for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- Copia eventuale storico da purchases verso bookings
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
