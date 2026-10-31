import { readDigitalDraft } from "./digitalOrders";
import { safeInternalPath } from "./siteRoutes";
import { readBookingDraft } from "./storage";

const AUTH_RETURN_KEY = "tarot-italia-auth-return";

export function rememberAuthReturn(path: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_RETURN_KEY, safeInternalPath(path, "/carrello"));
}

export function readAuthReturn() {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(AUTH_RETURN_KEY);
    if (!raw) return "";
    return safeInternalPath(raw, "");
  } catch {
    return "";
  }
}

export function clearAuthReturn() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_RETURN_KEY);
}

export function hasCheckoutIntent() {
  return Boolean(readDigitalDraft() || readBookingDraft());
}

/** Dove far atterrare dopo login/registrazione/OAuth, senza perdere il carrello. */
export function resolvePostAuthPath(explicit?: string | null) {
  const fromExplicit = explicit ? safeInternalPath(explicit, "") : "";
  if (fromExplicit && fromExplicit !== "/login") return fromExplicit;
  const stored = readAuthReturn();
  if (stored && stored !== "/login") return stored;
  if (hasCheckoutIntent()) return "/carrello";
  return "/riservata";
}

export function loginHref(returnTo = "/carrello") {
  const safe = safeInternalPath(returnTo, "/carrello");
  return `/login?from=${encodeURIComponent(safe)}`;
}

export function loginPath(returnTo = "/carrello") {
  const safe = safeInternalPath(returnTo, "/carrello");
  rememberAuthReturn(safe);
  return loginHref(safe);
}
