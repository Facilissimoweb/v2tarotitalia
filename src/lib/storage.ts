import type { TariffaId } from "../data/catalogo";

export type BookingMode = "studio" | "remote";

export type PurchaseStatus = "pending" | "confirmed" | "completed" | "cancelled";

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
  consultPrice: 40 | 70;
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
  const consultPrice = Number(raw.consultPrice ?? raw.price) as 40 | 70;
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
    status: (raw.status as PurchaseStatus) ?? "confirmed",
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

export function upcomingWeekdays(count = 8): { iso: string; label: string; day: string; num: string }[] {
  const out: { iso: string; label: string; day: string; num: string }[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  const weekday = new Intl.DateTimeFormat("it-IT", { weekday: "short" });
  const long = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  for (let i = 1; out.length < count && i < 28; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay();
    if (dow === 0) continue;
    const iso = d.toISOString().slice(0, 10);
    out.push({
      iso,
      label: long.format(d),
      day: weekday.format(d).replace(".", ""),
      num: String(d.getDate()),
    });
  }
  return out;
}

export const TIME_SLOTS = ["10:30", "12:00", "15:00", "17:30", "19:00"];
