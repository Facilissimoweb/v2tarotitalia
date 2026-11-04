import type { MouseEvent, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./Button";
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
 * Intestazione delle pagine che non usano `PageBanner` in modo esplicito
 * (Blog, Arcani, Area riservata, ecc.): logo, titolo e sottotitolo (`lead`).
 * `media` diventa lo sfondo fotografico. `cta` / `secondary` restano in hero.
 * Eventuali `children` restano sotto.
 */
export function PageHero({
  title,
  lead,
  media,
  children,
  cta,
  beforeCta,
  secondary,
  tertiary,
}: Props) {
  const onMedia = Boolean(media?.src);
  const actions = [beforeCta, cta ?? undefined, secondary, tertiary].filter(
    (item): item is HeroCta => Boolean(item),
  );

  return (
    <>
      <PageBanner
        title={title}
        subtitle={lead}
        background={
          media?.src
            ? {
                src: media.src,
                alt: media.alt,
                position: media.objectPosition,
                width: media.width,
                height: media.height,
              }
            : undefined
        }
        actions={
          actions.length
            ? actions.map((item, index) => (
                <HeroAction key={`${item.label}-${index}`} item={item} onMedia={onMedia} />
              ))
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

function HeroAction({ item, onMedia }: { item: HeroCta; onMedia: boolean }) {
  if (item.accent === "google" && item.href) {
    return <GoogleReviewsHeroLink href={item.href} label={item.label} onMedia={onMedia} />;
  }

  const variant = item.variant ?? "primary";
  const resolved = onMedia && variant === "primary" ? "paper" : variant;

  return (
    <Button
      variant={resolved}
      to={item.to}
      href={item.href}
      onClick={item.onClick}
    >
      {item.label}
    </Button>
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
