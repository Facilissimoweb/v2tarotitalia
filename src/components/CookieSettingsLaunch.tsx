import { siteContent } from "../data/siteContent";
import { useConsent } from "../context/ConsentContext";

const { cookies } = siteContent;

/** Pulsante sticky: riapre il modale cookie in qualsiasi punto dello scroll. */
export function CookieSettingsLaunch() {
  const { ready, open, reopen } = useConsent();

  if (!ready || open) return null;

  return (
    <button
      type="button"
      onClick={reopen}
      className="fixed bottom-5 left-5 z-40 bg-ivory/95 px-4 py-2.5 text-[9px] font-medium uppercase tracking-[0.18em] text-ink/55 shadow-[0_8px_24px_rgba(43,37,35,0.08)] ring-1 ring-ink/10 backdrop-blur-md transition-colors duration-200 hover:text-ink md:bottom-6 md:left-6"
    >
      {cookies.gestisci}
    </button>
  );
}