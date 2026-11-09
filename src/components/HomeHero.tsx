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
      <div className="flex min-h-[calc(100svh-4.75rem-var(--dock-lift)-env(safe-area-inset-bottom,0px))] flex-col lg:min-h-0">
      <div className="relative flex flex-1 flex-col justify-end overflow-x-clip px-6 pb-12 pt-[calc(var(--nav-offset)+4.25rem)] sm:px-8 md:px-10 md:pb-14 max-lg:justify-start lg:min-h-[100svh] lg:justify-center lg:px-10 lg:pb-[calc(7.25rem+var(--dock-lift))] lg:pt-[calc(var(--nav-offset)+1.5rem)] xl:px-16">
        <img src="/hero-paper.webp" alt="" aria-hidden className="hero-paper" />
        <div aria-hidden className="hero-ember-field" />
        <div aria-hidden className="hero-copy-veil lg:hidden" />
        <motion.div
          className="relative mx-auto w-full items-center max-lg:contents lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1.05fr)_minmax(15rem,0.72fr)] lg:items-center lg:gap-10 xl:max-w-7xl xl:gap-16"
          variants={container}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <div className="hero-editorial-stage relative z-[12] min-w-0 max-lg:pl-5">
            <span aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-ink/25 lg:hidden" />
            <motion.div className="hero-home-logo" variants={reduce ? undefined : riseLogo}>
              <BrandLogo
                tone="hero"
                className="hero-glow mb-8 h-[7rem] w-[7rem] md:mb-10 md:h-[7rem] md:w-[7rem] lg:mb-6 lg:h-[6.5rem] lg:w-[6.5rem]"
              />
            </motion.div>
            <motion.h1
              variants={riseIn}
              className="font-bellara hero-home-title text-black"
            >
              <span className="hero-home-title-tarot">{marcaTarot}</span>
              <span className="hero-home-title-italia">{marcaItalia}</span>
            </motion.h1>

            <motion.div aria-hidden variants={riseIn} className="mt-9 flex items-center gap-3 lg:mt-6">
              <span className="block size-[0.4375rem] bg-ink lg:hidden" />
              <span className="block h-px w-16 bg-ink/40 lg:hidden" />
              <span className="block h-px w-8 bg-ink/15 lg:hidden" />
              <span className="hidden h-0.5 w-10 bg-ember lg:block" />
            </motion.div>

            <motion.p
              variants={riseIn}
              className="mt-8 max-w-[21rem] font-display text-xl font-normal leading-relaxed text-ink lg:mt-5 lg:max-w-xl lg:text-lg lg:leading-snug xl:mt-6"
            >
              {home.competenze}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-8 max-w-[22rem] font-display text-base font-normal leading-[1.85] text-ink/70 md:text-lg lg:mt-4 lg:max-w-xl xl:mt-5"
            >
              {home.benvenuto}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-9 font-display text-sm font-medium tracking-[0.04em] text-ink/70 md:text-lg md:tracking-normal lg:mt-4"
            >
              {home.firma}
            </motion.p>

            <motion.div variants={riseIn} className="mt-12 lg:mt-6">
              <Button to="/consulti" variant="ember">
                {home.ctaConsulto} →
              </Button>
            </motion.div>
          </div>

          <motion.div
            variants={riseIn}
            className="hero-visual-stage relative z-[2] mx-auto flex w-full max-w-md items-center justify-center overflow-visible py-4 lg:mx-0 lg:max-w-none lg:py-0"
          >
            <div className="hero-visual-parallax">
              <span aria-hidden className="hero-angelo-mist" />
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
                  className="hero-angelo relative z-[2]"
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
