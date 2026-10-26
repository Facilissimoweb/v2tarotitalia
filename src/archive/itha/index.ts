/**
 * Itha · Crocicchio di Ecate — ARCHIVIO (non montato nell’app pubblica).
 * Vedi README.md in questa cartella.
 *
 * Pubblico per l’host (sito Tarot Italia): provider, UI di lancio/modale, hook.
 * Il resto (deck, decode, PDF, Supabase readings) resta interno alla feature.
 *
 * Dipendenze host attese (sostituibili in un’esportazione futura):
 * - `src/data/siteContent.ts` → `siteContent.itha`
 * - `src/context/AuthContext` (sessione)
 * - `src/context/LanguageContext`
 * - shell UI: WidgetDialog, AuthForm, LegalNotice, Button, BrandLogo
 * - `src/lib/supabase`, language/locale helpers, remoteApi
 * - API route `/api/itha-decode` → `lib/serverDecode`
 */

export { IthaProvider, useItha } from "./context/IthaContext.tsx";
export { IthaLaunch } from "./components/IthaLaunch.tsx";
export type { IthaReading, IthaDecode, IthaDecodeRequest } from "./lib/types.ts";
export { handleIthaDecode, handleIthaDevPreview } from "./lib/serverDecode.ts";
/** Modale: importare da `./components/IthaModal` (lazy-friendly, non dal barrel). */

