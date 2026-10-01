import type { TariffaId } from "../data/catalogo";

export type BookingMode = "studio" | "remote";

export type Booking = {
  id: string;
  createdAt: string;
  type: TariffaId;
  minutes: 30 | 60;
  price: 40 | 70;
  mode: BookingMode;
  dateIso: string;
  slot: string;
  name: string;
  phone: string;
  birth?: string;
  query?: string;
  pdf: boolean;
};

const AUTH_KEY = "tarot-italia-auth";
const BOOKINGS_KEY = "tarot-italia-bookings";

export const DEMO_ACCOUNT = {
  email: "membro@tarotitalia.it",
  password: "santuario",
  name: "Lorenzo",
  since: "2024",
};

export type Session = {
  email: string;
  name: string;
};

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
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

export function readBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

export function writeBookings(bookings: Booking[]) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
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
