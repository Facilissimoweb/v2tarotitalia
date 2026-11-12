import { siteContent } from "../data/siteContent";
import { useConsent } from "../context/ConsentContext";

const { cookies } = siteContent;

/** Pulsante sticky a sola icona: riapre il modale cookie in qualsiasi punto dello scroll. */
export function CookieSettingsLaunch() {
  const { ready, open, reopen } = useConsent();

  if (!ready || open) return null;

  return (
    <button
      type="button"
      onClick={reopen}
      aria-label={cookies.gestisci}
      className="app-glass-fab fixed bottom-[calc(var(--l-dock-h)+1.1rem+env(safe-area-inset-bottom,0px))] left-5 z-40 flex h-11 w-11 items-center justify-center text-ink/60 transition-colors duration-200 hover:text-ink md:left-6"
    >
      <CookieIcon />
    </button>
  );
}

function CookieIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="block">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9.2" cy="10.2" r="1" fill="currentColor" />
      <circle cx="13.6" cy="13" r="0.9" fill="currentColor" />
      <circle cx="10.2" cy="15.2" r="0.75" fill="currentColor" />
    </svg>
  );
}
