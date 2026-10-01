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
};

type Props = {
  kicker: string;
  title: ReactNode;
  lead: ReactNode;
  cta?: HeroCta | null;
  secondary?: HeroCta;
  meta?: ReactNode;
  children?: ReactNode;
  logo?: boolean;
  video?: string;
};

export function PageHero({
  kicker,
  title,
  lead,
  cta = DEFAULT_CTA,
  secondary,
  meta,
  children,
  logo = false,
  video,
}: Props) {
  const copy = (
    <>
      <Reveal>
        <div className="mb-7 flex items-center gap-3">
          <span className="h-1.5 w-1.5 bg-ink" />
          <Kicker>{kicker}</Kicker>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <h1 className="font-display text-4xl font-light leading-[1.12] tracking-tight text-ink sm:text-5xl md:text-6xl">
          {title}
        </h1>
      </Reveal>
      <Reveal delay={200}>
        <div className="mt-8 max-w-lg text-base leading-[1.75] text-ink/70">{lead}</div>
      </Reveal>
      {cta ? (
        <Reveal delay={300}>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <HeroButton cta={cta} variant="primary" />
            {secondary ? <HeroButton cta={secondary} variant="paper" /> : null}
          </div>
        </Reveal>
      ) : null}
      {children ? <Reveal delay={300}>{children}</Reveal> : null}
      {meta ? (
        <Reveal delay={400}>
          <div className="mt-16">{meta}</div>
        </Reveal>
      ) : null}
    </>
  );

  if (!logo) {
    return (
      <section className="px-6 md:px-10">
        <div className="mx-auto max-w-3xl pt-16 pb-20 md:pt-28 md:pb-32">{copy}</div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 pt-16 pb-20 md:grid-cols-[1fr_minmax(16rem,38%)] md:gap-16 md:pt-28 md:pb-32">
        <img src="/logo.svg" alt="" className="order-1 h-16 w-16 md:hidden" />
        <div className="order-3 min-w-0 md:order-1">{copy}</div>
        {video ? (
          <div className="relative order-2 aspect-[16/10] overflow-hidden bg-mist md:aspect-square">
            <HeroVideo src={video} />
            <img
              src="/logo.svg"
              alt=""
              className="absolute top-1/2 left-1/2 hidden h-44 w-44 -translate-x-1/2 -translate-y-1/2 md:block lg:h-52 lg:w-52"
            />
          </div>
        ) : (
          <img src="/logo.svg" alt="" className="hidden h-44 w-44 md:block lg:h-52 lg:w-52" />
        )}
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
      className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
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
}: {
  cta: HeroCta;
  variant: "primary" | "paper";
}) {
  const extra = "w-full sm:w-auto";
  if (cta.to) {
    return (
      <Button to={cta.to} variant={variant} className={extra}>
        {cta.label}
        {variant === "primary" ? <span aria-hidden>→</span> : null}
      </Button>
    );
  }
  return (
    <Button href={cta.href} variant={variant} className={extra}>
      {cta.label}
      {variant === "primary" ? <span aria-hidden>→</span> : null}
    </Button>
  );
}
