/**
 * Flag di lancio pubblico.
 * Coming Soon: `siteAccess` / `VITE_SITE_GATE` (pagina esistente, non si tocca).
 * Shop e dispense: congelati al lancio. Riattivare con `VITE_SHOP_LIVE=true`.
 */
export function shopLive() {
  const raw = import.meta.env.VITE_SHOP_LIVE?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}
