const STORAGE_KEY = "ti-site-access";
const QUERY_KEY = "access";
const DEFAULT_TOKEN = "tarot2026";

function accessToken() {
  return import.meta.env.VITE_SITE_ACCESS?.trim() || DEFAULT_TOKEN;
}

/** `npm run dev` / Vite HMR: l’anteprima locale non deve mai essere bloccata. */
function isLocalDev() {
  return import.meta.env.DEV;
}

export function siteGateEnabled() {
  if (isLocalDev()) return false;
  const raw = import.meta.env.VITE_SITE_GATE?.trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off") return false;
  return true;
}

function readStoredToken() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* privato o storage pieno: lo sblocco vale solo per questa sessione */
  }
}

function queryAccess() {
  return new URLSearchParams(window.location.search).get(QUERY_KEY);
}

function stripAccessParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(QUERY_KEY)) return;
  url.searchParams.delete(QUERY_KEY);
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(null, "", next);
}

export function isSiteUnlocked() {
  if (!siteGateEnabled()) return true;
  const token = accessToken();
  const fromQuery = queryAccess();
  if (fromQuery && fromQuery === token) {
    writeStoredToken(token);
    return true;
  }
  return readStoredToken() === token;
}

export function consumeSiteAccessQuery() {
  if (!siteGateEnabled()) return;
  if (queryAccess() === accessToken()) stripAccessParam();
}
