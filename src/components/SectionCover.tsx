import { useEffect, useRef } from "react";

type Props = {
  src: string;
  /** Posizione dell'immagine nel riquadro (object-position): regola dove cade il volto. */
  objectPosition?: string;
  /** Classi del riquadro dell'immagine (offset, altezza, spostamento laterale). */
  boxClassName?: string;
  /** Classi del velo di leggibilità sopra l'immagine. */
  veilClassName?: string;
};

/**
 * Sfondo in formato copertina per una sezione (il genitore deve essere `relative overflow-hidden`).
 * L'immagine scorre con la pagina a velocità ridotta (parallasse, max 7% dell'altezza),
 * ferma con prefers-reduced-motion. Decorativa: aria-hidden, nessun evento puntatore.
 */
export function SectionCover({
  src,
  objectPosition = "50% 20%",
  boxClassName = "left-[34%] top-[5.5rem] h-[min(100%,46rem)] w-full md:-top-[7%] md:h-[107%]",
  veilClassName = "bg-gradient-to-r from-paper/90 via-paper/30 via-45% to-transparent",
}: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const shift = Math.min(Math.max(-rect.top * 0.1, 0), rect.height * 0.07);
      el.style.setProperty("--sy", shift.toFixed(1));
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
  }, []);

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className={`absolute will-change-transform ${boxClassName}`}
        style={{ transform: "translate3d(0, calc(var(--sy, 0) * 1px), 0)" }}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-45"
          style={{ objectPosition }}
        />
      </div>
      <div className={`absolute inset-0 ${veilClassName}`} />
    </div>
  );
}
