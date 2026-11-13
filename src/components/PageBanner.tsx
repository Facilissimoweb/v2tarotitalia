import type { ReactNode } from "react";
import { conPeso } from "./Prosa";

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
  /** Etichetta introduttiva della pagina, facoltativa. */
  eyebrow?: ReactNode;
  /** Descrizione breve della pagina, facoltativa. */
  subtitle?: ReactNode;
  /** Mantenuto per compatibilità con i contenuti esistenti. */
  background?: PageBannerMedia;
  /** Classi aggiuntive sul contenitore (es. margini verso il contenuto). */
  className?: string;
  /** Mantenuto per compatibilità con i contenuti esistenti. */
  mobileHeight?: "default" | "two-thirds";
  /** Mantenuto per compatibilità con i contenuti esistenti. */
  actions?: ReactNode;
};

/**
 * Intestazione compatta delle pagine interne, senza il palco della Home.
 * Un filetto ember chiude il blocco e lo stacca dal corpo della pagina.
 */
export function PageBanner({
  title,
  eyebrow,
  subtitle,
  className = "",
}: Props) {
  return (
    <header
      data-page-top
      className={`pl-6 pr-[calc(var(--side-rail-w)+0.85rem)] pt-[calc(var(--nav-offset)+1.25rem)] text-ink md:pl-10 md:pr-[calc(var(--side-rail-w)+1.1rem)] md:pt-[calc(var(--nav-offset)+1.75rem)] xl:px-10 ${className}`.trim()}
    >
      <div className="page-shell">
        {eyebrow ? (
          <p className="mb-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ember-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[clamp(2rem,6vw,3.25rem)] font-bold leading-[0.95] tracking-[-0.01em]">
          {title}
        </h1>
        {subtitle ? (
          <p className="section-prose section-prose--lead mt-5">
            {typeof subtitle === "string" ? conPeso(subtitle) : subtitle}
          </p>
        ) : null}
        <span aria-hidden className="mt-8 block h-[3px] w-full max-w-none bg-graphite" />
      </div>
    </header>
  );
}
