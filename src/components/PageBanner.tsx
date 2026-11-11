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
      className={`pr-6 pl-[calc(var(--side-rail-w)+1.15rem)] pt-[calc(var(--nav-offset)+1.5rem)] text-ink md:pr-10 md:pl-[calc(var(--side-rail-w)+1.5rem)] md:pt-[calc(var(--nav-offset)+2rem)] xl:px-10 ${className}`.trim()}
    >
      <div className="mx-auto max-w-6xl">
        {eyebrow ? (
          <p className="mb-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ember-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-h1 text-h1">{title}</h1>
        {subtitle ? (
          <p className="mt-3 max-w-3xl font-display text-base leading-relaxed text-ink/75 md:text-lg">
            {typeof subtitle === "string" ? conPeso(subtitle) : subtitle}
          </p>
        ) : null}
        <span aria-hidden className="mt-8 block h-0.5 w-10 bg-ember" />
      </div>
    </header>
  );
}
