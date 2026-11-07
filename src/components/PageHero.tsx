import type { MouseEvent, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  width?: number;
  height?: number;
};

type Props = {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  cta?: HeroCta | null;
  beforeCta?: HeroCta;
  secondary?: HeroCta;
  tertiary?: HeroCta;
  media?: HeroMedia;
  meta?: ReactNode;
  children?: ReactNode;
};

/**
 * Intestazione compatta delle pagine interne; i contenuti aggiuntivi restano sotto.
 */
export function PageHero({
  kicker,
  title,
  lead,
  children,
}: Props) {
  return (
    <>
      <PageBanner
        eyebrow={kicker}
        title={title}
        subtitle={lead}
        className={children ? "mb-0" : "mb-6 md:mb-8"}
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
  const navigate = useNavigate();
  const location = useLocation();

  const onReviewsJump = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const id = href.startsWith("#") ? decodeURIComponent(href.slice(1)) : "";
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    event.preventDefault();
    const instant =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    if (instant) root.style.scrollBehavior = "auto";
    el.scrollIntoView({ block: "start", behavior: instant ? "auto" : "smooth" });
    if (instant) root.style.scrollBehavior = prev;
    if (location.hash !== href) {
      navigate(
        { pathname: location.pathname, search: location.search, hash: href },
        { preventScrollReset: true },
      );
    }
  };

  return (
    <a
      href={href}
      onClick={onReviewsJump}
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
