import { ARCANI } from "../data/arcani.ts";

export const STATIC_APP_PATHS = [
  "/",
  "/chi-sono",
  "/chi-siamo",
  "/arcani",
  "/arcani-minori",
  "/consulti",
  "/percorsi",
  "/blog",
  "/contatti",
  "/carrello",
  "/corsi",
  "/login",
  "/riservata",
  "/privacy",
  "/termini-di-servizio",
] as const;

export function normalizeAppPath(pathname: string) {
  const raw = decodeURIComponent((pathname.split("?")[0] ?? "").trim());
  if (raw.length > 1 && raw.endsWith("/")) return raw.slice(0, -1);
  return raw || "/";
}

export function knownAppPaths() {
  return [...STATIC_APP_PATHS, ...ARCANI.map((item) => `/arcani/${item.slug}`)];
}

export function isKnownAppPath(pathname: string) {
  return knownAppPaths().includes(normalizeAppPath(pathname));
}

/** Percorso interno sicuro per login/OAuth: evita 404 e open-redirect. */
export function safeInternalPath(path: string | undefined | null, fallback = "/riservata"): string {
  if (!path) return fallback;

  let pathname = path;
  let search = "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      if (typeof window !== "undefined" && url.origin !== window.location.origin) return fallback;
      pathname = url.pathname;
      search = url.search;
    } catch {
      return fallback;
    }
  } else if (!path.startsWith("/")) {
    return fallback;
  } else {
    const q = path.indexOf("?");
    if (q >= 0) {
      pathname = path.slice(0, q);
      search = path.slice(q);
    }
  }

  const normalized = normalizeAppPath(pathname);
  if (!isKnownAppPath(normalized)) return fallback;
  return `${normalized}${search}`;
}
