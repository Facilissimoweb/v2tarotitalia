import { siteContent } from "../data/siteContent";

const { brand } = siteContent;

export type BrandLogoTone = "mark" | "hero";

type Props = {
  className?: string;
  tone?: BrandLogoTone;
};

/** Sigillo ufficiale, ritagliato a filo del cerchio (senza margine vuoto del file). */
export function BrandLogo({ className = "", tone = "mark" }: Props) {
  const src = tone === "hero" ? brand.logoHero : brand.logo;
  const hero = tone === "hero";
  return (
    <span className={`block aspect-square shrink-0 overflow-hidden rounded-full ${className}`.trim()}>
      <img
        src={src}
        alt=""
        width={hero ? 288 : 48}
        height={hero ? 288 : 48}
        decoding={hero ? "sync" : "async"}
        fetchPriority={hero ? "high" : "auto"}
        loading={hero ? "eager" : "lazy"}
        className={`${hero ? "logo-flush-hero" : "logo-flush"} h-full w-full object-cover`}
      />
    </span>
  );
}
