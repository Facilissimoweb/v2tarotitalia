import { useEffect, useRef, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button, Kicker } from "./Button";
import { GoogleMark, GoogleStars } from "./GoogleMark";
import { Reveal } from "./Reveal";

export const DEFAULT_CTA = {
  to: "/consulti",
  label: siteContent.cta.consultoWhatsapp,
};

export type HeroCta = {
  to?: string;
  href?: string;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "sage" | "ghost" | "paper";
  accent?: "google";
};

/** Sfondo dinamico della hero: immagine, video o superficie mist in attesa. */
export type HeroMedia = {
  src: string;
  type?: "image" | "video";
  alt?: string;
  objectPosition?: string;
};

type Props = {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  cta?: HeroCta | null;
  beforeCta?: HeroCta;
  secondary?: HeroCta;
  tertiary?: HeroCta;
  meta?: ReactNode;
  children?: ReactNode;
  logo?: boolean;
  video?: string;
  media?: HeroMedia;
};

function isVideoMedia(media: HeroMedia) {
  if (media.type === "video") return true;
  if (media.type === "image") return false;
  return /\.(mp4|webm|ogg)(\?|$)/i.test(media.src);
}

export function PageHero({
  kicker,
  title,
  lead,
  cta = DEFAULT_CTA,
  beforeCta,
  secondary,
  tertiary,
  meta,
  children,
  logo = false,
  video,
  media,
}: Props) {
  const backdrop = media ?? (video ? { src: video, type: "video" as const } : undefined);
  const onMedia = Boolean(backdrop);
  const home = logo;
  const tone = onMedia ? "ivory" : "ink";

  return (
    <section
      data-page-hero
      className={`relative overflow-hidden ${home ? "" : "mb-16 lg:mb-32"} ${
        onMedia ? "bg-ink" : "bg-mist"
      }`}
    >
      <HeroBackdrop media={backdrop} />

      <div
        data-hero-content
        className="relative z-10 flex justify-center px-6 py-14 md:px-10 md:py-20 lg:py-24"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <Reveal>
            <span data-hero-logo className="block">
              <BrandLogo
                tone="hero"
                className={`mx-auto h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 ${
                  onMedia ? "drop-shadow-[0_12px_32px_rgba(0,0,0,0.4)]" : ""
                }`}
              />
            </span>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 mb-7 flex items-center justify-center gap-3 md:mt-10">
              <span className={`h-1.5 w-1.5 ${tone === "ivory" ? "bg-ivory" : "bg-ink"}`} />
              <span
                className={
                  tone === "ivory" ? "[&_.label-kicker]:text-ivory [text-shadow:0_1px_14px_rgba(0,0,0,0.4)]" : undefined
                }
              >
                <Kicker>{kicker}</Kicker>
              </span>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <h1
              className={`font-display font-light tracking-tight ${
                home
                  ? "text-4xl leading-[1.12] sm:text-5xl md:text-6xl"
                  : "text-3xl leading-[1.15] md:text-4xl"
              } ${
                tone === "ivory"
                  ? "text-ivory [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]"
                  : "text-ink"
              }`}
            >
              {title}
            </h1>
          </Reveal>

          {lead ? (
            <Reveal delay={200}>
              <div
                className={`mx-auto mt-6 max-w-xl md:mt-8 ${
                  home ? "text-base leading-[1.75]" : "text-sm leading-relaxed"
                } ${
                  tone === "ivory"
                    ? "text-ivory/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)]"
                    : "text-ink/65"
                }`}
              >
                {lead}
              </div>
            </Reveal>
          ) : null}

          {cta ? (
            <Reveal delay={280}>
              <div
                className={`flex w-full flex-wrap items-center justify-center gap-3 ${
                  home ? "mt-12 flex-col sm:flex-row" : "mt-7"
                }`}
              >
                {beforeCta ? (
                  <HeroButton
                    cta={beforeCta}
                    variant={beforeCta.variant ?? "paper"}
                    onMedia={onMedia}
                  />
                ) : null}
                <HeroButton
                  cta={cta}
                  variant={home || !onMedia ? "primary" : "paper"}
                  arrow={home || !onMedia}
                  onMedia={onMedia}
                />
                {secondary ? (
                  <HeroButton
                    cta={secondary}
                    variant={secondary.variant ?? "paper"}
                    onMedia={onMedia}
                  />
                ) : null}
                {tertiary ? (
                  <HeroButton
                    cta={tertiary}
                    variant={tertiary.variant ?? "sage"}
                    onMedia={onMedia}
                  />
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {children ? <div className="mt-5 w-full">{children}</div> : null}

          {meta ? (
            <Reveal delay={360}>
              <div
                className={`mt-12 w-full md:mt-16 ${
                  tone === "ivory"
                    ? "text-ivory/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]"
                    : "text-ink/45"
                }`}
              >
                {meta}
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function HeroBackdrop({ media }: { media?: HeroMedia }) {
  return (
    <div data-hero-backdrop className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {media ? (
        isVideoMedia(media) ? (
          <HeroVideo src={media.src} />
        ) : (
          <img
            src={media.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={media.objectPosition ? { objectPosition: media.objectPosition } : undefined}
          />
        )
      ) : (
        <div className="absolute inset-0 bg-mist" />
      )}
      <div
        data-hero-scrim
        className={
          media
            ? "absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/30 to-ink/55"
            : "absolute inset-0 bg-transparent"
        }
      />
    </div>
  );
}

function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const play = () => {
      void el.play().catch(() => undefined);
    };
    play();
    el.addEventListener("canplay", play);
    return () => el.removeEventListener("canplay", play);
  }, [src]);

  return (
    <video
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function HeroButton({
  cta,
  variant,
  arrow = variant === "primary",
  onMedia = false,
}: {
  cta: HeroCta;
  variant: "primary" | "sage" | "ghost" | "paper";
  arrow?: boolean;
  onMedia?: boolean;
}) {
  if (cta.accent === "google" && cta.href) {
    return <GoogleReviewsHeroLink href={cta.href} label={cta.label} onMedia={onMedia} />;
  }

  const extra = "w-full sm:w-auto";
  const resolved = cta.variant ?? variant;
  const edge =
    onMedia && resolved === "paper" ? `${extra} ring-1 ring-ivory` : extra;
  const label = (
    <>
      {cta.label}
      {arrow ? <span aria-hidden>→</span> : null}
    </>
  );
  if (cta.onClick && !cta.to && !cta.href) {
    return (
      <Button onClick={cta.onClick} variant={resolved} className={edge}>
        {label}
      </Button>
    );
  }
  if (cta.to) {
    return (
      <Button to={cta.to} variant={resolved} className={edge}>
        {label}
      </Button>
    );
  }
  return (
    <Button href={cta.href} variant={resolved} className={edge}>
      {label}
    </Button>
  );
}

function GoogleReviewsHeroLink({
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
      className={`relative inline-flex w-full items-center justify-center gap-2.5 bg-paper px-5 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-colors duration-200 hover:bg-mist sm:w-auto ${
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
