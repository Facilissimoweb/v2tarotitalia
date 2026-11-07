import { siteContent } from "../data/siteContent";

const { brand } = siteContent;

export type BrandLogoTone = "mark" | "hero" | "nav";
export type BrandLogoFinish = "ivory" | "metal";

type Props = {
  className?: string;
  tone?: BrandLogoTone;
  finish?: BrandLogoFinish;
};

/** Medaglione ufficiale. Finish metal: ombra di distacco sulle superfici scure. */
export function BrandLogo({ className = "", tone = "mark", finish = "ivory" }: Props) {
  const src = tone === "hero" ? brand.logoHero : tone === "nav" ? brand.logoNav : brand.logo;
  const hero = tone === "hero";
  const nav = tone === "nav";
  const metal = finish === "metal" && !nav;
  const eager = hero || nav;
  return (
    <span
      className={`flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full ${
        nav ? "bg-transparent" : "bg-ivory"
      } ${metal ? "logo-medallion" : ""} ${className}`.trim()}
    >
      <img
        src={src}
        alt=""
        width={800}
        height={800}
        decoding={eager ? "sync" : "async"}
        fetchPriority={hero ? "high" : "auto"}
        loading={eager ? "eager" : "lazy"}
        className={`h-full w-full object-cover object-center ${
          nav ? "origin-center scale-[1.36]" : hero ? "origin-center scale-[1.18]" : ""
        }`}
      />
    </span>
  );
}
