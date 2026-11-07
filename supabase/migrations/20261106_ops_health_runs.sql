-- Storico sonde del Guardiano. Solo service role: nessuna policy client.

create table if not exists public.ops_health_runs (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  overall text not null check (overall in ('ok', 'degraded', 'down')),
  probes jsonb not null default '[]'::jsonb,
  alerted boolean not null default false,
  source text not null default 'sentinel'
);

create index if not exists ops_health_runs_checked_at_idx
  on public.ops_health_runs (checked_at desc);

alter table public.ops_health_runs enable row level security;

revoke all on table public.ops_health_runs from anon, authenticated;
