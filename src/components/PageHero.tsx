import type { ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Bokeh } from "./Bokeh";
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

/** Sfondo della hero interna: immagine o superficie mist in attesa. */
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
  cta?: HeroCta | null;
  beforeCta?: HeroCta;
  secondary?: HeroCta;
  tertiary?: HeroCta;
  meta?: ReactNode;
  children?: ReactNode;
  media?: HeroMedia;
};

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
  media,
}: Props) {
  const backdrop = media;
  const onMedia = Boolean(backdrop);
  const tone = onMedia ? "ivory" : "ink";

  return (
    <section
      data-page-hero
      className={`relative overflow-hidden ${onMedia ? "bg-ivory" : "bg-mist"}`}
    >
      <HeroBackdrop media={backdrop} />
      <Bokeh />

      <div
        data-hero-content
        className="relative z-10 flex justify-center px-6 py-14 md:px-10 md:py-20 lg:py-24"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <Reveal>
            <span data-hero-logo className="block">
              <BrandLogo
                tone="hero"
                className="mx-auto h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 rim-glow"
              />
            </span>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 mb-7 flex items-center justify-center gap-3 md:mt-10">
              <span className={`h-1.5 w-1.5 ${tone === "ivory" ? "bg-moss" : "bg-sage"}`} />
              <span
                className={
                  tone === "ivory" ? "[&_.label-kicker]:text-moss [text-shadow:0_1px_14px_rgba(0,0,0,0.4)]" : undefined
                }
              >
                <Kicker>{kicker}</Kicker>
              </span>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <h1
              className={`font-h1 text-4xl leading-[1.1] md:text-5xl ${
                tone === "ivory"
                  ? "text-ink [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]"
                  : "text-ink"
              }`}
            >
              {title}
            </h1>
          </Reveal>

          {lead ? (
            <Reveal delay={200}>
              <div
                className={`mx-auto mt-6 max-w-xl text-sm leading-relaxed md:mt-8 ${
                  tone === "ivory"
                    ? "text-ink/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)]"
                    : "text-ink/65"
                }`}
              >
                {lead}
              </div>
            </Reveal>
          ) : null}

          {cta ? (
            <Reveal delay={280}>
              <div className="mt-7 flex w-full flex-wrap items-center justify-center gap-3">
                {beforeCta ? (
                  <HeroButton
                    cta={beforeCta}
                    variant={beforeCta.variant ?? "paper"}
                    onMedia={onMedia}
                  />
                ) : null}
                <HeroButton
                  cta={cta}
                  variant={!onMedia ? "primary" : "paper"}
                  arrow={!onMedia}
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
                    ? "text-ink/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]"
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
        <img
          src={media.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={media.objectPosition ? { objectPosition: media.objectPosition } : undefined}
        />
      ) : (
        <div className="absolute inset-0 bg-mist" />
      )}
      <div
        data-hero-scrim
        className={
          media
            ? "absolute inset-0 bg-gradient-to-b from-ivory/90 via-ivory/85 to-ivory/95"
            : "absolute inset-0 bg-transparent"
        }
      />
    </div>
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
    onMedia && resolved === "paper" ? `${extra} ring-1 ring-ink/40` : extra;
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
      className={`relative inline-flex w-full items-center justify-center gap-2.5 bg-white px-5 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#2b2523] transition-[background-color,box-shadow] duration-200 hover:bg-[#efece7] hover:shadow-[0_0_24px_rgba(63,214,154,0.25)] sm:w-auto ${
        onMedia ? "ring-1 ring-white/30" : "ring-1 ring-sage/30"
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
