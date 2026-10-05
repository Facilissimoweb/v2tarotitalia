import { ARCANI } from "../data/arcani";

export const STATIC_APP_PATHS = [
  "/",
  "/chi-siamo",
  "/arcani",
  "/arcani-minori",
  "/consulti",
  "/rituali",
  "/blog",
  "/contatti",
  "/carrello",
  "/corsi",
  "/estrazione",
  "/login",
  "/riservata",
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
