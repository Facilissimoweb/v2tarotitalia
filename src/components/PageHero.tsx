import { useEffect, useRef, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "./Button";
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
};

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
  secondary,
  tertiary,
  meta,
  children,
  logo = false,
  video,
  media,
}: Props) {
  if (logo) {
    return (
      <HomeHero
        kicker={kicker}
        title={title}
        lead={lead}
        cta={cta}
        secondary={secondary}
        tertiary={tertiary}
        meta={meta}
        video={video}
      />
    );
  }

  return (
    <InnerHero
      kicker={kicker}
      title={title}
      lead={lead}
      cta={cta}
      secondary={secondary}
      tertiary={tertiary}
      meta={meta}
      media={media}
    >
      {children}
    </InnerHero>
  );
}

function HomeHero({
  kicker,
  title,
  lead,
  cta,
  secondary,
  tertiary,
  meta,
  video,
}: {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  cta?: HeroCta | null;
  secondary?: HeroCta;
  tertiary?: HeroCta;
  meta?: ReactNode;
  video?: string;
}) {
  const cinematic = Boolean(video);

  const copy = (
    <>
      <Reveal>
        <div className="mb-7 flex items-center gap-3">
          <span className={`h-1.5 w-1.5 ${cinematic ? "bg-ivory" : "bg-ink"}`} />
          <span className={cinematic ? "[&_.label-kicker]:text-ivory [text-shadow:0_1px_14px_rgba(0,0,0,0.4)]" : undefined}>
            <Kicker>{kicker}</Kicker>
          </span>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <h1
          className={`font-display text-4xl font-light leading-[1.12] tracking-tight sm:text-5xl md:text-6xl ${
            cinematic ? "text-ivory [text-shadow:0_2px_20px_rgba(0,0,0,0.45)]" : "text-ink"
          }`}
        >
          {title}
        </h1>
      </Reveal>
      <Reveal delay={200}>
        <div
          className={`mt-8 max-w-lg text-base leading-[1.75] ${
            cinematic ? "text-ivory/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.4)]" : "text-ink/70"
          }`}
        >
          {lead}
        </div>
      </Reveal>
      {cta ? (
        <Reveal delay={300}>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <HeroButton cta={cta} variant="primary" />
            {secondary ? <HeroButton cta={secondary} variant="paper" /> : null}
            {tertiary ? <HeroButton cta={tertiary} variant={tertiary.variant ?? "sage"} /> : null}
          </div>
        </Reveal>
      ) : null}
      {meta ? (
        <Reveal delay={400}>
          <div className={`mt-16 ${cinematic ? "text-ivory/80 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]" : ""}`}>
            {meta}
          </div>
        </Reveal>
      ) : null}
    </>
  );

  if (!video) {
    return (
      <section data-page-hero className="px-6 md:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 pt-16 pb-20 md:grid-cols-[1fr_auto] md:gap-16 md:pt-28 md:pb-32">
          <img src="/logo.svg" alt="" className="h-16 w-16 md:hidden" />
          <div className="min-w-0">{copy}</div>
          <img src="/logo.svg" alt="" className="hidden h-44 w-44 md:block lg:h-52 lg:w-52" />
        </div>
      </section>
    );
  }

  return (
    <section data-page-hero className="relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeroVideo src={video} />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="relative z-10 px-6 md:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 pt-16 pb-20 md:grid-cols-[1fr_auto] md:gap-16 md:pt-28 md:pb-32">
          <img
            src="/logo.svg"
            alt=""
            className="h-16 w-16 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:hidden"
          />
          <div className="min-w-0">{copy}</div>
          <img
            src="/logo.svg"
            alt=""
            className="hidden h-44 w-44 drop-shadow-[0_16px_40px_rgba(0,0,0,0.4)] md:block lg:h-52 lg:w-52"
          />
        </div>
      </div>
    </section>
  );
}

function InnerHero({
  kicker,
  title,
  lead,
  cta,
  secondary,
  tertiary,
  meta,
  media,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  cta?: HeroCta | null;
  secondary?: HeroCta;
  tertiary?: HeroCta;
  meta?: ReactNode;
  media?: HeroMedia;
  children?: ReactNode;
}) {
  const onMedia = Boolean(media);
  const tone = onMedia ? "ivory" : "ink";

  return (
    <section
      data-page-hero
      className={`relative mb-16 overflow-hidden lg:mb-32 ${onMedia ? "bg-ink" : "bg-mist"}`}
    >
      {media ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {isVideoMedia(media) ? (
            <HeroVideo src={media.src} />
          ) : (
            <img
              src={media.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={media.objectPosition ? { objectPosition: media.objectPosition } : undefined}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-[13rem] items-center justify-center px-6 py-10 md:min-h-[24rem] md:px-10 md:py-24 lg:min-h-[32rem] lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <img
              src="/logo.svg"
              alt=""
              className={`mx-auto mb-6 h-16 w-16 lg:mb-8 ${
                onMedia ? "drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" : ""
              }`}
            />
          </Reveal>
          <Reveal delay={80}>
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className={`h-1.5 w-1.5 ${tone === "ivory" ? "bg-ivory" : "bg-ink"}`} />
              <span className={tone === "ivory" ? "[&_.label-kicker]:text-ivory/80" : undefined}>
                <Kicker>{kicker}</Kicker>
              </span>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <h1
              className={`font-display text-3xl font-light leading-[1.15] tracking-tight md:text-4xl ${
                tone === "ivory"
                  ? "text-ivory [text-shadow:0_2px_18px_rgba(0,0,0,0.4)]"
                  : "text-ink"
              }`}
            >
              {title}
            </h1>
          </Reveal>
          {lead ? (
            <Reveal delay={200}>
              <div
                className={`mx-auto mt-4 max-w-xl text-sm leading-relaxed ${
                  tone === "ivory"
                    ? "text-ivory/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]"
                    : "text-ink/65"
                }`}
              >
                {lead}
              </div>
            </Reveal>
          ) : null}
          {cta ? (
            <Reveal delay={280}>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <HeroButton cta={cta} variant={onMedia ? "paper" : "primary"} arrow />
                {secondary ? <HeroButton cta={secondary} variant="paper" /> : null}
                {tertiary ? <HeroButton cta={tertiary} variant={tertiary.variant ?? "sage"} /> : null}
              </div>
            </Reveal>
          ) : null}
          {children ? <div className="mt-5">{children}</div> : null}
          {meta ? (
            <div
              className={`mt-5 ${
                tone === "ivory" ? "text-ivory/70" : "text-ink/45"
              }`}
            >
              {meta}
            </div>
          ) : null}
        </div>
      </div>
    </section>
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
      className="pointer-events-none motion-reduce:hidden"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function HeroButton({
  cta,
  variant,
  arrow = variant === "primary",
}: {
  cta: HeroCta;
  variant: "primary" | "sage" | "ghost" | "paper";
  arrow?: boolean;
}) {
  const extra = "w-full sm:w-auto";
  const resolved = cta.variant ?? variant;
  const label = (
    <>
      {cta.label}
      {arrow ? <span aria-hidden>→</span> : null}
    </>
  );
  if (cta.onClick && !cta.to && !cta.href) {
    return (
      <Button onClick={cta.onClick} variant={resolved} className={extra}>
        {label}
      </Button>
    );
  }
  if (cta.to) {
    return (
      <Button to={cta.to} variant={resolved} className={extra}>
        {label}
      </Button>
    );
  }
  return (
    <Button href={cta.href} variant={resolved} className={extra}>
      {label}
    </Button>
  );
}
