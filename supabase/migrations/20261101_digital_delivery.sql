-- Consegna digitale: ricevuta email Zoho + log download (tutela chargeback).

alter table public.digital_orders
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_message_id text,
  add column if not exists email_error text,
  add column if not exists first_download_at timestamptz,
  add column if not exists download_count integer not null default 0;

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
