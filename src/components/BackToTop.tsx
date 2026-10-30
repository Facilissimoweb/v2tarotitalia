import { useEffect, useState } from "react";
import { siteContent } from "../data/siteContent";

const { cta } = siteContent;

/**
 * Freccia globale: in basso a destra, subito sopra l’icona-bocca della chat.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={cta.tornaSu}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-3 z-[46] flex h-10 w-10 items-center justify-center bg-[#111111] text-[#d7f713] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:right-4 bottom-[calc(10.5rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(11.75rem+env(safe-area-inset-bottom,0px))]"
    >
      <span aria-hidden className="text-[0.875rem] leading-none">
        ↑
      </span>
    </button>
  );
}
