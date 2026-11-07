import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

export type OccupiedSlot = { dateIso: string; slot: string };

export function occupiedKey(dateIso: string, slot: string) {
  return `${dateIso}|${slot}`;
}

export async function fetchOccupiedSlots(fromIso: string, toIso: string): Promise<OccupiedSlot[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabaseClient();
  if (!sb) return [];
  const { data, error } = await sb.rpc("occupied_slots", { from_date: fromIso, to_date: toIso });
  if (error || !data) return [];
  return (data as { session_date: string; slot: string }[]).map((row) => ({
    dateIso: row.session_date,
    slot: row.slot,
  }));
}

export function isOccupied(list: OccupiedSlot[], dateIso: string, slot: string) {
  return list.some((item) => item.dateIso === dateIso && item.slot === slot);
}

export function subscribeOccupiedSlots(onChange: () => void) {
  const sb = getSupabaseClient();
  if (!sb) return () => {};
  const channel = sb
    .channel("public-occupied-slots")
    .on("postgres_changes", { event: "*", schema: "public", table: "agenda_holds" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, onChange)
    .subscribe();
  const onFocus = () => onChange();
  window.addEventListener("focus", onFocus);
  const poll = window.setInterval(onChange, 12_000);
  return () => {
    window.clearInterval(poll);
    window.removeEventListener("focus", onFocus);
    void sb.removeChannel(channel);
  };
}
