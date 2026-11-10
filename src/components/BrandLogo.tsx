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
      className={`flex shrink-0 items-center justify-center ${
        nav
          ? "bg-transparent"
          : "aspect-square overflow-hidden rounded-full bg-ivory"
      } ${metal ? "logo-medallion" : ""} ${className}`.trim()}
    >
      <img
        src={src}
        alt=""
        width={nav ? 293 : 800}
        height={nav ? 269 : 800}
        decoding={eager ? "sync" : "async"}
        fetchPriority={hero ? "high" : "auto"}
        loading={eager ? "eager" : "lazy"}
        className={`h-full w-full object-center ${
          nav ? "object-contain" : "object-cover logo-hero-crop"
        }`}
      />
    </span>
  );
}
