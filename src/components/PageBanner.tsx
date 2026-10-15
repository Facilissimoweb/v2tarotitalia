import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BrandLogo } from "./BrandLogo";

type Props = {
  /** Titolo della pagina (h1). */
  title: ReactNode;
  /** Riga di accompagnamento, facoltativa. */
  subtitle?: ReactNode;
  /** Classi aggiuntive sul contenitore (es. margini verso il contenuto). */
  className?: string;
};

/**
 * Banner compatto per le pagine interne: logo, titolo (h1) ed eventuale sottotitolo
 * su fondo scuro con un tenue bagliore radiale. Entra con dissolvenza e piccola risalita,
 * senza animazione se l'utente ha chiesto di ridurre il movimento.
 */
export function PageBanner({ title, subtitle, className = "" }: Props) {
  const reduce = useReducedMotion();

  return (
    <header
      data-page-top
      className={`relative flex min-h-[200px] items-center justify-center overflow-hidden border-b border-stone-800 bg-stone-950 px-6 py-10 md:min-h-[240px] md:px-10 ${className}`.trim()}
    >
      {/* Bagliore radiale al centro */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(122,139,120,0.22)_0%,rgba(122,139,120,0.08)_38%,transparent_70%)]"
      />

      <motion.div
        className="relative flex max-w-3xl flex-col items-center text-center"
        initial={reduce ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandLogo className="h-12 w-12 bg-ivory" />
        <h1 className="mt-4 font-display text-2xl font-light leading-snug tracking-tight text-stone-100 md:text-4xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-400">{subtitle}</p> : null}
      </motion.div>
    </header>
  );
}
