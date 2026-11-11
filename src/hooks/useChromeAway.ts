import { useEffect, useState } from "react";

/**
 * Nasconde il chrome mobile (placca wordmark + chip menu) allo scroll in basso,
 * lo ripristina allo scroll in alto. Stesso comportamento su tutto il sito.
 */
export function useChromeAway(paused: boolean, resetKey?: string) {
  const [away, setAway] = useState(false);

  useEffect(() => {
    setAway(false);
  }, [paused, resetKey]);

  useEffect(() => {
    if (paused) return;
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (delta > 6 && y > 48) setAway(true);
        else if (delta < -6) setAway(false);
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [paused, resetKey]);

  return away;
}
