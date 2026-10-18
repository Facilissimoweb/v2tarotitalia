import { motion, useReducedMotion, type Variants } from "motion/react";
import { siteContent } from "../data/siteContent";
import { HeroLogo3D } from "./HeroLogo3D";
import { Button } from "./Button";

const { brand, cta, home } = siteContent;

const titolo = home.titolo;

/** Pulsanti della Hero: più grandi solo da desktop (xl), invariati altrove. */
const heroBtn = "w-full xl:px-12 xl:py-6 xl:text-sm xl:tracking-[0.22em] 2xl:px-14 2xl:py-7 2xl:text-base";

/* ───────── Animazioni (Motion) ───────── */
const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

/** Titolo: dissolvenza con leggera sfocatura che si schiarisce. */
const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  show: { opacity: 1, filter: "blur(0px)", transition: { duration: 1, ease } },
};

/** Logo 3D: solo opacity — `filter` crea un containing block che taglia il cerchio. */
const logoIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease } },
};

/** Sottotitolo, descrizione e pulsanti: dissolvenza con salita di 15 px. */
const riseIn: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

/** Micro-interazioni dei pulsanti: molla morbida, bagliore sage discreto. */
const spring = { type: "spring", stiffness: 300, damping: 20 } as const;
const hoverGlow = { scale: 1.03, boxShadow: "0 0 28px rgba(122, 139, 120, 0.45)" };
const tapPress = { scale: 0.97 };

/** Altezza dello spazio visibile sotto l'header fisso (vedi `Layout`: pt-20 / xl:pt-28). */
const FRAME_H = "calc(100svh - var(--hh))";

/**
 * Hero della Home su fondo ivory.
 * Su piccoli schermi: angelo a sinistra come marca d’acqua; da md in su solo ivory.
 * Le pagine interne usano `PageBanner`.
 */
export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section
      data-home-hero
      className="relative isolate bg-ivory [--hh:80px] xl:[--hh:112px]"
    >
      {/* Angelo: solo mobile, fondo chiaro, un po’ a sinistra */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden md:hidden"
      >
        <img
          src="/hero-angelo-light.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[18%_center] opacity-[0.5]"
        />
      </div>

      <div
        className="relative z-10 flex items-center justify-center px-6 pb-32 pt-8 md:px-10"
        style={{ minHeight: FRAME_H }}
      >
        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-[clamp(1rem,3svh,4rem)] md:px-12">
          <span
            aria-hidden
            className="hero-glow pointer-events-none absolute -inset-x-[22%] -inset-y-[14%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,254,251,1)_0%,rgba(255,254,251,0.97)_48%,rgba(252,251,248,0.8)_70%,rgba(249,248,246,0)_100%)] opacity-40 blur-xl md:opacity-100"
          />
          <motion.div
            className="flex flex-col items-center text-center"
            variants={container}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            <motion.span
              className="block h-[clamp(14rem,min(78vw,48svh),28rem)] w-[clamp(14rem,min(78vw,48svh),28rem)]"
              variants={logoIn}
            >
              <HeroLogo3D className="h-full w-full" />
            </motion.span>

            <motion.h1
              variants={blurIn}
              className="mt-[clamp(1rem,3svh,2rem)] font-h1 text-[clamp(3.5rem,min(14vw,14svh),8.5rem)] leading-[1] text-ink [text-shadow:0_0_36px_rgba(255,254,251,0.95),0_0_72px_rgba(255,254,251,0.85)] xl:text-[clamp(6rem,min(9vw,15svh),10.5rem)]"
            >
              {titolo}
            </motion.h1>

            <div className="mx-auto mt-[clamp(0.75rem,2.4svh,1.75rem)] max-w-xl xl:max-w-3xl">
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
            </div>

            <motion.div
              variants={riseIn}
              className="mt-[clamp(1rem,3svh,1.75rem)] flex w-full flex-wrap items-center justify-center gap-3"
            >
              <motion.div
                className="w-full sm:w-auto"
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
                whileHover={reduce ? undefined : hoverGlow}
                whileTap={reduce ? undefined : tapPress}
                transition={spring}
              >
                <Button to="/percorsi" variant="paper" className={`${heroBtn} ring-1 ring-ink/15`}>
                  {cta.percorsi}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
