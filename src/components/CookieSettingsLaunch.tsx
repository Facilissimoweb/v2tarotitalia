import { siteContent } from "../data/siteContent";
import { useConsent } from "../context/ConsentContext";
import { useFooterClearance } from "../lib/useFooterClearance";

const { cookies } = siteContent;

/** Pulsante sticky a sola icona: riapre il modale cookie in qualsiasi punto dello scroll. */
export function CookieSettingsLaunch() {
  const { ready, open, reopen } = useConsent();
  const lift = useFooterClearance();
  const inset = "max(1.25rem, env(safe-area-inset-bottom))";

  if (!ready || open) return null;

  return (
    <button
      type="button"
      onClick={reopen}
      aria-label={cookies.gestisci}
      className="fixed left-5 z-40 flex h-11 w-11 items-center justify-center bg-ivory/95 text-ink/55 shadow-[0_8px_24px_rgba(43,37,35,0.08)] ring-1 ring-ink/10 backdrop-blur-md transition-colors duration-200 hover:text-ink md:left-6"
      style={{ bottom: `calc(${lift}px + ${inset})` }}
    >
      <CookieIcon />
    </button>
  );
}

function CookieIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9.2" cy="10.2" r="1" fill="currentColor" />
      <circle cx="13.6" cy="13" r="0.9" fill="currentColor" />
      <circle cx="10.2" cy="15.2" r="0.75" fill="currentColor" />
    </svg>
  );
}
