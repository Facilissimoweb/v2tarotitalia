import type { ReactNode } from "react";
import { Button, Kicker } from "./Button";

export const DEFAULT_CTA = {
  to: "/consulti",
  label: "Prenota un consulto WhatsApp",
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
};

export function PageHero({
  kicker,
  title,
  lead,
  cta = DEFAULT_CTA,
  secondary,
  meta,
  children,
}: Props) {
  return (
    <section className="px-6 md:px-10">
      <div className="mx-auto max-w-3xl pt-16 pb-20 md:pt-28 md:pb-32">
        <div className="mb-7 flex items-center gap-3">
          <span className="h-1.5 w-1.5 bg-ink" />
          <Kicker>{kicker}</Kicker>
        </div>
        <h1 className="font-display text-4xl font-light leading-[1.12] tracking-tight text-ink sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <div className="mt-8 max-w-lg text-base leading-[1.75] text-ink/70">{lead}</div>
        {cta ? (
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <HeroButton cta={cta} variant="primary" />
            {secondary ? <HeroButton cta={secondary} variant="paper" /> : null}
          </div>
        ) : null}
        {children}
        {meta ? <div className="mt-16">{meta}</div> : null}
      </div>
    </section>
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
