-- Prenotazioni Stripe: slot univoco, pending_payment, occupati pubblici.

do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.bookings'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if cname is not null then
    execute format('alter table public.bookings drop constraint %I', cname);
  end if;
end $$;

alter table public.bookings
  add constraint bookings_status_check
  check (status in (
    'pending',
    'pending_payment',
    'pending_whatsapp',
    'confirmed',
    'completed',
    'cancelled'
  ));

alter table public.bookings
  add column if not exists stripe_checkout_session_id text;

alter table public.bookings
  add column if not exists stripe_payment_intent_id text;

with ranked as (
  select id, row_number() over (
    partition by session_date, slot
    order by created_at desc
  ) as rn
  from public.bookings
  where status <> 'cancelled'
)
update public.bookings b
set status = 'cancelled'
from ranked r
where b.id = r.id and r.rn > 1;

create unique index if not exists bookings_active_slot_unique
  on public.bookings (session_date, slot)
  where status <> 'cancelled';

create unique index if not exists bookings_stripe_session_unique
  on public.bookings (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

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
