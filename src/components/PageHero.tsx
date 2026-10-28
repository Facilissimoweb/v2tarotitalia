import type { ReactNode } from "react";
import { GoogleMark, GoogleStars } from "./GoogleMark";

export type HeroCta = {
  to?: string;
  href?: string;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "sage" | "ghost" | "paper";
  accent?: "google";
};

/** Sfondo della hero interna (non più usato: le pagine interne non hanno hero). */
export type HeroMedia = {
  src: string;
  type?: "image";
  alt?: string;
  objectPosition?: string;
};

type Props = {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  /** Ignorati: le pagine interne non hanno più hero, logo, immagine di sfondo né CTA. */
  cta?: HeroCta | null;
  beforeCta?: HeroCta;
  secondary?: HeroCta;
  tertiary?: HeroCta;
  media?: HeroMedia;
  meta?: ReactNode;
  children?: ReactNode;
};

/**
 * Intestazione minima per le pagine che non usano `PageBanner` (Blog, Arcani, Area riservata, ecc.).
 * Resta un H1 nascosto alla vista (`sr-only`) per SEO e screen reader, più un po' di spazio
 * sotto l'header. Gli eventuali `children` (es. stato account in Area Riservata) restano visibili.
 * La hero illustrata è solo in Home (`HomeHero`); Consulti, Percorsi, Chi Sono e Contatti
 * usano il banner visibile `PageBanner`.
 */
export function PageHero({ title, children }: Props) {
  return (
    <div data-page-top className="px-6 pt-10 md:px-10 md:pt-14">
      <h1 className="sr-only">{title}</h1>
      {children ? <div className="mx-auto flex w-full max-w-3xl justify-center">{children}</div> : null}
    </div>
  );
}

export function GoogleReviewsHeroLink({
  href,
  label,
  onMedia,
}: {
  href: string;
  label: string;
  onMedia: boolean;
}) {
  return (
    <a
      href={href}
      className={`relative inline-flex w-full items-center justify-center gap-2.5 bg-paper px-5 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-200 hover:bg-mist sm:w-auto ${
        onMedia ? "ring-1 ring-ivory" : "ring-1 ring-ink/10"
      }`}
    >
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background: "linear-gradient(90deg, #4285F4 0 25%, #EA4335 25% 50%, #FBBC05 50% 75%, #34A853 75% 100%)",
        }}
        aria-hidden
      />
      <GoogleMark className="h-[1.15rem] w-[1.15rem] shrink-0" />
      <GoogleStars className="h-3 w-3" />
      <span>{label}</span>
    </a>
  );
}
