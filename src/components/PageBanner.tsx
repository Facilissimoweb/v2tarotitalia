import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BrandLogo } from "./BrandLogo";

export type PageBannerMedia = {
  src: string;
  alt?: string;
  /** object-position CSS, es. "center 30%". */
  position?: string;
};

type Props = {
  /** Titolo della pagina (h1). */
  title: ReactNode;
  /** Sottotitolo della pagina, facoltativo. */
  subtitle?: ReactNode;
  /** Sfondo fotografico opzionale: ogni pagina può passare la propria immagine. */
  background?: PageBannerMedia;
  /** Classi aggiuntive sul contenitore (es. margini verso il contenuto). */
  className?: string;
};

/**
 * Hero delle pagine interne: logo, titolo e sottotitolo.
 * Se `background` è presente, lo sfondo è fotografico; altrimenti resta ivory, pronto
 * ad accogliere l’immagine della pagina senza cambiare la struttura.
 */
export function PageBanner({ title, subtitle, background, className = "" }: Props) {
  const reduce = useReducedMotion();
  const onMedia = Boolean(background?.src);

  return (
    <header
      data-page-top
      data-page-hero
      className={
        onMedia
          ? `relative isolate overflow-hidden bg-ink text-white ${className}`.trim()
          : `bg-ivory px-6 pb-12 pt-16 md:px-10 md:pb-16 md:pt-24 ${className}`.trim()
      }
    >
      {background?.src ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src={background.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={background.position ? { objectPosition: background.position } : undefined}
          />
          <span className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/35 to-ink/65" />
        </div>
      ) : null}

      <motion.div
        className={
          onMedia
            ? "relative z-10 mx-auto flex min-h-[min(72svh,36rem)] w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center md:min-h-[min(64svh,38rem)] md:px-10 md:py-24"
            : "mx-auto flex max-w-3xl flex-col items-center text-center"
        }
        initial={reduce ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandLogo
          tone={onMedia ? "hero" : "mark"}
          className="logo-hero-ring h-[5.5rem] w-[5.5rem] md:h-[6.75rem] md:w-[6.75rem]"
        />
        <h1 className={`mt-8 font-h1 text-h1 md:mt-10 ${onMedia ? "text-white [text-shadow:0_2px_28px_rgba(43,37,35,0.55)]" : "text-ink"}`}>
          {title}
        </h1>
        {subtitle ? (
          <div
            className={`mt-6 max-w-xl font-display text-base font-normal leading-relaxed md:mt-8 md:text-lg ${
              onMedia ? "text-white/90" : "text-ink/75"
            }`}
          >
            {subtitle}
          </div>
        ) : null}
      </motion.div>
    </header>
  );
}
