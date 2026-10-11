import { siteContent } from "../data/siteContent";

const { brand } = siteContent;

export type BrandLogoTone = "mark" | "hero";

type Props = {
  className?: string;
  tone?: BrandLogoTone;
};

/** Sigillo ufficiale, sempre ritagliato in cerchio. */
export function BrandLogo({ className = "", tone = "mark" }: Props) {
  const src = tone === "hero" ? brand.logoHero : brand.logo;
  return (
    <span
      className={`block aspect-square shrink-0 overflow-hidden rounded-full ${
        tone === "mark" ? "bg-ink ring-1 ring-sage/60 shadow-[0_0_14px_rgba(197,168,128,0.35)]" : ""
      } ${className}`.trim()}
    >
      <img src={src} alt="" className="h-full w-full object-cover" />
    </span>
  );
}
