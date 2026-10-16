import { useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./Button";

const { brand, cta, home } = siteContent;

const titolo = home.titolo;

/** Pulsanti della Hero: più grandi solo da desktop (xl), invariati altrove. */
const heroBtn = "w-full xl:px-12 xl:py-6 xl:text-sm xl:tracking-[0.22em] 2xl:px-14 2xl:py-7 2xl:text-base";

const VIDEO_SRC = "/videos/hero-sfondo.mp4";
const POSTER_SRC = "/hero-sfondo.webp";

/* ───────── Animazioni (Motion) ───────── */
const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

/** Logo e titolo: dissolvenza con leggera sfocatura che si schiarisce. */
const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  show: { opacity: 1, filter: "blur(0px)", transition: { duration: 1, ease } },
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
 * Hero della Home: video verticale in loop come sfondo, poster statico
 * se l’utente preferisce il movimento ridotto. Le pagine interne usano `PageBanner`.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const host = section.current;
    const el = video.current;
    if (!host || !el || reduce) return;
    el.muted = true;
    el.defaultMuted = true;
    const play = () => {
      void el.play().catch(() => {});
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else el.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section
      ref={section}
      data-home-hero
      className="relative isolate overflow-x-clip bg-ivory [--hh:80px] xl:[--hh:112px]"
    >
      <div
        className="relative flex items-center justify-center overflow-hidden px-6 pb-32 pt-8 md:px-10"
        style={{ minHeight: FRAME_H }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {reduce ? (
            <img src={POSTER_SRC} alt="" className="h-full w-full object-cover object-[center_42%]" />
          ) : (
            <video
              ref={video}
              className="h-full w-full object-cover object-[center_42%]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={POSTER_SRC}
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
          )}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[clamp(5rem,16svh,9rem)] bg-gradient-to-t from-ivory via-ivory/70 to-transparent"
        />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-[clamp(1rem,3svh,4rem)] md:px-12">
          <span
            aria-hidden
            className="hero-glow pointer-events-none absolute -inset-x-[22%] -inset-y-[14%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,254,251,1)_0%,rgba(255,254,251,0.97)_48%,rgba(252,251,248,0.8)_70%,rgba(249,248,246,0)_100%)] blur-xl"
          />
          <motion.div
            className="flex flex-col items-center text-center"
            variants={container}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            <motion.span className="block" variants={blurIn}>
              <BrandLogo
                tone="hero"
                className="mx-auto h-[clamp(10rem,min(64vw,34svh),20rem)] w-[clamp(10rem,min(64vw,34svh),20rem)] drop-shadow-[0_0_40px_rgba(255,254,251,1)]"
              />
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
                <Button to="/rituali" variant="paper" className={`${heroBtn} ring-1 ring-ink/15`}>
                  {cta.ritualistica}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
