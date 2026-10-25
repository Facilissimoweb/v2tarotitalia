-- =============================================================================
-- Tarot Italia — Welcome email automation (pg_net → Edge Function)
-- Fires AFTER INSERT on public.profiles (created by handle_new_user on signup).
-- Must match Edge secret: WELCOME_EMAIL_WEBHOOK_SECRET=tarot_italia_segreto_2026
-- =============================================================================

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------------------
-- Trigger function: async POST to send-welcome-email
-- ---------------------------------------------------------------------------
create or replace function public.notify_welcome_email()
returns trigger
language plpgsql
security definer
set search_path = public, net, extensions
as $$
declare
  edge_url constant text :=
    'https://zaaunvkyhxezhvjmmafx.supabase.co/functions/v1/send-welcome-email';
  webhook_secret constant text := 'tarot_italia_segreto_2026';
  request_id bigint;
begin
  -- Skip rows without a usable recipient (should not happen after handle_new_user).
  if new.email is null or btrim(new.email) = '' then
    return new;
  end if;

  select
    net.http_post(
      url := edge_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || webhook_secret
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', to_jsonb(new)
      ),
      timeout_milliseconds := 5000
    )
  into request_id;

  return new;
exception
  when others then
    -- Never block signup if the HTTP queue fails; inspect net._http_response later.
    raise warning 'notify_welcome_email failed for profile %: %', new.id, sqlerrm;
    return new;
end;
$$;

comment on function public.notify_welcome_email() is
  'Queues an async welcome email via pg_net → send-welcome-email Edge Function on profile insert.';

revoke all on function public.notify_welcome_email() from public;
grant execute on function public.notify_welcome_email() to postgres, service_role;

-- ---------------------------------------------------------------------------
-- Trigger: one welcome email per new profile row
-- ---------------------------------------------------------------------------
drop trigger if exists on_profile_created_welcome_email on public.profiles;

create trigger on_profile_created_welcome_email
  after insert on public.profiles
  for each row
  execute function public.notify_welcome_email();

comment on trigger on_profile_created_welcome_email on public.profiles is
  'Sends Tarot Italia welcome email after a new profile is inserted.';
