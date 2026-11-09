import type { ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";

const { brand } = siteContent;

type MarkProps = {
  size?: "sm" | "md";
};

/** Logo ufficiale + scritta Tarot Italia, visibile, per le aree di pagina. */
export function SectionBrandMark({ align = "center" }: { align?: "center" | "start" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : ""}>
      <BrandLogo
        className={`logo-hero-ring ${centered ? "mx-auto" : ""} h-[7rem] w-[7rem] md:h-[7rem] md:w-[7rem] lg:h-[7.75rem] lg:w-[7.75rem]`}
      />
      <p className="label-kicker mt-5">{brand.wordmark}</p>
    </div>
  );
}

/** Logo ufficiale + scritta Tarot Italia. Obbligatorio in testa a ogni widget o modale. */
export function WidgetBrandMark({ size = "md" }: MarkProps) {
  const logo =
    size === "sm"
      ? "mx-auto h-[6.25rem] w-[6.25rem] md:h-[6.75rem] md:w-[6.75rem]"
      : "mx-auto h-[7rem] w-[7rem] md:h-[7.75rem] md:w-[7.75rem]";
  const word =
    size === "sm"
      ? "mt-4 text-[0.75rem] tracking-[0.16em]"
      : "mt-4 text-[0.8125rem] tracking-[0.16em]";
  return (
    <div data-widget-brand className="text-center">
      <BrandLogo className={logo} />
      <p className={`font-display uppercase text-ink ${word}`}>{brand.wordmark}</p>
    </div>
  );
}

type Props = {
  title: string;
  titleId?: string;
  children: ReactNode;
};

/** Guscio di widget e modali: logo, Tarot Italia, poi titolo e contenuti. */
export function WidgetFrame({ title, titleId, children }: Props) {
  return (
    <div data-widget-frame>
      <WidgetBrandMark />
      <h2
        id={titleId}
        className="mt-6 text-center font-display text-2xl leading-snug text-ink md:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </div>
  );
}