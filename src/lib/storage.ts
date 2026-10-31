import type { TariffaId } from "../data/catalogo";
import { SITE_LOCALE } from "./locale";

export type BookingMode = "studio" | "remote";

export type PurchaseStatus =
  | "pending"
  | "pending_payment"
  | "pending_whatsapp"
  | "confirmed"
  | "completed"
  | "cancelled";

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
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  stripeAmountTotal?: number;
  paidAt?: string;
};

/** Bozza di prenotazione prima di autenticazione e salvataggio. */
export type PurchaseDraft = Omit<Purchase, "id" | "createdAt" | "status" | "consents">;

const AUTH_KEY = "tarot-italia-auth";
const BOOKINGS_KEY = "tarot-italia-bookings";

export const DEMO_ACCOUNT = {
  email: "demo@tarotitalia.com",
  password: "santuario",
  name: "Lorenzo",
  since: "2024",
};

export type AuthProviderKind = "email" | "google";

export type Session = {
  id: string;
  email: string;
  name: string;
  consents: Consents;
  provider: AuthProviderKind;
};

export function emptyConsents(): Consents {
  return { privacy: false, adult: false, refund: false };
}

export function hasRequiredConsents(consents: Consents | undefined) {
  return Boolean(consents?.privacy && consents?.adult && consents?.refund);
}

export function canRequestWithdrawal(status: PurchaseStatus) {
  return status === "pending" || status === "pending_whatsapp" || status === "confirmed";
}

export function canRequestRefund(purchase: Purchase) {
  return purchase.status === "confirmed" && Boolean(purchase.stripePaymentIntentId);
}

/** Acquisto già pagato: unico contenuto dello Storico. */
export function isPaidPurchase(purchase: Purchase) {
  if (purchase.status === "cancelled") return false;
  return purchase.status === "confirmed" || purchase.status === "completed" || Boolean(purchase.paidAt);
}

/** Selezione ancora da pagare: vive nel Carrello, non nello Storico. */
export function isCartPurchase(purchase: Purchase) {
  return purchase.status === "pending_payment" || purchase.status === "pending" || purchase.status === "pending_whatsapp";
}

export function samePurchaseSnapshot(a: Purchase[], b: Purchase[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      item.id === other.id &&
      item.status === other.status &&
      item.paidAt === other.paidAt &&
      item.stripePaymentIntentId === other.stripePaymentIntentId &&
      item.stripeAmountTotal === other.stripeAmountTotal
    );
  });
}

export function cartItemCount(purchases: Purchase[], extra = 0) {
  const pending = purchases.filter(isCartPurchase);
  const draft = readBookingDraft();
  let n = pending.length;
  if (draft && !draftMatchesSettled(purchases) && !pending.some((item) => sameBookingSlot(item, draft))) {
    n += 1;
  }
  return n + extra;
}

export function isSettledPurchase(purchase: Purchase) {
  return isPaidPurchase(purchase) || purchase.status === "pending_payment";
}

export function sameBookingSlot(a: { dateIso: string; slot: string }, b: { dateIso: string; slot: string }) {
  return a.dateIso.slice(0, 10) === b.dateIso.slice(0, 10) && a.slot.trim() === b.slot.trim();
}

export function draftMatchesSettled(purchases: Purchase[]) {
  const draft = readBookingDraft();
  if (!draft) return false;
  return purchases.some((item) => isSettledPurchase(item) && sameBookingSlot(item, draft));
}

/** Dopo un pagamento la bozza in sessionStorage non deve più aprire il form. */
export function discardSettledBookingDraft(purchases: Purchase[] = []) {
  if (typeof window !== "undefined") {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "ok" || checkout === "cancel") {
      clearBookingDraft();
      return;
    }
  }
  if (draftMatchesSettled(purchases)) clearBookingDraft();
}

const PENDING_CONSENTS_KEY = "tarot-italia-pending-consents";
const BOOKING_DRAFT_KEY = "tarot-italia-booking-draft";

export type BookingDraftStored = PurchaseDraft & { consents: Consents };

export function readPendingConsents(): Consents | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CONSENTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consents;
    if (!parsed || typeof parsed.privacy !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePendingConsents(consents: Consents) {
  sessionStorage.setItem(PENDING_CONSENTS_KEY, JSON.stringify(consents));
}

export function clearPendingConsents() {
  sessionStorage.removeItem(PENDING_CONSENTS_KEY);
}

export function readBookingDraft(): BookingDraftStored | null {
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraftStored;
  } catch {
    return null;
  }
}

export function writeBookingDraft(draft: BookingDraftStored) {
  sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearBookingDraft() {
  sessionStorage.removeItem(BOOKING_DRAFT_KEY);
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
      provider: parsed.provider === "google" ? "google" : "email",
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
    stripePaymentIntentId: raw.stripePaymentIntentId ? String(raw.stripePaymentIntentId) : undefined,
    stripeCheckoutSessionId: raw.stripeCheckoutSessionId ? String(raw.stripeCheckoutSessionId) : undefined,
    stripeAmountTotal: raw.stripeAmountTotal != null ? Number(raw.stripeAmountTotal) : undefined,
    paidAt: raw.paidAt ? String(raw.paidAt) : undefined,
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
