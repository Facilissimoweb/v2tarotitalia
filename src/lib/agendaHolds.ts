import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { OccupiedSlot } from "./occupiedSlots";

export type AgendaSource = "offline" | "block";

export type AgendaHold = {
  id: string;
  dateIso: string;
  slot: string;
  minutes: 30 | 60;
  name: string;
  note: string;
  source: AgendaSource;
};

export async function fetchAgendaHolds(fromIso: string, toIso: string): Promise<AgendaHold[]> {
  const sb = getSupabaseClient();
  if (!sb || !isSupabaseConfigured()) return [];
  const { data, error } = await sb
    .from("agenda_holds")
    .select("id, session_date, slot, minutes, guest_name, note, source")
    .gte("session_date", fromIso)
    .lte("session_date", toIso)
    .order("session_date", { ascending: true })
    .order("slot", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id: String(row.id),
    dateIso: String(row.session_date),
    slot: String(row.slot),
    minutes: row.minutes === 60 ? 60 : 30,
    name: String(row.guest_name ?? "").trim(),
    note: String(row.note ?? "").trim(),
    source: row.source === "block" ? "block" : "offline",
  }));
}

export async function insertAgendaHold(input: {
  dateIso: string;
  slot: string;
  minutes: 30 | 60;
  name: string;
  note: string;
  source: AgendaSource;
}): Promise<{ ok: true } | { error: "taken" | "servizio" }> {
  const sb = getSupabaseClient();
  if (!sb) return { error: "servizio" };
  const { error } = await sb.from("agenda_holds").insert({
    session_date: input.dateIso,
    slot: input.slot,
    minutes: input.minutes,
    guest_name: input.name.trim() || null,
    note: input.note.trim() || null,
    source: input.source,
  });
  if (!error) return { ok: true };
  if (error.code === "23505") return { error: "taken" };
  return { error: "servizio" };
}

export async function deleteAgendaHold(id: string): Promise<{ ok: true } | { error: "servizio" }> {
  const sb = getSupabaseClient();
  if (!sb) return { error: "servizio" };
  const { error } = await sb.from("agenda_holds").delete().eq("id", id);
  if (error) return { error: "servizio" };
  return { ok: true };
}

export function subscribeAgenda(onChange: () => void) {
  const sb = getSupabaseClient();
  if (!sb) return () => {};
  const channel = sb
    .channel("agenda-holds")
    .on("postgres_changes", { event: "*", schema: "public", table: "agenda_holds" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, onChange)
    .subscribe();
  return () => {
    void sb.removeChannel(channel);
  };
}

export function holdCovers(hold: AgendaHold, dateIso: string, slot: string) {
  if (hold.dateIso !== dateIso) return false;
  if (hold.slot === slot) return true;
  if (hold.minutes < 60) return false;
  const next = String(Number(hold.slot.slice(0, 2)) + 1).padStart(2, "0") + hold.slot.slice(2);
  return next === slot;
}

export function occupiedByHold(holds: AgendaHold[], dateIso: string, slot: string) {
  return holds.find((hold) => holdCovers(hold, dateIso, slot)) ?? null;
}

export function isSiteBooking(occupied: OccupiedSlot[], holds: AgendaHold[], dateIso: string, slot: string) {
  const taken = occupied.some((item) => item.dateIso === dateIso && item.slot === slot);
  return taken && !occupiedByHold(holds, dateIso, slot);
}
