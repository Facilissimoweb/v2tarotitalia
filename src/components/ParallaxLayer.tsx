import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** Intensità dell'effetto: 0.1 = sottile, 0.25 = marcato. */
  speed?: number;
  /** Estende il livello oltre la sezione per coprire lo spostamento (per sfondi a tutta sezione). */
  bleed?: boolean;
  /** Classi del livello (sfondo, opacità, ecc.). */
  className?: string;
  children?: ReactNode;
};

/**
 * Livello di sfondo con effetto parallasse (il genitore deve essere `relative overflow-hidden`).
 * L'immagine scorre con la pagina ma più lentamente, con spostamento dolce e limitato.
 * Disattivato con prefers-reduced-motion. Decorativo: aria-hidden, nessun evento puntatore.
 */
export function ParallaxLayer({ speed = 0.15, bleed = false, className = "", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const range = ((vh + rect.height) / 2) * speed;
      if (bleed) {
        el.style.top = `${-range}px`;
        el.style.bottom = `${-range}px`;
      }
      const offset = rect.top + rect.height / 2 - vh / 2;
      const shift = Math.max(-range, Math.min(range, -offset * speed));
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, bleed]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 inset-y-0 will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
