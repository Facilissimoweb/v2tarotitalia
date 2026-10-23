import { motion, useReducedMotion, type Variants } from "motion/react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";
import "./HeroLogoSpin.css";

const { brand, cta, home } = siteContent;

const titolo = home.titolo;

/** Pulsanti della Hero: più grandi solo da desktop (xl), invariati altrove. */
const heroBtn = "w-full xl:px-12 xl:py-6 xl:text-sm xl:tracking-[0.22em] 2xl:px-14 2xl:py-7 2xl:text-base";

/* ───────── Animazioni (Motion) ───────── */
const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/** Solo elementi sotto-LCP: dissolvenza con salita. Logo e H1 restano subito visibili. */
const riseIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/** Micro-interazioni dei pulsanti: molla morbida, bagliore sage discreto. */
const spring = { type: "spring", stiffness: 280, damping: 22 } as const;
const hoverGlow = { scale: 1.02, boxShadow: "0 0 24px rgba(122, 139, 120, 0.4)" };
const tapPress = { scale: 0.98 };

/** Altezza sotto l’header fisso (`Layout`: pt-[80px] / xl:pt-[112px]). */
const FRAME_H = "calc(100svh - var(--hh))";

/**
 * Hero della Home su fondo ivory.
 * Gutters allineati alle altre pagine: un solo `px-6 md:px-10`, overflow clippato.
 */
export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section
      data-home-hero
      className="relative isolate overflow-x-hidden bg-ivory [--hh:80px] xl:[--hh:112px]"
    >
      <div
        className="relative z-10 flex items-center justify-center px-6 pb-20 pt-8 md:px-10 md:pb-28"
        style={{ minHeight: FRAME_H }}
      >
        <div className="relative z-10 mx-auto w-full max-w-4xl py-4 md:py-8">
          <span
            aria-hidden
            className="hero-glow pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,254,251,1)_0%,rgba(255,254,251,0.97)_48%,rgba(252,251,248,0.8)_70%,rgba(249,248,246,0)_100%)] opacity-40 blur-xl md:opacity-100"
          />
          <div className="flex w-full max-w-full flex-col items-center text-center">
            {/* LCP: logo e titolo senza opacity/blur iniziale */}
            <span className="hero-logo-spin block max-w-full">
              <span className="hero-logo-spin__coin mx-auto block w-fit max-w-full">
                <BrandLogo
                  tone="hero"
                  className="h-[clamp(7.5rem,min(52vw,28svh),18rem)] w-[clamp(7.5rem,min(52vw,28svh),18rem)] max-w-full drop-shadow-[0_0_40px_rgba(255,254,251,1)]"
                />
              </span>
            </span>

            <h1 className="mt-6 max-w-full break-words font-h1 text-[clamp(2.5rem,min(11vw,12svh),7rem)] leading-[1.05] text-ink [text-shadow:0_0_36px_rgba(255,254,251,0.95),0_0_72px_rgba(255,254,251,0.85)] md:mt-8 xl:text-[clamp(4.5rem,min(8vw,12svh),9rem)]">
              {titolo}
            </h1>

            <motion.div
              className="mx-auto mt-5 w-full max-w-xl md:mt-6 xl:max-w-3xl"
              variants={container}
              initial={reduce ? false : "hidden"}
              animate="show"
            >
              <motion.p
                variants={riseIn}
                className="font-display text-base leading-snug text-ink md:text-lg xl:text-[1.75rem] 2xl:text-3xl"
              >
                {brand.sottotitolo}
              </motion.p>
              <motion.p
                variants={riseIn}
                className="mt-2 text-sm leading-relaxed text-ink/80 xl:mt-3 xl:text-lg 2xl:text-xl"
              >
                {brand.descrizione}
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-8 flex w-full max-w-full flex-wrap items-center justify-center gap-3 md:mt-10"
              variants={container}
              initial={reduce ? false : "hidden"}
              animate="show"
            >
              <motion.div
                className="w-full sm:w-auto"
                variants={riseIn}
                whileHover={reduce ? undefined : hoverGlow}
                whileTap={reduce ? undefined : tapPress}
                transition={spring}
              >
                <Button to="/consulti" className={heroBtn}>
                  {home.ctaConsulto} <span aria-hidden>→</span>
                </Button>
              </motion.div>
              <motion.div
                className="w-full sm:w-auto"
                variants={riseIn}
                whileHover={reduce ? undefined : hoverGlow}
                whileTap={reduce ? undefined : tapPress}
                transition={spring}
              >
                <Button to="/percorsi" variant="paper" className={`${heroBtn} ring-1 ring-ink/15`}>
                  {cta.percorsi}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
