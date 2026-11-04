/**
 * Flag di lancio pubblico.
 * Coming Soon: `siteAccess` / `VITE_SITE_GATE=on` per rollback. Lancio: off.
 * Shop e dispense: congelati al lancio. Riattivare con `VITE_SHOP_LIVE=true`.
 */
export function shopLive() {
  const fromVite = (import.meta as ImportMeta & { env?: { VITE_SHOP_LIVE?: string } }).env
    ?.VITE_SHOP_LIVE;
  const fromProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.VITE_SHOP_LIVE;
  const raw = (fromVite ?? fromProcess ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}
