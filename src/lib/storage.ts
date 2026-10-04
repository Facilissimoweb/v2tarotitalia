import type { TariffaId } from "../data/catalogo";
import { SITE_LOCALE } from "./locale";

export type BookingMode = "studio" | "remote";

export type PurchaseStatus = "pending" | "pending_whatsapp" | "confirmed" | "completed" | "cancelled";

export type Consents = {
  privacy: boolean;
  adult: boolean;
  refund: boolean;
};

export type Purchase = {
  id: string;
  createdAt: string;
  type: TariffaId;
  minutes: 30 | 60;
  consultPrice: 40 | 60 | 70;
  pdf: boolean;
  pdfPrice: 0 | 10;
  total: number;
  mode: BookingMode;
  dateIso: string;
  slot: string;
  name: string;
  phone: string;
  birth?: string;
  query?: string;
  status: PurchaseStatus;
  consents: Consents;
};

/** Bozza di prenotazione prima di autenticazione e salvataggio. */
export type PurchaseDraft = Omit<Purchase, "id" | "createdAt" | "status" | "consents">;

const AUTH_KEY = "tarot-italia-auth";
const BOOKINGS_KEY = "tarot-italia-bookings";

export const DEMO_ACCOUNT = {
  email: "membro@tarotitalia.it",
  password: "santuario",
  name: "Lorenzo",
  since: "2024",
};

export type Session = {
  id: string;
  email: string;
  name: string;
  consents: Consents;
};

export function emptyConsents(): Consents {
  return { privacy: false, adult: false, refund: false };
}

export function hasRequiredConsents(consents: Consents | undefined) {
  return Boolean(consents?.privacy && consents?.adult && consents?.refund);
}

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session & { consents?: Consents };
    return {
      id: parsed.id || parsed.email,
      email: parsed.email,
      name: parsed.name,
      consents: parsed.consents ?? emptyConsents(),
    };
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

function asPurchase(raw: Record<string, unknown>): Purchase {
  const pdf = Boolean(raw.pdf);
  const consultPrice = Number(raw.consultPrice ?? raw.price) as 40 | 60 | 70;
  const pdfPrice = (raw.pdfPrice != null ? Number(raw.pdfPrice) : 0) as 0 | 10;
  return {
    id: String(raw.id),
    createdAt: String(raw.createdAt),
    type: (raw.type as TariffaId) ?? "focus",
    minutes: (Number(raw.minutes) as 30 | 60) || 30,
    consultPrice,
    pdf,
    pdfPrice,
    total: Number(raw.total ?? consultPrice + pdfPrice),
    mode: (raw.mode as BookingMode) ?? "remote",
    dateIso: String(raw.dateIso ?? ""),
    slot: String(raw.slot ?? ""),
    name: String(raw.name ?? ""),
    phone: String(raw.phone ?? ""),
    birth: raw.birth ? String(raw.birth) : undefined,
    query: raw.query ? String(raw.query) : undefined,
    status: (raw.status as PurchaseStatus) ?? "pending_whatsapp",
    consents: (raw.consents as Consents) ?? emptyConsents(),
  };
}

export function readPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Record<string, unknown>[];
    return list.map(asPurchase);
  } catch {
    return [];
  }
}

export function writePurchases(purchases: Purchase[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(purchases));
}

export function localIso(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_LOCALE.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((part) => part.type === "year")?.value;
  const m = parts.find((part) => part.type === "month")?.value;
  const d = parts.find((part) => part.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

export const HOUR_SLOTS = Array.from({ length: 14 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);

export function slotsForDate(dateIso: string) {
  const today = localIso();
  if (dateIso > today) return HOUR_SLOTS;
  if (dateIso < today) return [];
  const now = new Date();
  const nextHour = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
  return HOUR_SLOTS.filter((slot) => Number(slot.slice(0, 2)) >= nextHour);
}

export function nextBookableDate(fromIso = localIso()) {
  const start = new Date(`${fromIso}T12:00:00`);
  for (let i = 0; i < 60; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = localIso(d);
    if (slotsForDate(iso).length > 0) return iso;
  }
  return fromIso;
}
