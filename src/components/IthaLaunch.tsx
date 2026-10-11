import { siteContent } from "../data/siteContent.ts";
import { useItha } from "../context/IthaContext.tsx";
import { BrandLogo } from "./BrandLogo.tsx";

const { itha } = siteContent;

export function IthaLaunch() {
  const { open, openItha } = useItha();
  if (open) return null;

  return (
    <button
      type="button"
      onClick={openItha}
      aria-label={itha.sticky}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 bg-ivory/95 px-4 py-3 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.45)] ring-1 ring-sage/30 backdrop-blur-md transition-colors duration-200 hover:text-sage md:bottom-6 md:right-6"
    >
      <BrandLogo className="h-9 w-9" />
      <span className="font-display text-[11px] uppercase tracking-[0.22em]">{itha.sticky}</span>
    </button>
  );
}
