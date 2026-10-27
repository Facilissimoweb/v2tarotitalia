-- Traccia la risposta di acquisto Stripe sulla prenotazione.

alter table public.bookings
  add column if not exists paid_at timestamptz;

alter table public.bookings
  add column if not exists stripe_amount_total integer;

alter table public.bookings
  add column if not exists updated_at timestamptz not null default now();

create index if not exists bookings_paid_at_idx
  on public.bookings (user_id, paid_at desc);
