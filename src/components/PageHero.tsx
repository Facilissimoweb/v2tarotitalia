import type { ReactNode } from "react";
import { GoogleMark, GoogleStars } from "./GoogleMark";
import { PageBanner } from "./PageBanner";

export type HeroCta = {
  to?: string;
  href?: string;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "paper";
  accent?: "google";
};

/** Sfondo fotografico opzionale della hero interna. */
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
  /** Ignorati: le pagine interne mostrano logo, titolo e sottotitolo. */
  cta?: HeroCta | null;
  beforeCta?: HeroCta;
  secondary?: HeroCta;
  tertiary?: HeroCta;
  media?: HeroMedia;
  meta?: ReactNode;
  children?: ReactNode;
};

/**
 * Intestazione delle pagine che non usano `PageBanner` in modo esplicito
 * (Blog, Arcani, Area riservata, ecc.): logo, titolo e sottotitolo (`lead`).
 * `media` diventa lo sfondo fotografico. Eventuali `children` restano sotto.
 */
export function PageHero({ title, lead, media, children }: Props) {
  return (
    <>
      <PageBanner
        title={title}
        subtitle={lead}
        background={
          media?.src
            ? { src: media.src, alt: media.alt, position: media.objectPosition }
            : undefined
        }
        className={children ? "mb-0 pb-6 md:pb-8" : "mb-10 md:mb-14"}
      />
      {children ? (
        <div className="mx-auto flex w-full max-w-3xl justify-center px-6 pb-10 md:px-10 md:pb-14">
          {children}
        </div>
      ) : null}
    </>
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
