import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import {
  canRequestWithdrawal,
  clearPendingConsents,
  clearSession,
  DEMO_ACCOUNT,
  emptyConsents,
  hasRequiredConsents,
  readPendingConsents,
  readPurchases,
  readSession,
  writePendingConsents,
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
    redirectTo?: string,
  ) => Promise<string | null | "verify">;
  requestMagicLink: (
    email: string,
    consents: Consents,
    redirectTo?: string,
  ) => Promise<string | null | "verify">;
  loginWithGoogle: (consents: Consents, redirectTo?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  addPurchase: (draft: PurchaseDraft, consents?: Consents) => Promise<string | null>;
  requestWithdrawal: (id: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null,
  consents: Consents,
): Session | null {
  if (!user?.email) return null;
  const metaName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : "";
  const googleName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const name = metaName || googleName || user.email.split("@")[0];
  return {
    id: user.id,
    email: user.email,
    name,
    consents,
  };
}

function authRedirectUrl(path?: string) {
  const origin = window.location.origin;
  if (path?.startsWith("http")) return path;
  if (path?.startsWith("/")) return `${origin}${path}`;
  const here = `${window.location.pathname}${window.location.search}`;
  return `${origin}${here.startsWith("/") ? here : "/riservata"}`;
}

function takePendingConsents(): Consents | null {
  const pending = readPendingConsents();
  if (pending) clearPendingConsents();
  return pending;
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

async function persistBooking(userId: string, purchase: Purchase) {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const row = purchaseToInsert(userId, purchase);
  const bookings = await sb.from("bookings").insert(row);
  if (!bookings.error) return null;
  const purchases = await sb.from("purchases").insert(row);
  return purchases.error?.message ?? bookings.error.message;
}

async function persistCancellation(userId: string, id: string) {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const payload = { status: "cancelled" as const };
  const bookings = await sb.from("bookings").update(payload).eq("id", id).eq("user_id", userId).select("id");
  if (!bookings.error && bookings.data && bookings.data.length > 0) return null;
  const purchases = await sb.from("purchases").update(payload).eq("id", id).eq("user_id", userId).select("id");
  if (!purchases.error && purchases.data && purchases.data.length > 0) return null;
  return purchases.error?.message ?? bookings.error?.message ?? siteContent.auth.errori.servizio;
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
      const pending = takePendingConsents();
      const consents = pending ?? local?.consents ?? emptyConsents();
      const mapped = mapUser(user, consents);
      setSession(mapped);
      if (mapped) {
        writeSession(mapped);
        if (pending && hasRequiredConsents(pending)) {
          void persistConsents(mapped.id, mapped.email, mapped.name, pending);
        }
        setPurchases(await loadRemotePurchases(mapped.id));
      } else {
        setPurchases([]);
      }
      const { data: listener } = sb.auth.onAuthStateChange((_event, nextSession) => {
        const current = readSession();
        const incoming = takePendingConsents();
        const nextConsents = incoming ?? current?.consents ?? emptyConsents();
        const mappedNext = mapUser(nextSession?.user ?? null, nextConsents);
        setSession(mappedNext);
        if (mappedNext) {
          writeSession(mappedNext);
          if (incoming && hasRequiredConsents(incoming)) {
            void persistConsents(mappedNext.id, mappedNext.email, mappedNext.name, incoming);
          }
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
      register: async (email, password, consents, name, redirectTo) => {
        if (!hasRequiredConsents(consents)) return auth.errori.consensi;
        const e = email.trim().toLowerCase();
        const display = name?.trim() || e.split("@")[0];
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb.auth.signUp({
            email: e,
            password,
            options: { data: { display_name: display }, emailRedirectTo: authRedirectUrl(redirectTo) },
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
      requestMagicLink: async (email, consents, redirectTo) => {
        if (!hasRequiredConsents(consents)) return auth.errori.consensi;
        const e = email.trim().toLowerCase();
        const sb = getSupabaseClient();
        if (!sb) return auth.errori.servizio;
        writePendingConsents(consents);
        const { error } = await sb.auth.signInWithOtp({
          email: e,
          options: { shouldCreateUser: true, emailRedirectTo: authRedirectUrl(redirectTo) },
        });
        if (error) {
          clearPendingConsents();
          return error.message;
        }
        return "verify";
      },
      loginWithGoogle: async (consents, redirectTo) => {
        if (!hasRequiredConsents(consents)) return auth.errori.consensi;
        const sb = getSupabaseClient();
        if (!sb) return auth.errori.servizio;
        writePendingConsents(consents);
        const { error } = await sb.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: authRedirectUrl(redirectTo) },
        });
        if (error) {
          clearPendingConsents();
          return error.message;
        }
        return null;
      },
      logout: async () => {
        const sb = getSupabaseClient();
        if (sb) await sb.auth.signOut();
        applySession(null, []);
      },
      addPurchase: async (draft, consents) => {
        const current = session;
        if (!current) return auth.errori.accesso;
        const used = consents ?? current.consents ?? emptyConsents();
        if (!hasRequiredConsents(used)) return auth.errori.consensi;
        const purchase = draftToPurchase(draft, used);
        if (isSupabaseConfigured()) {
          const err = await persistBooking(current.id, purchase);
          if (err) return err;
          const list = await loadRemotePurchases(current.id);
          setPurchases(list);
          writePurchases(list);
          return null;
        }
        const next = [purchase, ...readPurchases()];
        writePurchases(next);
        setPurchases(next);
        return null;
      },
      requestWithdrawal: async (id) => {
        const current = session;
        if (!current) return auth.errori.accesso;
        const purchase = purchases.find((item) => item.id === id);
        if (!purchase) return auth.errori.servizio;
        if (!canRequestWithdrawal(purchase.status)) {
          return siteContent.legal.vendita.sezioni.find((sezione) => sezione.id === "consulti")?.testi[1] ?? auth.errori.servizio;
        }
        if (isSupabaseConfigured()) {
          const err = await persistCancellation(current.id, id);
          if (err) return err;
          const list = await loadRemotePurchases(current.id);
          setPurchases(list);
          writePurchases(list);
          return null;
        }
        const next = purchases.map((item) => (item.id === id ? { ...item, status: "cancelled" as const } : item));
        writePurchases(next);
        setPurchases(next);
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
