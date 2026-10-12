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

/** Altezza dello spazio visibile sotto l'header fisso (vedi `Layout`: pt-20 / xl:pt-28). */
const FRAME_H = "calc(100svh - var(--hh))";
/** Larghezza dell'illustrazione: a tutto schermo (destra e sinistra), mai più stretta della cornice. */
const ART_W = `max(100vw, calc(${FRAME_H} * ${1 / ART_RATIO}))`;

/** Altezza dell'illustrazione alla larghezza corrente. */
const ART_H = `calc(${ART_W} * ${ART_RATIO})`;
/** Quota (0–1) dell'altezza dell'illustrazione in cui cade il centro della fiamma. */
const FLAME_Y = 0.657;
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
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = track.current;
    const box = frame.current;
    const layer = art.current;
    const content = body.current;
    if (!host || !box || !layer || !content) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const artPx = layer.offsetWidth * ART_RATIO;
      // Se l'apparato, centrato sulla fiamma, sporge oltre l'illustrazione (telefoni),
      // la pista si allunga: la cornice resta ferma e l'illustrazione non viene mai tagliata.
      // Il centro cade sulla fiamma, ma mai così in alto da finire sotto l'header.
      const half = content.offsetHeight / 2;
      const center = Math.max(artPx * FLAME_Y, half + 8);
      content.style.top = `${Math.round(center)}px`;
      host.style.minHeight = `${Math.ceil(center + half + 56)}px`;
      const travel = artPx - box.offsetHeight;
      if (travel <= 0) {
        layer.style.backgroundPosition = "50% 0%";
        return;
      }
      const top = parseFloat(getComputedStyle(box).top) || 0;
      const progress = Math.min(Math.max((top - host.getBoundingClientRect().top) / travel, 0), 1);
      layer.style.backgroundPosition = `50% ${(progress * 100).toFixed(2)}%`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    const observer = new ResizeObserver(onScroll);
    observer.observe(content);
    observer.observe(host);
    void document.fonts?.ready.then(onScroll);
    window.addEventListener("load", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={section}
      data-home-hero
      className="relative overflow-x-clip bg-ivory [--hh:5rem] xl:[--hh:7rem]"
    >
      {/* Pista alta quanto l'illustrazione: cornice e apparato scorrono 1:1 con la pagina */}
      <div ref={track} className="relative" style={{ height: ART_H }}>
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
          }}
        />
      </div>

      {/* Dissolvenza finale: il bordo inferiore dell'illustrazione sfuma nell'ivory, senza taglio netto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[clamp(5rem,16svh,9rem)] bg-gradient-to-t from-ivory via-ivory/70 to-transparent"
      />

      {/* Apparato: centrato sull'altezza della fiamma, scorre insieme all'illustrazione */}
      <div
        ref={body}
        className="absolute inset-x-0 z-10 flex -translate-y-1/2 items-center justify-center px-6 md:px-10"
        style={{ top: `calc(${ART_H} * ${FLAME_Y})` }}
      >
        <div className="relative mx-auto w-full max-w-4xl px-6 py-[clamp(1rem,3svh,4rem)] md:px-12">
          {/* Bagliore diffuso: alone ivory ampio e morbido che respira lentamente dietro l'apparato */}
          <span
            aria-hidden
            className="hero-glow pointer-events-none absolute -inset-x-[22%] -inset-y-[14%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,254,251,1)_0%,rgba(255,254,251,0.97)_48%,rgba(252,251,248,0.8)_70%,rgba(249,248,246,0)_100%)] blur-xl"
          />
          <div className="flex flex-col items-center text-center">
            <Reveal>
              <span className="block">
                <BrandLogo
                  tone="hero"
                  className="mx-auto h-[clamp(5rem,14svh,10rem)] w-[clamp(5rem,14svh,10rem)] drop-shadow-[0_0_34px_rgba(255,254,251,1)]"
                />
              </span>
            </Reveal>

            <Reveal delay={80}>
              <div className="mb-[clamp(0.75rem,2svh,1.25rem)] mt-[clamp(1rem,3svh,2rem)] flex items-center justify-center gap-3">
                <span className="h-1.5 w-1.5 bg-sage" />
                <Kicker>{home.kicker}</Kicker>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="font-h1 text-[clamp(3.5rem,min(14vw,14svh),8.5rem)] leading-[1] text-ink [text-shadow:0_0_36px_rgba(255,254,251,0.95),0_0_72px_rgba(255,254,251,0.85)]">
                {titolo}
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mx-auto mt-[clamp(0.75rem,2.4svh,1.75rem)] max-w-xl text-sm leading-relaxed text-ink/80">
                {brand.slogan}
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-[clamp(1rem,3svh,1.75rem)] flex w-full flex-wrap items-center justify-center gap-3">
                <Button to="/consulti" className="w-full sm:w-auto">
                  {home.ctaConsulto} <span aria-hidden>→</span>
                </Button>
                <Button to="/rituali" variant="paper" className="w-full ring-1 ring-ink/15 sm:w-auto">
                  {cta.ritualistica}
                </Button>
              </div>
            </Reveal>

            <Reveal delay={360}>
              <div className="mt-[clamp(1rem,3.5svh,2.5rem)] flex flex-col items-center gap-5 border-t border-ink/15 pt-[clamp(0.75rem,2.5svh,1.5rem)] md:flex-row md:gap-10">
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

      </div>
    </section>
  );
}
