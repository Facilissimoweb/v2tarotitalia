import { motion, useReducedMotion, type Variants } from "motion/react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";

const { chiSono, home, nav, pages } = siteContent;

const titolo = home.titolo;
const parole = titolo.split(/\s+/);
const ultima = parole.at(-1) ?? titolo;
const precedenti = parole.slice(0, -1);

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

  return (
    <section
      data-home-hero
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ivory text-ink max-lg:pb-[calc(4.75rem+var(--dock-lift)+env(safe-area-inset-bottom,0px))] lg:min-h-[66svh] xl:min-h-[72svh]"
    >
      <div className="relative flex flex-1 flex-col justify-end overflow-x-clip px-5 pb-8 pt-[calc(var(--nav-offset)+2.85rem)] sm:px-6 md:px-10 md:pb-12 max-lg:justify-start lg:min-h-[66svh] lg:justify-center lg:overflow-x-visible lg:pt-[calc(var(--nav-offset)+1.75rem)] xl:min-h-[72svh] xl:px-16 2xl:px-20">
        <div aria-hidden className="hero-ember-field" />
        <div aria-hidden className="hero-copy-veil lg:hidden" />
        <motion.div
          className="relative mx-auto w-full max-w-[96rem] items-center max-lg:contents lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.95fr)] lg:gap-6 xl:gap-10"
          variants={container}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <div className="hero-editorial-stage relative z-[12] min-w-0">
            <motion.div variants={reduce ? undefined : riseLogo}>
              <BrandLogo
                tone="hero"
                className="hero-glow mb-5 h-[6rem] w-[6rem] md:mb-7 md:h-[7rem] md:w-[7rem] lg:h-[7.75rem] lg:w-[7.75rem]"
              />
            </motion.div>
            <motion.h1
              variants={riseIn}
              className="font-inquisition text-h1-editorial text-black"
            >
              {precedenti.map((parola) => (
                <span key={parola} className="relative isolate block w-fit text-black">
                  <span aria-hidden className="hero-tarot-bar" />
                  <span className="relative z-[1]">{parola}</span>
                </span>
              ))}
              <span className="mt-[0.08em] block text-[0.52em] font-normal leading-[0.88] tracking-[0.02em] text-black/45">
                {ultima}
                <span aria-hidden>.</span>
              </span>
            </motion.h1>

            <motion.p
              variants={riseIn}
              className="mt-5 max-w-[18rem] font-display text-xl font-normal leading-snug text-ink lg:max-w-xl lg:text-lg xl:mt-6 xl:max-w-2xl xl:text-xl"
            >
              {home.competenze}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-4 hidden max-w-xl font-display text-base font-normal leading-relaxed text-ink/70 md:block md:text-lg xl:mt-6"
            >
              {home.benvenuto}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-4 font-display text-sm font-medium tracking-[0.04em] text-ink/70 md:mt-3 md:text-lg md:tracking-normal"
            >
              {home.firma}
            </motion.p>

            <motion.div variants={riseIn} className="mt-8">
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
              <div className="hero-angelo-float">
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
            className="plate-tile group flex min-h-[7.25rem] flex-col border-white/10 bg-plate px-4 py-5 text-on-ink transition-colors max-xl:border-b max-xl:border-r max-xl:[&:nth-child(2n)]:border-r-0 max-xl:[&:nth-last-child(-n+2)]:border-b-0 sm:min-h-[9.25rem] sm:px-6 sm:py-6 xl:min-h-[9.25rem] xl:border-r xl:px-8 xl:last:border-r-0"
          >
            <span className="font-h1 text-[1.2rem] leading-none tracking-[-0.04em] text-[#d7f713] sm:text-[1.35rem]">
              {azione.n}
            </span>
            <span className="mt-4 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-on-ink transition-colors group-hover:text-[#d7f713] sm:mt-5 sm:text-[0.6875rem]">
              {azione.titolo}
            </span>
            <span className="mt-3 hidden flex-1 text-[0.9375rem] font-medium leading-relaxed text-on-ink/55 sm:block sm:line-clamp-2">
              {azione.testo}
            </span>
            <span
              aria-hidden
              className="mt-4 text-[0.8125rem] text-[#d7f713] transition-transform group-hover:translate-x-1 sm:mt-5"
            >
              →
            </span>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
