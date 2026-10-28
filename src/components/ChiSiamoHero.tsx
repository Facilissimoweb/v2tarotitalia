import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { ChromaticImage } from "./ui/chromatic-image";

const { brand, chiSiamo, nav } = siteContent;

const HERO_IMAGE = chiSiamo.immagini.hero.src;
/** Altezza sotto l’header fisso (`Layout`: pt-[80px] / xl:pt-[112px]). */
const FRAME_H = "calc(100svh - var(--hh))";

function HeroRule() {
  return (
    <span
      aria-hidden
      className="mx-auto block h-px w-[min(12rem,42%)] bg-gradient-to-r from-transparent via-white/55 to-transparent md:w-[min(16rem,36%)]"
    />
  );
}

/**
 * Hero Chi sono: stesso effetto ChromaticImage della Home.
 * Logo fermo; titolo e copy da siteContent; testo bianco su velo.
 */
export function ChiSiamoHero() {
  return (
    <section
      data-page-top
      data-chi-siamo-hero
      className="relative isolate mb-10 overflow-x-hidden bg-mist text-white [--hh:80px] md:mb-14 xl:[--hh:112px]"
    >
      <ChromaticImage
        src={HERO_IMAGE}
        alt={chiSiamo.immagini.hero.alt}
        backgroundColor="#1a2228"
        zoom={0.1}
        displacement={0.03}
        chromaticShift={0.012}
        tilt={0.12}
        className="w-full"
      >
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/50 via-ink/30 to-ink/60" />

        <div
          className="pointer-events-none relative z-10 flex items-center justify-center px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-16"
          style={{ minHeight: FRAME_H }}
        >
          <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col items-center py-6 text-center text-white md:max-w-4xl md:py-10">
            <BrandLogo
              tone="hero"
              className="mx-auto h-[clamp(5.5rem,min(40vw,22svh),12rem)] w-[clamp(5.5rem,min(40vw,22svh),12rem)] max-w-full drop-shadow-[0_0_40px_rgba(255,254,251,1)]"
            />

            <h1 className="mt-10 max-w-full break-words font-h1 text-[clamp(2.75rem,min(12vw,14svh),6.5rem)] leading-[1.05] text-white [text-shadow:0_2px_28px_rgba(43,37,35,0.55)] md:mt-14 xl:text-[clamp(4.5rem,min(9vw,14svh),9rem)]">
              {nav.chiSiamo}
            </h1>

            <div className="mt-8 w-full md:mt-10">
              <HeroRule />
            </div>

            <p className="mt-8 font-display text-base leading-relaxed text-white md:mt-10 md:text-lg xl:text-[1.5rem]">
              {chiSiamo.titolo}
            </p>

            <div className="mt-8 w-full md:mt-10">
              <HeroRule />
            </div>

            <p className="mt-8 max-w-2xl text-sm font-medium leading-[1.85] text-white/90 md:mt-10 md:text-base xl:text-lg">
              {brand.sottotitolo}
            </p>
          </div>
        </div>
      </ChromaticImage>
    </section>
  );
}
