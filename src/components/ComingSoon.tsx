import { useEffect } from "react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { ContactDock } from "./ContactDock";
import { Kicker } from "./Button";

const { brand, pages } = siteContent;
const copy = pages.soglia;

export function ComingSoon() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${copy.titolo} — ${brand.wordmark}`;
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    document.body.style.overflow = "hidden";
    return () => {
      document.title = previousTitle;
      robots.remove();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ivory px-6 text-ink">
      <div className="flex max-w-xl flex-col items-center py-24 text-center">
        <BrandLogo tone="hero" className="mx-auto h-32 w-32 md:h-40 md:w-40 lg:h-44 lg:w-44" />
        <div className="mt-10 flex items-center justify-center gap-3">
          <span className="h-1.5 w-1.5 bg-ink" />
          <Kicker>{copy.kicker}</Kicker>
        </div>
        <p className="mt-8 font-display text-[13px] leading-none tracking-[0.42em] text-ink">
          {brand.wordmark.toUpperCase()}
        </p>
        <p className="mt-2 text-[9px] uppercase leading-none tracking-[0.28em] text-sage">{brand.name}</p>
        <h1 className="mt-12 font-display text-3xl font-light leading-[1.15] tracking-tight md:text-4xl">
          {copy.titolo}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ink/65">{brand.slogan}</p>
      </div>
      <ContactDock />
    </main>
  );
}
