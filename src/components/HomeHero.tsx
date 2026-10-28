import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";
import { ChromaticImage } from "./ui/chromatic-image";

const { brand, cta, home } = siteContent;

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

/** Ornamento vettoriale (LINEA A) sotto il titolo della Hero Home. */
function HeroOrnament() {
  return (
    <img
      src="/linea-hero.svg"
      alt=""
      aria-hidden
      className="mx-auto block h-[clamp(2.15rem,6.5vw,3.15rem)] w-auto max-w-[min(22rem,78%)] object-contain drop-shadow-[0_1px_10px_rgba(43,37,35,0.45)]"
    />
  );
}

/**
 * Hero Home: ChromaticImage + gerarchia tipografica ariosa
 * (titolo → ornamento → sottotitolo → regola → descrizione). Logo fermo.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1200], [0, reduce ? 0 : 220]);

  return (
    <section
      data-home-hero
      className="relative isolate overflow-hidden bg-[#e85c12] text-white [--hh:80px] xl:[--hh:112px]"
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
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgb(232_92_18_/_0.08)_0%,rgb(232_92_18_/_0.28)_48%,rgb(232_92_18_/_0.62)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#e85c12]/50 via-[#e85c12]/18 to-[#c94a0e]/58"
      />

      <div
        className="pointer-events-none relative z-10 flex items-center justify-center px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-16"
        style={{ minHeight: FRAME_H }}
      >
        <div className="home-hero-copy pointer-events-auto mx-auto flex w-full max-w-3xl flex-col items-center py-6 text-center text-white md:max-w-4xl md:py-10">
          <BrandLogo
            tone="hero"
            className="logo-hero-ring mx-auto h-[clamp(6.75rem,min(40vw,23svh),13.25rem)] w-[clamp(6.75rem,min(40vw,23svh),13.25rem)] max-w-full drop-shadow-[0_0_22px_rgba(255,254,251,0.65)]"
          />

          <h1 className="mt-9 w-full font-h1 text-h1-home text-white [text-shadow:0_2px_28px_rgba(43,37,35,0.55)] md:mt-12">
            {titolo}
          </h1>

            {/* Ornamento LINEA A sotto il titolo */}
            <div className="mt-8 w-full md:mt-10">
              <HeroOrnament />
            </div>

            <motion.div
              className="mx-auto w-full max-w-2xl xl:max-w-3xl"
              variants={container}
              initial={reduce ? false : "hidden"}
              animate="show"
            >
              {/* 2 · Sottotitolo ufficiale */}
              <motion.p
                variants={riseIn}
                className="mt-8 font-display text-base leading-relaxed text-white md:mt-10 md:text-lg xl:text-[1.5rem] 2xl:text-2xl"
              >
                {brand.sottotitolo}
              </motion.p>

              {/* Separatore sotto il sottotitolo */}
              <motion.div variants={riseIn} className="mt-8 md:mt-10">
                <HeroRule />
              </motion.div>

              {/* 3 · Descrizione / competenze */}
              <motion.p
                variants={riseIn}
                className="mt-8 text-sm font-medium leading-[1.85] text-white/90 md:mt-10 md:text-base xl:text-lg 2xl:text-xl"
              >
                {brand.descrizione}
              </motion.p>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="mt-12 flex w-full max-w-full flex-wrap items-center justify-center gap-4 md:mt-16"
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
