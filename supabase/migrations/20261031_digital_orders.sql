-- Acquisti digitali (dispense, masterclass, materiali): sblocco per titolo, non per consulto.

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
