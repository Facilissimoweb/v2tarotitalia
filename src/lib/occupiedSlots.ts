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
