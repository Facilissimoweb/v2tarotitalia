import type { BookingMode } from "./storage";

/** Dalle 19:00 i consulti sono solo online. */
export const EVENING_SLOT_HOUR = 19;

export function slotHour(slot: string) {
  return Number(String(slot).slice(0, 2));
}

export function isEveningSlot(slot: string) {
  const hour = slotHour(slot);
  return Number.isFinite(hour) && hour >= EVENING_SLOT_HOUR;
}

export function resolveBookingMode(mode: BookingMode, slot: string): BookingMode {
  return isEveningSlot(slot) ? "remote" : mode;
}

export function sessionModeLabel(mode: BookingMode, slot: string, city = "Macerata") {
  const remote = resolveBookingMode(mode, slot) === "remote";
  const base = remote ? "Chiamata vocale WhatsApp" : `In studio a ${city}`;
  return isEveningSlot(slot) ? `${base} · dalle 19:00 solo online` : base;
}
