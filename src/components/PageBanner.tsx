import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type Props = {
  /** Titolo della pagina (h1). */
  title: ReactNode;
  /** Sottotitolo della pagina, facoltativo. */
  subtitle?: ReactNode;
  /** Classi aggiuntive sul contenitore (es. margini verso il contenuto). */
  className?: string;
};

/**
 * Hero essenziale delle pagine interne: solo titolo e, se c’è, sottotitolo.
 * Nessun logo, immagine, bagliore o CTA — la gerarchia resta tipografica.
 */
export function PageBanner({ title, subtitle, className = "" }: Props) {
  const reduce = useReducedMotion();

  return (
    <header
      data-page-top
      className={`px-6 pb-12 pt-16 md:px-10 md:pb-16 md:pt-24 ${className}`.trim()}
    >
      <motion.div
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
        initial={reduce ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-h1 text-h1 text-ink">{title}</h1>
        {subtitle ? (
          <div className="mt-6 max-w-xl font-display text-base font-normal leading-relaxed text-ink/75 md:mt-8 md:text-lg">
            {subtitle}
          </div>
        ) : null}
      </motion.div>
    </header>
  );
}
