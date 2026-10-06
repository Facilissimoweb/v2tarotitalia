-- Tarot Italia — recesso del titolare sulla propria prenotazione
-- Eseguire nell'editor SQL del progetto Supabase già esistente.
-- Consente all'utente autenticato di impostare status = cancelled
-- su bookings/purchases legati al proprio auth.uid(), finché la prestazione non è completed.

drop policy if exists "bookings_update_own_cancel" on public.bookings;
create policy "bookings_update_own_cancel"
  on public.bookings for update
  to authenticated
  using (
    auth.uid() = user_id
    and status in ('pending', 'pending_whatsapp', 'confirmed')
  )
  with check (
    auth.uid() = user_id
    and status = 'cancelled'
  );

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
