import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";

const { brand, chiSono, home, nav, pages } = siteContent;

const titolo = home.titolo;

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

const PHONE_FILM = "(max-width: 1023px)";

const ENTRATA = [0.22, 1, 0.36, 1] as const;

const entrata: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.16 } },
};

const entrataPezzo: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.72, ease: ENTRATA } },
};

const HERO_MOBILE_IMG = "/hero-home-mobile.jpg";

/**
 * Hero Home: sul media, a sinistra e poco sopra il bordo, il medaglione sopra «Tarot Italia» e la firma.
 * Entrano in sequenza. Sui piccoli device la foto hero; dal desktop in su il filmato largo.
 * Poi i quattro riquadri.
 */
export function HomeHero() {
  const reduce = useReducedMotion();
  const filmRef = useRef<HTMLVideoElement>(null);
  const [phone, setPhone] = useState(
    () => typeof window !== "undefined" && window.matchMedia(PHONE_FILM).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(PHONE_FILM);
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (phone) return;
    const film = filmRef.current;
    if (!film) return;
    film.muted = true;
    if (reduce !== false) {
      film.pause();
      return;
    }
    const pending = film.play();
    if (pending) pending.catch(() => {});
  }, [reduce, phone]);

  return (
    <section
      data-home-hero
      className="relative isolate flex flex-col overflow-hidden bg-ivory text-ink"
    >
      <div
        className={
          phone
            ? "relative overflow-hidden border-t border-white/10 bg-plate"
            : "relative mt-[var(--nav-offset)] overflow-hidden border-t border-white/10 bg-plate lg:border-t-0"
        }
      >
        {phone ? (
          <img
            src={HERO_MOBILE_IMG}
            alt={titolo}
            width={736}
            height={728}
            decoding="async"
            fetchPriority="high"
            className="block aspect-square max-h-[100svh] w-full object-cover object-center"
          />
        ) : (
          <video
            ref={filmRef}
            className="block h-[calc(100svh-var(--nav-offset)-19.5rem)] max-h-[48rem] min-h-[22rem] w-full object-cover object-center"
            src="/video/TAROT.mp4"
            poster="/video/TAROT-poster.webp"
            width={1280}
            height={720}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={titolo}
          />
        )}
        {phone ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[78%] bg-[linear-gradient(to_top,rgb(0_0_0/0.86)_0%,rgb(0_0_0/0.7)_38%,rgb(0_0_0/0.52)_66%,rgb(0_0_0/0.18)_88%,transparent_100%)]"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex justify-start px-4 pb-8 sm:px-6 lg:px-10 xl:px-14 xl:pb-10">
          <motion.div
            className="flex max-w-[18rem] flex-col items-start text-left text-white sm:max-w-md lg:max-w-xl [text-shadow:0_1px_12px_rgb(0_0_0/0.65),0_2px_24px_rgb(0_0_0/0.4)]"
            variants={reduce ? undefined : entrata}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            <motion.div variants={reduce ? undefined : entrataPezzo}>
              <BrandLogo
                tone="hero"
                className="mb-3.5 h-[5.25rem] w-[5.25rem] shadow-[0_12px_32px_rgb(0_0_0/0.45)] sm:mb-4 sm:h-[5.5rem] sm:w-[5.5rem] lg:mb-5 lg:h-[6.5rem] lg:w-[6.5rem] lg:shadow-none xl:h-[7.75rem] xl:w-[7.75rem]"
              />
            </motion.div>
            <motion.h1
              variants={reduce ? undefined : entrataPezzo}
              className="text-[1.75rem] leading-[1.1] text-white sm:text-[2rem] lg:text-[2.75rem]"
            >
              {brand.wordmark}
            </motion.h1>
            <motion.p
              variants={reduce ? undefined : entrataPezzo}
              className="mt-1.5 font-[family-name:var(--font-body)] text-[0.8125rem] font-normal not-italic leading-snug text-white/95 sm:mt-1 sm:text-sm lg:mt-2 lg:text-base"
            >
              {home.firma}
            </motion.p>
          </motion.div>
        </div>
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
    </section>
  );
}
