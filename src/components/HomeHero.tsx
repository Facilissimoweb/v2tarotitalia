import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button, Kicker } from "./Button";
import { GoogleReviewsHeroLink } from "./PageHero";
import { Reveal } from "./Reveal";

const { brand, cta, home } = siteContent;

const titolo = home.titolo;

type Props = {
  onOpenFormazione: () => void;
};

/**
 * Hero della Home: composizione centrata (logo, kicker, titolo, testo, CTA) su fondo scuro.
 * La grafica di sfondo è bianca su trasparente: sul fondo scuro risulta chiara; viene
 * attenuata e coperta, al centro, da un velo scuro, così logo, titolo, testi e bottoni
 * restano sempre leggibili.
 * È l'unica hero del sito: le pagine interne non ne hanno (vedi `PageHero`).
 */
export function HomeHero({ onOpenFormazione }: Props) {
  return (
    <section data-home-hero className="relative overflow-hidden bg-ink">
      {/* Grafica bianca di sfondo, attenuata */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/tarot-sfondo.webp')] bg-cover bg-[position:50%_14%] bg-no-repeat opacity-60"
      />
      {/* Velo scuro: denso al centro, dove sta il testo; ai lati la grafica resta visibile */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_50%_52%,rgba(43,37,35,0.94)_0%,rgba(43,37,35,0.82)_50%,rgba(43,37,35,0)_100%)]"
      />

      <div className="relative z-10 flex justify-center px-6 py-16 md:px-10 md:py-24 lg:py-28">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <Reveal>
            <span className="block">
              <BrandLogo
                tone="hero"
                className="mx-auto h-36 w-36 drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)] md:h-44 md:w-44 lg:h-52 lg:w-52"
              />
            </span>
          </Reveal>

          <Reveal delay={80}>
            <div className="mb-7 mt-8 flex items-center justify-center gap-3 md:mt-10">
              <span className="h-1.5 w-1.5 bg-ivory" />
              <span className="[&_.label-kicker]:text-ivory">
                <Kicker>{home.kicker}</Kicker>
              </span>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <h1 className="font-h1 text-[4.25rem] leading-[1] text-ivory [text-shadow:0_2px_24px_rgba(0,0,0,0.7)] sm:text-[6.5rem] md:text-[8rem] lg:text-[9.5rem]">
              {titolo}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ivory/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.6)] md:mt-8">
              {brand.slogan}
            </p>
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-3">
              <Button to="/consulti" variant="paper" className="w-full ring-1 ring-ivory sm:w-auto">
                {home.ctaConsulto} <span aria-hidden>→</span>
              </Button>
              <Button to="/rituali" variant="paper" className="w-full ring-1 ring-ivory sm:w-auto">
                {cta.ritualistica}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-10 flex flex-col items-center gap-6 border-t border-ivory/25 pt-8 md:mt-12 md:flex-row md:gap-10">
              <button
                type="button"
                onClick={onOpenFormazione}
                className="inline-flex items-center gap-3 border-b border-ivory/50 px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ivory transition-colors duration-200 hover:border-ivory hover:text-sage"
              >
                {cta.formazioneOlistica}
              </button>
              <GoogleReviewsHeroLink href="#recensioni-google" label={home.recensioni.heroCta} onMedia />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
