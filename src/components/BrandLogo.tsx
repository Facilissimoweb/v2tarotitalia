import { siteContent } from "../data/siteContent";

const { brand } = siteContent;

export type BrandLogoTone = "mark" | "hero";

type Props = {
  className?: string;
  tone?: BrandLogoTone;
};

/** Sigillo in sfera bianca a filo: anello di 2px, senza alone. */
export function BrandLogo({ className = "", tone = "mark" }: Props) {
  const src = tone === "hero" ? brand.logoHero : brand.logo;
  const hero = tone === "hero";
  return (
    <span
      className={`flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-[2px] ${className}`.trim()}
    >
      <img
        src={src}
        alt=""
        width={hero ? 288 : 48}
        height={hero ? 288 : 48}
        decoding={hero ? "sync" : "async"}
        fetchPriority={hero ? "high" : "auto"}
        loading={hero ? "eager" : "lazy"}
        className={`${hero ? "logo-flush-hero" : "logo-flush"} h-full w-full rounded-full object-cover`}
      />
    </span>
  );
}
