/** Dalle 19:00 i consulti sono solo online. */
export const EVENING_SLOT_HOUR = 19;

export function isEveningSlot(slot: string) {
  const hour = Number(String(slot).slice(0, 2));
  return Number.isFinite(hour) && hour >= EVENING_SLOT_HOUR;
}

export function resolveBookingMode(mode: string, slot: string) {
  return isEveningSlot(slot) ? "remote" : mode;
}

export function sessionModeLabel(mode: string, slot: string) {
  const remote = resolveBookingMode(mode, slot) === "remote";
  const base = remote ? "Chiamata vocale WhatsApp" : "In studio a Macerata";
  return isEveningSlot(slot) ? `${base} · dalle 19:00 solo online` : base;
}
