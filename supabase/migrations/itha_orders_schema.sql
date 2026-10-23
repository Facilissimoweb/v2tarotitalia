-- =============================================================================
-- Migrazione: itha_orders + crediti PayPal (RPC, trigger, RLS, grants)
-- =============================================================================
-- Prerequisiti: supabase/schema.sql (public.profiles, public.is_admin).
-- Usato da: api/paypal-create-order, api/paypal-capture-order, api/paypal-webhook,
--           src/lib/itha/serverPaypal.ts, serverPaypalWebhook.ts, client.ts (crediti).
--
-- Flusso status: created → completed (capture) → refunded (webhook rimborso)
-- Piani: singola | pacchetto3 | pass5
-- =============================================================================

-- Crediti sul profilo (saldo Itha)
alter table public.profiles
  add column if not exists itha_credits integer not null default 0;

-- ---------------------------------------------------------------------------
-- Tabella ordini PayPal
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
-- Protezione: itha_credits modificabile solo via RPC (flag) o service_role
-- ---------------------------------------------------------------------------
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
-- RPC crediti
-- ---------------------------------------------------------------------------

-- Consumo 1 credito (utente autenticato, es. /api/itha-decode)
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

-- Accredito dopo capture / webhook COMPLETED (solo service_role)
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

-- Storno su rimborso PayPal (solo service_role)
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
-- RLS + policy itha_orders
-- (insert/update operativi delle API PayPal usano service_role → bypass RLS)
-- ---------------------------------------------------------------------------
alter table public.itha_orders enable row level security;

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
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert on public.itha_orders to authenticated;

revoke all on function public.consume_itha_credit() from public;
revoke all on function public.add_itha_credits(uuid, integer) from public;
revoke all on function public.subtract_itha_credits(uuid, integer) from public;

grant execute on function public.consume_itha_credit() to authenticated;
grant execute on function public.add_itha_credits(uuid, integer) to service_role;
grant execute on function public.subtract_itha_credits(uuid, integer) to service_role;
