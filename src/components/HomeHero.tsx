import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";
import { ChromaticImage } from "./ui/chromatic-image";

const { cta, home } = siteContent;

const titolo = home.titolo;
const HERO_IMAGE = "/A.jpg";
const HERO_BG = "#111111";

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
const hoverGlow = { scale: 1.02, boxShadow: "0 0 22px rgba(61, 204, 74, 0.32)" };
const tapPress = { scale: 0.98 };

/** Altezza sotto l’header fisso (`Layout`: pt-[80px] / xl:pt-[112px]). */
const FRAME_H = "calc(100svh - var(--hh))";

/** Ornamento vettoriale (LINEA A) sotto la firma. */
function HeroOrnament() {
  return (
    <img
      src="/linea-hero.svg"
      alt=""
      aria-hidden
      className="mx-auto block h-[clamp(2.15rem,6.5vw,3.15rem)] w-auto max-w-[min(22rem,78%)] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]"
    />
  );
}

/**
 * Hero Home: ChromaticImage + gerarchia
 * (logo → titolo → copyright → firma → ornamento → competenze). Logo fermo.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1200], [0, reduce ? 0 : 220]);

  return (
    <section
      data-home-hero
      className="relative isolate overflow-hidden bg-[#111111] text-on-ink [--hh:80px] xl:[--hh:112px]"
    >
      <motion.div
        className="absolute inset-x-0 -top-[18%] z-0 h-[140%] will-change-transform"
        style={reduce ? undefined : { y: bgY }}
        aria-hidden
      >
        <div className="hero-bronze-plate h-full w-full">
          <ChromaticImage
            src={HERO_IMAGE}
            alt=""
            backgroundColor={HERO_BG}
            zoom={0.1}
            displacement={0.03}
            chromaticShift={0.012}
            tilt={0.12}
            className="h-full w-full bg-[#111111]"
          />
        </div>
      </motion.div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[#2E9E3F] mix-blend-color opacity-[0.42]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[#2E9E3F]/16 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgb(8_4_2_/_0.18)_0%,rgb(10_5_3_/_0.12)_50%,rgb(6_3_2_/_0.4)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#140805]/36 via-transparent to-[#080402]/46"
      />

      <div aria-hidden className="hero-rays z-[2]">
        <div className="hero-rays__halo" />
        <div className="hero-rays__beams" />
        <div className="hero-rays__beams--b" />
        <div className="hero-rays__dust" />
      </div>

      <div
        className="pointer-events-none relative z-10 flex items-start justify-center px-6 pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] pt-3 md:px-10 md:pb-40 md:pt-5"
        style={{ minHeight: FRAME_H }}
      >
        <div className="home-hero-copy pointer-events-auto relative mx-auto flex w-full max-w-3xl flex-col items-center py-1 text-center text-[#EDE4D4] md:max-w-4xl md:py-2">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[-18%] inset-y-[-6%] z-0 bg-[radial-gradient(ellipse_at_center,rgb(0_0_0_/_0.28)_0%,rgb(0_0_0_/_0.12)_52%,transparent_78%)]"
          />
          <BrandLogo
            tone="hero"
            finish="metal"
            className="relative z-[1] mx-auto h-[clamp(8rem,min(48vw,28svh),15.75rem)] w-[clamp(8rem,min(48vw,28svh),15.75rem)] max-w-full"
          />

          <h1 className="relative z-[1] mt-3 w-full font-h1 text-h1-home text-h1-metal md:mt-5">
            {titolo}
          </h1>

            <motion.div
              className="relative z-[1] mx-auto w-full max-w-2xl xl:max-w-3xl"
              variants={container}
              initial={reduce ? false : "hidden"}
              animate="show"
            >
              <motion.p
                variants={riseIn}
                className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#C9BBA8] [text-shadow:0_1px_10px_rgba(0,0,0,0.85),0_0_24px_rgba(0,0,0,0.55)] md:mt-3 md:text-xs xl:font-bold"
              >
                {home.copyright}
              </motion.p>

              <motion.p
                variants={riseIn}
                className="mt-2 font-display text-3xl font-normal leading-tight text-[#EDE4D4] [text-shadow:0_2px_16px_rgba(0,0,0,0.88),0_0_36px_rgba(0,0,0,0.55)] md:mt-3 md:text-5xl xl:text-6xl xl:font-bold"
              >
                {home.firma}
              </motion.p>

              <motion.div variants={riseIn} className="mt-4 md:mt-5">
                <HeroOrnament />
              </motion.div>

              <motion.p
                variants={riseIn}
                className="mt-4 font-display text-xl font-normal leading-snug text-[#E0D4C4] [text-shadow:0_2px_16px_rgba(0,0,0,0.86),0_0_32px_rgba(0,0,0,0.5)] md:mt-5 md:text-2xl xl:text-3xl xl:font-bold"
              >
                {home.competenze}
              </motion.p>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="relative z-[1] mt-6 flex w-full max-w-full flex-wrap items-center justify-center gap-3 md:mt-8 md:gap-4"
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
                <Button to="/consulti" className={`${heroBtn} !bg-[#0d2a0a] !text-[#EDE4D4] hover:!bg-[#143a12]`}>
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
                <Button to="/percorsi" className={`${heroBtn} !bg-[#cde8c4] !text-[#0d2a0a] hover:!bg-[#bcdcb2]`}>
                  {cta.percorsi}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
    </section>
  );
}
