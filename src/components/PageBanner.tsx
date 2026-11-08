import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BrandLogo } from "./BrandLogo";

export type PageBannerMedia = {
  src: string;
  alt?: string;
  /** object-position CSS, es. "center 30%". */
  position?: string;
  /** `contain` per illustrazioni intere; default `cover` per foto. */
  fit?: "cover" | "contain";
  width?: number;
  height?: number;
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
  /** Mantenuto per compatibilità: tutte le hero usano il palco di Chi sono. */
  mobileHeight?: "default" | "two-thirds";
  /** Azioni in hero (CTA). Restano nel blocco LCP, sotto il sottotitolo. */
  actions?: ReactNode;
};

/**
 * Hero delle pagine interne: logo e titolo centrati, stesso palco di Chi sono.
 */
export function PageBanner({
  title,
  subtitle,
  background,
  className = "",
  actions,
}: Props) {
  const reduce = useReducedMotion();
  const onMedia = Boolean(background?.src);
  const contain = background?.fit === "contain";

  return (
    <header
      data-page-top
      data-page-hero
      className={
        onMedia
          ? `relative isolate flex flex-col overflow-hidden bg-plate text-white ${className}`.trim()
          : `relative isolate flex flex-col bg-ivory text-ink ${className}`.trim()
      }
    >
      {background?.src ? (
        <div className="atmosphere-media" aria-hidden>
          <div className="atmosphere-media__shift">
            <img
              src={background.src}
              alt=""
              width={background.width}
              height={background.height}
              fetchPriority="high"
              decoding="async"
              className={`atmosphere-media__ken ${contain ? "atmosphere-media__ken--soft object-cover md:object-contain" : "object-cover"}`}
              style={background.position ? { objectPosition: background.position } : undefined}
            />
          </div>
          <span className="atmosphere-media__orb atmosphere-media__orb--a" />
          <span className="atmosphere-media__orb atmosphere-media__orb--b" />
          <span
            className={
              contain
                ? "atmosphere-media__shade bg-gradient-to-b from-plate/40 via-transparent to-plate/50"
                : "atmosphere-media__shade bg-gradient-to-b from-plate/50 via-plate/30 to-plate/65"
            }
          />
          <span className="atmosphere-media__filament" />
        </div>
      ) : (
        <div className="atmosphere-quiet" aria-hidden>
          <span className="atmosphere-quiet__well" />
          <span className="atmosphere-quiet__rule" />
        </div>
      )}

      <motion.div
        className="page-hero-stage"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandLogo
          tone={onMedia ? "hero" : "mark"}
          finish={onMedia ? "metal" : "ivory"}
          className={
            onMedia
              ? "hero-glow h-[5.5rem] w-[5.5rem] md:h-[6.75rem] md:w-[6.75rem]"
              : "logo-hero-ring h-[5.5rem] w-[5.5rem] md:h-[6.75rem] md:w-[6.75rem]"
          }
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
        {actions ? (
          <div className="mt-8 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        ) : null}
      </motion.div>
    </header>
  );
}
