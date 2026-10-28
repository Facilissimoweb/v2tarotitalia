import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";
import { ChromaticImage } from "./ui/chromatic-image";

const { brand, cta, home } = siteContent;

const titolo = home.titolo;
/** Split ufficiale "Tarot Italia" → a capo solo su mobile. */
const [titoloLead = titolo, titoloTrail = ""] = titolo.split(/\s+/, 2);
const HERO_IMAGE_DESKTOP = "/hero-home.webp";
const HERO_IMAGE_MOBILE = "/hero-home-mobile.jpg";
const MOBILE_HERO_MQ = "(max-width: 767px)";

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
 * Hero Home: ChromaticImage + gerarchia tipografica ariosa
 * (titolo → regola → sottotitolo → regola → descrizione). Logo fermo.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const [heroSrc, setHeroSrc] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_HERO_MQ).matches
      ? HERO_IMAGE_MOBILE
      : HERO_IMAGE_DESKTOP,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_HERO_MQ);
    const sync = () => setHeroSrc(mq.matches ? HERO_IMAGE_MOBILE : HERO_IMAGE_DESKTOP);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      data-home-hero
      className="relative isolate overflow-x-hidden bg-mist text-white [--hh:80px] xl:[--hh:112px]"
    >
      <ChromaticImage
        src={heroSrc}
        alt={brand.wordmark}
        backgroundColor="#efece7"
        zoom={0.1}
        displacement={0.03}
        chromaticShift={0.012}
        tilt={0.12}
        className="w-full"
      >
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/45 via-ink/25 to-ink/55" />

        <div
          className="pointer-events-none relative z-10 flex items-center justify-center px-6 pb-24 pt-12 md:px-10 md:pb-32 md:pt-16"
          style={{ minHeight: FRAME_H }}
        >
          <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col items-center py-6 text-center text-white md:max-w-4xl md:py-10">
            {/* Logo: immobile */}
            <BrandLogo
              tone="hero"
              className="mx-auto h-[clamp(7.5rem,min(52vw,28svh),18rem)] w-[clamp(7.5rem,min(52vw,28svh),18rem)] max-w-full drop-shadow-[0_0_40px_rgba(255,254,251,1)]"
            />

            {/* 1 · Titolo: su mobile "Tarot" / "Italia" a capo; "Italia" più ampia in orizzontale */}
            <h1 className="mt-10 max-w-full font-h1 text-[clamp(3.25rem,min(15vw,18svh),8.5rem)] leading-[1.05] text-white [text-shadow:0_2px_28px_rgba(43,37,35,0.55)] md:mt-14 md:leading-[1.02] xl:text-[clamp(5.75rem,min(11vw,18svh),11.5rem)]">
              <span className="block md:inline">{titoloLead}</span>
              {titoloTrail ? (
                <>
                  <span className="hidden md:inline"> </span>
                  <span className="mt-1 block w-full text-[1.12em] md:mt-0 md:inline md:w-auto md:text-[1em]">
                    {titoloTrail}
                  </span>
                </>
              ) : null}
            </h1>

            {/* Separatore sotto il titolo */}
            <div className="mt-8 w-full md:mt-10">
              <HeroRule />
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
      </ChromaticImage>
    </section>
  );
}
