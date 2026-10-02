import type { ReactNode } from "react";
import { siteContent } from "../data/siteContent";

const { brand } = siteContent;

type MarkProps = {
  size?: "sm" | "md";
};

/** Logo ufficiale + scritta Tarot Italia. Obbligatorio in testa a ogni widget o modale. */
export function WidgetBrandMark({ size = "md" }: MarkProps) {
  const logo = size === "sm" ? "mx-auto h-8 w-8" : "mx-auto h-11 w-11";
  const word = size === "sm" ? "mt-3 text-[10px] tracking-[0.28em]" : "mt-3.5 text-[11px] tracking-[0.32em]";
  return (
    <div data-widget-brand className="text-center">
      <img src="/logo.svg" alt="" className={logo} />
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
        className="mt-6 text-center font-display text-2xl font-light leading-snug tracking-tight text-ink md:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </div>
  );
}