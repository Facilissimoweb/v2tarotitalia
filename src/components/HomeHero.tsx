import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";
import { ChromaticImage } from "./ui/chromatic-image";

const { cta, home } = siteContent;

const titolo = home.titolo;
const HERO_IMAGE = "/A.jpg";
const HERO_BG = "#e85c12";

/** Pulsanti della Hero: più grandi solo da desktop (xl), invariati altrove. */
const heroBtn = "w-full xl:px-12 xl:py-6 xl:text-sm xl:tracking-[0.2em] 2xl:px-14 2xl:py-7 2xl:text-base";

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const riseIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const spring = { type: "spring", stiffness: 280, damping: 22 } as const;
const hoverGlow = { scale: 1.02, boxShadow: "0 0 24px rgba(249, 248, 246, 0.35)" };
const tapPress = { scale: 0.98 };

/** Altezza sotto l’header fisso (`Layout`: pt-[80px] / xl:pt-[112px]). */
const FRAME_H = "calc(100svh - var(--hh))";

/** Linea orizzontale sottile a gradiente — separatore Lumiere. */
function HeroRule() {
  return (
    <span
      aria-hidden
      className="mx-auto block h-px w-[min(12rem,42%)] bg-gradient-to-r from-transparent via-white/55 to-transparent md:w-[min(16rem,36%)]"
    />
  );
}

/**
 * Hero Home: ChromaticImage + gerarchia
 * (logo → titolo → copyright → firma → regola → competenze). Logo fermo.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1200], [0, reduce ? 0 : 220]);

  return (
    <section
      data-home-hero
      className="relative isolate overflow-hidden bg-ember text-white [--hh:80px] xl:[--hh:112px]"
    >
      <motion.div
        className="absolute inset-x-0 -top-[18%] z-0 h-[140%] will-change-transform"
        style={reduce ? undefined : { y: bgY }}
        aria-hidden
      >
        <ChromaticImage
          src={HERO_IMAGE}
          alt=""
          backgroundColor={HERO_BG}
          zoom={0.1}
          displacement={0.03}
          chromaticShift={0.012}
          tilt={0.12}
          className="h-full w-full"
        />
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgb(232_92_18_/_0.25)_0%,rgb(232_92_18_/_0.48)_43%,rgb(201_74_14_/_0.78)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ember/70 via-ember/38 to-ember-deep/74"
      />

      <div
        className="pointer-events-none relative z-10 flex items-start justify-center px-6 pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] pt-3 md:px-10 md:pb-40 md:pt-5"
        style={{ minHeight: FRAME_H }}
      >
        <div className="home-hero-copy pointer-events-auto mx-auto flex w-full max-w-3xl flex-col items-center py-1 text-center text-white md:max-w-4xl md:py-2">
          <BrandLogo
            tone="hero"
            className="logo-hero-ring mx-auto h-[clamp(4.25rem,min(20vw,11svh),7.5rem)] w-[clamp(4.25rem,min(20vw,11svh),7.5rem)] max-w-full drop-shadow-[0_0_22px_rgba(255,254,251,0.65)]"
          />

          <h1 className="mt-3 w-full font-h1 text-h1-home text-white [text-shadow:0_2px_28px_rgba(43,37,35,0.55)] md:mt-5">
            {titolo}
          </h1>

            <motion.div
              className="mx-auto w-full max-w-2xl xl:max-w-3xl"
              variants={container}
              initial={reduce ? false : "hidden"}
              animate="show"
            >
              <motion.p
                variants={riseIn}
                className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/90 md:mt-3 md:text-xs"
              >
                {home.copyright}
              </motion.p>

              <motion.p
                variants={riseIn}
                className="mt-2 font-display text-3xl font-normal leading-tight text-white [text-shadow:0_2px_22px_rgba(43,37,35,0.45)] md:mt-3 md:text-5xl xl:text-6xl"
              >
                {home.firma}
              </motion.p>

              <motion.div variants={riseIn} className="mt-4 md:mt-5">
                <HeroRule />
              </motion.div>

              <motion.p
                variants={riseIn}
                className="mt-4 text-sm font-medium leading-[1.85] text-white/90 md:mt-5 md:text-base xl:text-lg 2xl:text-xl"
              >
                {home.competenze}
              </motion.p>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="mt-6 flex w-full max-w-full flex-wrap items-center justify-center gap-3 md:mt-8 md:gap-4"
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
                <Button to="/percorsi" variant="paper" className={`${heroBtn} ring-1 ring-white/25`}>
                  {cta.percorsi}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
    </section>
  );
}
