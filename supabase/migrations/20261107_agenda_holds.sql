-- Fasce occupate dallo studio (chiamate, Pagine Gialle, blocchi).
-- Entra in occupied_slots: il calendario pubblico le vede come non disponibili.

create or replace function public.is_studio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'mariateresarogani@gmail.com';
$$;

revoke all on function public.is_studio_admin() from public;
grant execute on function public.is_studio_admin() to authenticated;

create or replace function public.agenda_hours(slot text, minutes int)
returns setof text
language sql
immutable
as $$
  select slot
  union
  select to_char(slot::time + interval '1 hour', 'HH24:MI')
  where coalesce(minutes, 30) >= 60;
$$;

create table if not exists public.agenda_holds (
  id uuid primary key default gen_random_uuid(),
  session_date date not null,
  slot text not null check (slot ~ '^\d{2}:\d{2}$'),
  minutes int not null default 30 check (minutes in (30, 60)),
  guest_name text,
  note text,
  source text not null default 'offline' check (source in ('offline', 'block')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create unique index if not exists agenda_holds_slot_unique
  on public.agenda_holds (session_date, slot);

alter table public.agenda_holds enable row level security;

revoke all on table public.agenda_holds from anon, authenticated;
grant select, insert, delete on table public.agenda_holds to authenticated;

drop policy if exists "agenda_holds_admin_select" on public.agenda_holds;
create policy "agenda_holds_admin_select"
  on public.agenda_holds for select
  to authenticated
  using (public.is_studio_admin());

drop policy if exists "agenda_holds_admin_insert" on public.agenda_holds;
create policy "agenda_holds_admin_insert"
  on public.agenda_holds for insert
  to authenticated
  with check (public.is_studio_admin());

drop policy if exists "agenda_holds_admin_delete" on public.agenda_holds;
create policy "agenda_holds_admin_delete"
  on public.agenda_holds for delete
  to authenticated
  using (public.is_studio_admin());

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
    and b.session_date between from_date and to_date
  union
  select h.session_date, hr as slot
  from public.agenda_holds h
  cross join lateral public.agenda_hours(h.slot, h.minutes) hr
  where h.session_date between from_date and to_date;
$$;

revoke all on function public.occupied_slots(date, date) from public;
grant execute on function public.occupied_slots(date, date) to anon, authenticated;

create or replace function public.agenda_holds_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.occupied_slots(new.session_date, new.session_date) o
    where o.slot in (select public.agenda_hours(new.slot, new.minutes))
  ) then
    raise exception 'slot occupato' using errcode = '23505';
  end if;
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists agenda_holds_guard on public.agenda_holds;
create trigger agenda_holds_guard
  before insert on public.agenda_holds
  for each row
  execute function public.agenda_holds_guard();

create or replace function public.bookings_hold_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.agenda_holds h
    where h.session_date = new.session_date
      and new.slot in (select public.agenda_hours(h.slot, h.minutes))
  ) then
    raise exception 'slot occupato' using errcode = '23505';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_hold_guard on public.bookings;
create trigger bookings_hold_guard
  before insert on public.bookings
  for each row
  execute function public.bookings_hold_guard();

do $$
begin
  alter publication supabase_realtime add table public.agenda_holds;
exception
  when duplicate_object then null;
end $$;
