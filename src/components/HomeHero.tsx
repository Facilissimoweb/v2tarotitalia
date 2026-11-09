import { useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";

const { chiSono, home, nav, pages } = siteContent;

const titolo = home.titolo;
const [marcaTarot, marcaItalia] = titolo.split(/\s+/);

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

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
};

const riseIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const riseLogo: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};

/**
 * Hero Home: griglia editoriale asimmetrica.
 * Su cellulare: manifesto a schermo pieno, angelo in overlay, fascia 01–04 compatta.
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
      <div className="flex min-h-[calc(100svh-4.75rem-var(--dock-lift)-env(safe-area-inset-bottom,0px))] flex-col lg:min-h-[66svh] xl:min-h-[72svh]">
      <div className="relative flex flex-1 flex-col justify-end overflow-x-clip px-6 pb-12 pt-[calc(var(--nav-offset)+4.25rem)] sm:px-8 md:px-10 md:pb-14 max-lg:justify-start lg:min-h-[66svh] lg:justify-center lg:overflow-x-visible lg:px-10 lg:pb-12 lg:pt-[calc(var(--nav-offset)+2.25rem)] xl:min-h-[72svh] xl:px-16 2xl:px-20">
        <img src="/hero-paper.webp" alt="" aria-hidden className="hero-paper" />
        <div aria-hidden className="hero-ember-field" />
        <div aria-hidden className="hero-copy-veil lg:hidden" />
        <motion.div
          className="relative mx-auto w-full max-w-[96rem] items-center max-lg:contents lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.95fr)] lg:gap-6 xl:gap-10"
          variants={container}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <div className="hero-editorial-stage relative z-[12] min-w-0 max-lg:pl-5">
            <span aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-ink/25 lg:hidden" />
            <motion.div className="hero-home-logo" variants={reduce ? undefined : riseLogo}>
              <BrandLogo
                tone="hero"
                className="hero-glow mb-8 h-[7rem] w-[7rem] md:mb-10 md:h-[7rem] md:w-[7rem] lg:mb-8 lg:h-[7.75rem] lg:w-[7.75rem]"
              />
            </motion.div>
            <motion.h1
              variants={riseIn}
              className="font-bellara hero-home-title text-black"
            >
              <span className="hero-home-title-tarot">{marcaTarot}</span>
              <span className="hero-home-title-italia">{marcaItalia}</span>
            </motion.h1>

            <motion.div aria-hidden variants={riseIn} className="mt-9 flex items-center gap-3 lg:mt-8">
              <span className="block size-[0.4375rem] bg-ink" />
              <span className="block h-px w-16 bg-ink/40" />
              <span className="block h-px w-8 bg-ink/15" />
            </motion.div>

            <motion.p
              variants={riseIn}
              className="mt-8 max-w-[21rem] font-display text-xl font-normal leading-relaxed text-ink lg:mt-7 lg:max-w-xl lg:text-lg lg:leading-snug xl:mt-8 xl:max-w-2xl xl:text-xl"
            >
              {home.competenze}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-8 max-w-[22rem] font-display text-base font-normal leading-[1.85] text-ink/70 md:text-lg lg:mt-7 lg:max-w-xl xl:mt-8"
            >
              {home.benvenuto}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-9 font-display text-sm font-medium tracking-[0.04em] text-ink/70 md:text-lg md:tracking-normal lg:mt-7"
            >
              {home.firma}
            </motion.p>

            <motion.div variants={riseIn} className="mt-12 lg:mt-10">
              <Button to="/consulti" variant="ember" className="lg:hidden">
                {home.ctaConsulto} →
              </Button>
              <NavLink
                to="/consulti"
                className="hidden items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-[#111111] transition-colors hover:text-[#111111]/50 lg:inline-flex"
              >
                {home.ctaConsulto}
                <span aria-hidden>→</span>
              </NavLink>
            </motion.div>
          </div>

          <motion.div
            variants={riseIn}
            className="hero-visual-stage relative z-[2] mx-auto flex w-full max-w-md items-center justify-center overflow-visible py-4 lg:mx-0 lg:max-w-none lg:py-0"
          >
            <div className="hero-visual-parallax">
              <span aria-hidden className="hero-angelo-mist" />
              <span
                aria-hidden
                className="hero-drop-t pointer-events-none absolute -right-8 bottom-[-18%] z-0 select-none xl:-right-16 xl:bottom-[-22%]"
              >
                {titolo.charAt(0)}
              </span>
              <p
                aria-hidden
                className="pointer-events-none absolute right-0 top-1/2 z-[1] hidden origin-center translate-x-1/2 -translate-y-1/2 rotate-90 text-[0.5625rem] font-semibold uppercase tracking-[0.32em] text-ink/35 xl:block"
              >
                {home.copyright}
              </p>
              <span aria-hidden className="hero-angelo-shadow" />
              <div className="hero-angelo-float relative">
                <span aria-hidden className="pointer-events-none absolute -inset-x-3 -inset-y-4 lg:hidden">
                  <span className="absolute left-0 top-0 h-3.5 w-3.5 border-l border-t border-ink/40" />
                  <span className="absolute right-0 top-0 h-3.5 w-3.5 border-r border-t border-ink/40" />
                  <span className="absolute bottom-0 left-0 h-3.5 w-3.5 border-b border-l border-ink/40" />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 border-b border-r border-ink/40" />
                </span>
                <img
                  src="/angelo-hero.webp"
                  alt=""
                  width={556}
                  height={784}
                  fetchPriority="high"
                  decoding="async"
                  className="hero-angelo relative z-[2] lg:translate-x-[8%]"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
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
      </div>

      <div className="relative z-[2] border-t border-white/10 bg-plate">
        <video
          ref={filmRef}
          className="block aspect-[1280/320] w-full object-cover"
          src="/video/TAROT.mp4"
          poster="/video/TAROT-poster.webp"
          width={1280}
          height={320}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={titolo}
        />
      </div>
    </section>
  );
}
