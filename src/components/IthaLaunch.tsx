import { siteContent } from "../data/siteContent.ts";
import { useItha } from "../context/IthaContext.tsx";

const { itha } = siteContent;

export function IthaLaunch() {
  const { open, openItha } = useItha();
  if (open) return null;

  return (
    <button
      type="button"
      onClick={openItha}
      aria-label={itha.sticky}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 bg-ivory/95 px-4 py-3 text-ink shadow-[0_8px_24px_rgba(43,37,35,0.1)] ring-1 ring-ink/10 backdrop-blur-md transition-colors duration-200 hover:text-sage md:bottom-6 md:right-6"
    >
      <img src="/logo.svg" alt="" className="h-6 w-6" />
      <span className="font-display text-[11px] uppercase tracking-[0.22em]">{itha.sticky}</span>
    </button>
  );
}
