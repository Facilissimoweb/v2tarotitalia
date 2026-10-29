import { siteContent } from "../data/siteContent";

const { brand } = siteContent;

export type BrandLogoTone = "mark" | "hero";
export type BrandLogoFinish = "ivory" | "metal";

type Props = {
  className?: string;
  tone?: BrandLogoTone;
  finish?: BrandLogoFinish;
};

/** Medaglione ufficiale. Finish metal: ombra di distacco sulle superfici scure. */
export function BrandLogo({ className = "", tone = "mark", finish = "ivory" }: Props) {
  const src = tone === "hero" ? brand.logoHero : brand.logo;
  const hero = tone === "hero";
  const metal = finish === "metal";
  return (
    <span
      className={`flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full ${
        metal ? "logo-medallion" : ""
      } ${className}`.trim()}
    >
      <img
        src={src}
        alt=""
        width={hero ? 288 : 48}
        height={hero ? 288 : 48}
        decoding={hero ? "sync" : "async"}
        fetchPriority={hero ? "high" : "auto"}
        loading={hero ? "eager" : "lazy"}
        className="h-full w-full rounded-full object-cover"
      />
    </span>
  );
}
