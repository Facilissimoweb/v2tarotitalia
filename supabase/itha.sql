-- Itha · Crocicchio di Ecate — crediti, letture, ordini PayPal
-- Eseguire dopo supabase/schema.sql

alter table public.profiles add column if not exists itha_credits integer not null default 0;

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
  where id = auth.uid() and itha_credits > 0
  returning itha_credits into remaining;
  if remaining is null then
    raise exception 'NO_CREDITS';
  end if;
  return remaining;
end;
$$;

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

alter table public.itha_readings enable row level security;
alter table public.itha_orders enable row level security;

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

grant execute on function public.consume_itha_credit() to authenticated;
grant execute on function public.add_itha_credits(uuid, integer) to service_role;
grant select, insert on public.itha_readings to authenticated;
grant select, insert on public.itha_orders to authenticated;
