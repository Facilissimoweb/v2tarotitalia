import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import {
  clearSession,
  DEMO_ACCOUNT,
  emptyConsents,
  hasRequiredConsents,
  readPurchases,
  readSession,
  writePurchases,
  writeSession,
  type Consents,
  type Purchase,
  type PurchaseDraft,
  type Session,
} from "../lib/storage";
import { draftToPurchase, purchaseToInsert, rowToPurchase, type PurchaseRow } from "../lib/purchases";

const { auth } = siteContent;

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  purchases: Purchase[];
  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  login: (email: string, password: string, consents: Consents) => Promise<string | null | "verify">;
  register: (
    email: string,
    password: string,
    consents: Consents,
    name?: string,
  ) => Promise<string | null | "verify">;
  requestMagicLink: (email: string, consents: Consents) => Promise<string | null | "verify">;
  logout: () => Promise<void>;
  addPurchase: (draft: PurchaseDraft, consents?: Consents) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null,
  consents: Consents,
): Session | null {
  if (!user?.email) return null;
  const metaName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  return {
    id: user.id,
    email: user.email,
    name: metaName || user.email.split("@")[0],
    consents,
  };
}

async function persistConsents(userId: string, email: string, name: string, consents: Consents) {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from("profiles").upsert({
    id: userId,
    email,
    display_name: name,
    consent_privacy: consents.privacy,
    consent_adult: consents.adult,
    consent_refund: consents.refund,
    consents_accepted_at: new Date().toISOString(),
  });
}

async function loadRemotePurchases(userId: string): Promise<Purchase[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  const bookings = await sb
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!bookings.error && bookings.data) {
    return (bookings.data as PurchaseRow[]).map(rowToPurchase);
  }
  const { data, error } = await sb
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as PurchaseRow[]).map(rowToPurchase);
}

async function persistBooking(userId: string | null, purchase: Purchase) {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const row = purchaseToInsert(userId, purchase);
  const bookings = await sb.from("bookings").insert(row);
  if (!bookings.error) return null;
  if (!userId) return bookings.error.message;
  const purchases = await sb.from("purchases").insert(row);
  return purchases.error?.message ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const applySession = useCallback((next: Session | null, list?: Purchase[]) => {
    setSession(next);
    if (next) writeSession(next);
    else clearSession();
    if (list) {
      setPurchases(list);
      writePurchases(list);
    }
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const boot = async () => {
      const sb = getSupabaseClient();
      if (!sb) {
        setSession(readSession());
        setPurchases(readPurchases());
        setReady(true);
        return;
      }
      const { data } = await sb.auth.getSession();
      const user = data.session?.user ?? null;
      const local = readSession();
      const mapped = mapUser(user, local?.consents ?? emptyConsents());
      setSession(mapped);
      if (mapped) {
        writeSession(mapped);
        setPurchases(await loadRemotePurchases(mapped.id));
      } else {
        setPurchases([]);
      }
      const { data: listener } = sb.auth.onAuthStateChange((_event, nextSession) => {
        const current = readSession();
        const mappedNext = mapUser(nextSession?.user ?? null, current?.consents ?? emptyConsents());
        setSession(mappedNext);
        if (mappedNext) {
          writeSession(mappedNext);
          void loadRemotePurchases(mappedNext.id).then(setPurchases);
        } else {
          clearSession();
          setPurchases([]);
        }
      });
      unsub = () => listener.subscription.unsubscribe();
      setReady(true);
    };
    void boot();
    return () => unsub?.();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      ready,
      purchases,
      authOpen,
      openAuth: () => setAuthOpen(true),
      closeAuth: () => setAuthOpen(false),
      login: async (email, password, consents) => {
        if (!hasRequiredConsents(consents)) return auth.errori.consensi;
        const e = email.trim().toLowerCase();
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb.auth.signInWithPassword({ email: e, password });
          if (error || !data.user) return error?.message || auth.errori.credenziali;
          const next = mapUser(data.user, consents);
          if (!next) return auth.errori.credenziali;
          await persistConsents(next.id, next.email, next.name, consents);
          const list = await loadRemotePurchases(next.id);
          applySession(next, list);
          return null;
        }
        const ok =
          (e === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) ||
          (e.includes("@") && password.length >= 6);
        if (!ok) return auth.errori.credenziali;
        const next: Session = {
          id: e,
          email: e,
          name: e === DEMO_ACCOUNT.email ? DEMO_ACCOUNT.name : e.split("@")[0],
          consents,
        };
        applySession(next, readPurchases());
        return null;
      },
      register: async (email, password, consents, name) => {
        if (!hasRequiredConsents(consents)) return auth.errori.consensi;
        const e = email.trim().toLowerCase();
        const display = name?.trim() || e.split("@")[0];
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb.auth.signUp({
            email: e,
            password,
            options: { data: { display_name: display } },
          });
          if (error) return error.message;
          if (!data.session || !data.user) return "verify";
          const next = mapUser(data.user, consents);
          if (!next) return auth.errori.credenziali;
          await persistConsents(next.id, next.email, display, consents);
          applySession({ ...next, name: display }, []);
          return null;
        }
        if (!e.includes("@") || password.length < 6) return auth.errori.credenziali;
        const next: Session = { id: e, email: e, name: display, consents };
        applySession(next, readPurchases());
        return null;
      },
      requestMagicLink: async (email, consents) => {
        if (!hasRequiredConsents(consents)) return auth.errori.consensi;
        const e = email.trim().toLowerCase();
        const sb = getSupabaseClient();
        if (!sb) return auth.errori.servizio;
        const { error } = await sb.auth.signInWithOtp({
          email: e,
          options: { shouldCreateUser: true },
        });
        if (error) return error.message;
        return "verify";
      },
      logout: async () => {
        const sb = getSupabaseClient();
        if (sb) await sb.auth.signOut();
        applySession(null, []);
      },
      addPurchase: async (draft, consents) => {
        const current = session;
        const used = consents ?? current?.consents ?? emptyConsents();
        if (!hasRequiredConsents(used)) return auth.errori.consensi;
        const purchase = draftToPurchase(draft, used);
        if (isSupabaseConfigured()) {
          const err = await persistBooking(current?.id ?? null, purchase);
          if (err) return err;
          if (current) {
            const list = await loadRemotePurchases(current.id);
            setPurchases(list);
            writePurchases(list);
          }
          return null;
        }
        if (current) {
          const next = [purchase, ...readPurchases()];
          writePurchases(next);
          setPurchases(next);
        }
        return null;
      },
    }),
    [session, ready, purchases, authOpen, applySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve vivere dentro AuthProvider");
  return ctx;
}
