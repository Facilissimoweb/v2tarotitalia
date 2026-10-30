import { motion, useReducedMotion, type Variants } from "motion/react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";

const { home, nav, pages } = siteContent;

const titolo = home.titolo;
const parole = titolo.split(/\s+/);
const ultima = parole.at(-1) ?? titolo;
const precedenti = parole.slice(0, -1);

const azioni = [
  {
    n: "01",
    titolo: nav.consulti,
    testo: home.percorsi.letture[0].testo,
    to: "/consulti",
  },
  {
    n: "02",
    titolo: nav.percorsi,
    testo: pages.percorsi.titolo,
    to: "/percorsi",
  },
  {
    n: "03",
    titolo: nav.chiSiamo,
    testo: home.chiSiamo.titolo,
    to: "/chi-sono",
  },
  {
    n: "04",
    titolo: nav.arcaniMaggiori,
    testo: home.passaggi.titolo,
    to: "/arcani",
  },
] as const;

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
};

const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/**
 * Hero Home: griglia editoriale asimmetrica.
 * Titolo display Outfit ExtraBold, angelo a destra, fascia servizi 01–04.
 */
export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section
      data-home-hero
      className="relative isolate flex min-h-0 flex-col overflow-hidden bg-ivory text-ink xl:min-h-[calc(100svh-112px)]"
    >
      <div className="relative flex min-h-0 flex-1 flex-col justify-center px-6 pb-8 pt-20 md:px-10 md:pb-10 md:pt-14 xl:px-16 xl:pb-8 xl:pt-10 2xl:px-20">
        <motion.div
          className="mx-auto grid w-full max-w-[96rem] items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.95fr)] lg:gap-6 xl:gap-10"
          variants={container}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <div className="hero-editorial-stage relative min-w-0">
            <motion.div variants={riseIn} className="lg:hidden">
              <BrandLogo tone="hero" className="hero-logo-mobile" />
            </motion.div>
            <motion.h1
              variants={riseIn}
              className="font-h1 text-h1-editorial text-[#111111]"
            >
              {precedenti.map((parola) => (
                <span key={parola} className="relative isolate block w-fit">
                  <span aria-hidden className="hero-tarot-bar" />
                  <span className="relative z-[1]">{parola}</span>
                </span>
              ))}
              <span className="mt-[0.08em] block text-[0.52em] font-extrabold leading-[0.88] tracking-[-0.045em] text-[#111111]/40">
                {ultima}
                <span aria-hidden>.</span>
              </span>
            </motion.h1>

            <motion.p
              variants={riseIn}
              className="mt-5 max-w-xl text-[0.9375rem] font-medium leading-snug tracking-[0.01em] text-ink/70 md:text-base xl:mt-6 xl:max-w-2xl xl:text-[1.125rem] xl:leading-snug"
            >
              {home.competenze}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-3 font-display text-base font-medium text-ink/70 md:text-lg xl:mt-8"
            >
              {home.firma}
            </motion.p>

            <motion.p
              variants={riseIn}
              className="mt-4 max-w-md font-display text-sm font-normal italic leading-relaxed text-[#111111]/55 md:text-[0.9375rem]"
            >
              {home.benvenuto}
            </motion.p>

            <motion.div variants={riseIn} className="mt-8">
              <NavLink
                to="/consulti"
                className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-[#111111] transition-colors hover:text-[#111111]/50"
              >
                {home.ctaConsulto}
                <span aria-hidden>→</span>
              </NavLink>
            </motion.div>
          </div>

          <motion.div
            variants={riseIn}
            className="relative z-[2] mx-auto flex w-full max-w-md items-center justify-center overflow-visible py-4 lg:mx-0 lg:max-w-none lg:py-0"
          >
            <span
              aria-hidden
              className="hero-drop-t pointer-events-none absolute -right-8 bottom-[-18%] z-0 select-none xl:-right-16 xl:bottom-[-22%]"
            >
              {titolo.charAt(0)}
            </span>
            <BrandLogo
              tone="hero"
              className="hero-logo-on-t z-[3] hidden lg:flex"
            />
            <p
              aria-hidden
              className="pointer-events-none absolute right-0 top-1/2 z-[1] hidden origin-center translate-x-1/2 -translate-y-1/2 rotate-90 text-[0.5625rem] font-semibold uppercase tracking-[0.32em] text-ink/35 xl:block"
            >
              {home.copyright}
            </p>
            <img
              src="/angelo-hero.webp"
              alt=""
              className="hero-angelo relative z-[2] lg:-translate-x-[6%]"
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-[2] grid grid-cols-1 border-t border-[#111111] sm:grid-cols-2 xl:grid-cols-4">
        {azioni.map((azione) => (
          <NavLink
            key={azione.n}
            to={azione.to}
            className="group flex min-h-[9.25rem] flex-col border-white/10 bg-[#111111] px-6 py-6 text-on-ink transition-colors max-sm:border-b max-sm:last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 xl:border-r xl:px-8 xl:[&:nth-child(2n)]:border-r xl:last:border-r-0"
          >
            <span className="font-h1 text-[1.35rem] leading-none tracking-[-0.04em] text-[#d7f713]">
              {azione.n}
            </span>
            <span className="mt-5 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-on-ink transition-colors group-hover:text-[#d7f713]">
              {azione.titolo}
            </span>
            <span className="mt-3 line-clamp-2 flex-1 text-[0.9375rem] font-medium leading-relaxed text-on-ink/55">
              {azione.testo}
            </span>
            <span
              aria-hidden
              className="mt-5 text-[0.8125rem] text-[#d7f713] transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
