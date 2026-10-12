import { useEffect, useRef } from "react";
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

/** Proporzioni dell'illustrazione di sfondo (verticale 9:16). */
const ART_RATIO = 16 / 9;
/** Larghezza massima dell'illustrazione sugli schermi larghi (il resto resta ivory). */
const ART_MAX_WIDTH = "1100px";

/** Altezza dello spazio visibile sotto l'header fisso (vedi `Layout`: pt-20 / xl:pt-28). */
const FRAME_H = "calc(100svh - var(--hh))";
/** Larghezza dell'illustrazione: mai più stretta della cornice (cover sui telefoni), mai oltre il massimo. */
const ART_W = `max(min(100vw, ${ART_MAX_WIDTH}), calc(${FRAME_H} * ${1 / ART_RATIO}))`;

/** Sfumatura dei bordi laterali dell'illustrazione, per fonderla con lo sfondo ivory. */
const ART_FADE = "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)";

/**
 * Hero della Home con scroll container dedicato.
 * - Una cornice `sticky` resta ferma sotto l'header e contiene l'illustrazione di sfondo.
 * - Scorrendo la pagina l'illustrazione scorre dentro la cornice dall'alto al basso:
 *   alla fine dello scroll la si è vista nella sua interezza (nessun ritaglio definitivo).
 * - Logo, titolo e CTA stanno sopra, nel flusso normale: scorrono via e lasciano
 *   l'illustrazione libera. Uno spazio finale dimensionato sull'altezza dell'immagine
 *   rende lo scorrimento 1:1 con la pagina.
 * È l'unica hero del sito: le pagine interne non ne hanno (vedi `PageHero`).
 */
export function HomeHero({ onOpenFormazione }: Props) {
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = section.current;
    const box = frame.current;
    const layer = art.current;
    if (!host || !box || !layer) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const range = host.offsetHeight - box.offsetHeight;
      if (range <= 0) return;
      const top = parseFloat(getComputedStyle(box).top) || 0;
      const progress = Math.min(Math.max((top - host.getBoundingClientRect().top) / range, 0), 1);
      layer.style.backgroundPosition = `50% ${(progress * 100).toFixed(2)}%`;    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={section}
      data-home-hero
      className="relative bg-ivory [--hh:5rem] xl:[--hh:7rem]"
    >
      {/* Cornice fissa con l'illustrazione che scorre al suo interno */}
      <div
        ref={frame}
        aria-hidden
        className="pointer-events-none sticky top-20 overflow-hidden xl:top-28"
        style={{ height: FRAME_H }}
      >
        <div
          ref={art}
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-[url('/hero-sfondo.webp')] bg-no-repeat"
          style={{
            width: ART_W,
            backgroundSize: "100% auto",
            backgroundPosition: "50% 0%",
            WebkitMaskImage: ART_FADE,
            maskImage: ART_FADE,
          }}
        />
      </div>

      {/* Contenuto: nel flusso, sopra la cornice; scorre via liberando l'illustrazione */}
      <div
        className="relative z-10 flex items-center justify-center px-6 md:px-10"
        style={{ minHeight: FRAME_H, marginTop: `calc(${FRAME_H} * -1)` }}
      >
        <div className="mx-auto w-full max-w-4xl bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(249,248,246,0.95)_0%,rgba(249,248,246,0.9)_62%,rgba(249,248,246,0)_100%)] px-6 py-16 md:px-12 md:py-24">
          <div className="flex flex-col items-center text-center">
            <Reveal>
              <span className="block">
                <BrandLogo
                  tone="hero"
                  className="mx-auto h-28 w-28 drop-shadow-[0_10px_28px_rgba(43,37,35,0.25)] md:h-40 md:w-40 lg:h-44 lg:w-44"
                />
              </span>
            </Reveal>

            <Reveal delay={80}>
              <div className="mb-5 mt-6 flex items-center justify-center gap-3 md:mt-8">
                <span className="h-1.5 w-1.5 bg-sage" />
                <Kicker>{home.kicker}</Kicker>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="font-h1 text-[4rem] leading-[1] text-ink sm:text-[6rem] md:text-[7.5rem] lg:text-[8.5rem]">
                {titolo}
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink/80 md:mt-7">
                {brand.slogan}
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-7 flex w-full flex-wrap items-center justify-center gap-3">
                <Button to="/consulti" className="w-full sm:w-auto">
                  {home.ctaConsulto} <span aria-hidden>→</span>
                </Button>
                <Button to="/rituali" variant="paper" className="w-full ring-1 ring-ink/15 sm:w-auto">
                  {cta.ritualistica}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <div className="mt-8 flex flex-col items-center gap-5 border-t border-ink/15 pt-6 md:mt-10 md:flex-row md:gap-10">
                <button
                  type="button"
                  onClick={onOpenFormazione}
                  className="inline-flex items-center gap-3 border-b border-ink/40 px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-200 hover:border-sage hover:text-sage"
                >
                  {cta.formazioneOlistica}
                </button>
                <GoogleReviewsHeroLink href="#recensioni-google" label={home.recensioni.heroCta} onMedia={false} />
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Spazio di scorrimento: altezza dell'illustrazione meno la cornice, così scorre 1:1 con la pagina */}
      <div
        aria-hidden
        style={{ height: `max(30svh, calc(${ART_W} * ${ART_RATIO} - ${FRAME_H}))` }}
      />
    </section>
  );
}
