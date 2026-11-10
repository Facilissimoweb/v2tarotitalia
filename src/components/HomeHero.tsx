import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";

const { chiSono, home, nav, pages } = siteContent;

const titolo = home.titolo;

const azioni = [
  {
    n: "01",
    titolo: nav.chiSono,
    testo: chiSono.sottotitolo,
    to: "/chi-sono",
  },
  {
    n: "02",
    titolo: nav.consulti,
    testo: home.percorsi.letture[0].testo,
    to: "/consulti",
  },
  {
    n: "03",
    titolo: nav.percorsi,
    testo: pages.percorsi.titolo,
    to: "/percorsi",
  },
  {
    n: "04",
    titolo: nav.blog,
    testo: pages.blog.leggi,
    to: "/blog",
  },
] as const;

/**
 * Hero Home, su ogni schermo: video-copertina, logo fermo in basso a destra,
 * poi i quattro riquadri. Sul telefono il filmato è due terzi più alto della striscia precedente.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const filmRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    film.muted = true;
    if (reduce !== false) {
      film.pause();
      return;
    }
    const pending = film.play();
    if (pending) pending.catch(() => {});
  }, [reduce]);

  return (
    <section
      data-home-hero
      className="relative isolate flex flex-col overflow-hidden bg-ivory text-ink"
    >
      <div className="relative mt-[var(--nav-offset)] border-t border-white/10 bg-plate lg:border-t-0">
        <video
          ref={filmRef}
          className="block aspect-[12/5] w-full object-cover lg:aspect-auto lg:h-[calc(100svh-var(--nav-offset)-19.5rem)] lg:max-h-[48rem] lg:min-h-[22rem]"
          src="/video/TAROT.mp4"
          poster="/video/TAROT-poster.webp"
          width={1280}
          height={533}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={titolo}
        />
        <div className="pointer-events-none absolute bottom-3 right-3 z-[2] sm:bottom-4 sm:right-4 lg:bottom-6 lg:right-20 xl:bottom-8 xl:right-24">
          <BrandLogo
            tone="hero"
            className="h-16 w-16 sm:h-20 sm:w-20 lg:h-[6.5rem] lg:w-[6.5rem] xl:h-[7.75rem] xl:w-[7.75rem]"
          />
        </div>
      </div>

      <div className="relative z-[2] grid grid-cols-2 border-t border-plate xl:grid-cols-4">
        {azioni.map((azione) => (
          <NavLink
            key={azione.n}
            to={azione.to}
            className="plate-tile group flex min-h-[8.75rem] flex-col border-white/10 bg-plate px-5 py-7 text-on-ink transition-colors max-xl:border-b max-xl:border-r max-xl:[&:nth-child(2n)]:border-r-0 max-xl:[&:nth-last-child(-n+2)]:border-b-0 sm:min-h-[9.75rem] sm:px-7 sm:py-8 xl:min-h-[9.25rem] xl:border-r xl:px-8 xl:py-6 xl:last:border-r-0"
          >
            <span className="font-h1 text-[1.2rem] leading-none tracking-[-0.04em] text-ember-pale sm:text-[1.35rem]">
              {azione.n}
            </span>
            <span className="mt-4 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-on-ink transition-colors group-hover:text-ember-pale sm:mt-5 sm:text-[0.6875rem]">
              {azione.titolo}
            </span>
            <span className="mt-3 hidden flex-1 text-[0.9375rem] font-medium leading-relaxed text-on-ink/55 sm:block sm:line-clamp-2">
              {azione.testo}
            </span>
            <span
              aria-hidden
              className="mt-4 text-[0.8125rem] text-ember-pale transition-transform group-hover:translate-x-1 sm:mt-5"
            >
              →
            </span>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
