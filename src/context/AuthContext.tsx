import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  clearSession,
  DEMO_ACCOUNT,
  readBookings,
  readSession,
  writeBookings,
  writeSession,
  type Booking,
  type Session,
} from "../lib/storage";

type AuthContextValue = {
  session: Session | null;
  bookings: Booking[];
  login: (email: string, password: string) => string | null;
  logout: () => void;
  addBooking: (booking: Booking) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() =>
    typeof window === "undefined" ? null : readSession(),
  );
  const [bookings, setBookings] = useState<Booking[]>(() =>
    typeof window === "undefined" ? [] : readBookings(),
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      bookings,
      login: (email, password) => {
        const e = email.trim().toLowerCase();
        const ok =
          (e === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) ||
          (e.includes("@") && password.length >= 6);
        if (!ok) return "Email o password non validi.";
        const next: Session = {
          email: e,
          name: e === DEMO_ACCOUNT.email ? DEMO_ACCOUNT.name : e.split("@")[0],
        };
        writeSession(next);
        setSession(next);
        return null;
      },
      logout: () => {
        clearSession();
        setSession(null);
      },
      addBooking: (booking) => {
        const next = [booking, ...readBookings()];
        writeBookings(next);
        setBookings(next);
      },
    }),
    [session, bookings],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve vivere dentro AuthProvider");
  return ctx;
}
