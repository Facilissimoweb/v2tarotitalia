import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";

const { brand, chiSono, home, nav, pages } = siteContent;

const titolo = home.titolo;

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="home-action-icon">
      <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.9 5.9l1.55 1.55M16.55 16.55l1.55 1.55M18.1 5.9l-1.55 1.55M7.45 16.55l-1.55 1.55"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="home-action-icon">
      <path
        d="M12 3.75c-4.7 0-8.25 3.2-8.25 7.35 0 2.85 1.7 5.2 4.25 6.35.35.15.7-.1.7-.48v-.7c0-1.7 1.38-3.08 3.08-3.08h3.72c2.55 0 4.75-1.9 4.75-4.35C20.25 6.2 16.7 3.75 12 3.75Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8.2" cy="9.2" r="0.95" fill="currentColor" />
      <circle cx="11.35" cy="7.55" r="0.95" fill="currentColor" />
      <circle cx="14.85" cy="8.15" r="0.95" fill="currentColor" />
      <circle cx="16.1" cy="11.2" r="0.95" fill="currentColor" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="home-action-icon">
      <path
        d="M12 4.5 4.75 8.35 12 12.2l7.25-3.85L12 4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m4.75 12 7.25 3.85L19.25 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m4.75 15.65 7.25 3.85 7.25-3.85"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="home-action-icon">
      {[6, 12, 18].flatMap((y) =>
        [6, 12, 18].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

const azioni: ReadonlyArray<{
  n: string;
  titolo: string;
  testo: string;
  to: string;
  icon: ReactNode;
}> = [
  {
    n: "01",
    titolo: nav.chiSono,
    testo: chiSono.sottotitolo,
    to: "/chi-sono",
    icon: <IconSun />,
  },
  {
    n: "02",
    titolo: nav.consulti,
    testo: home.percorsi.letture[0].testo,
    to: "/consulti",
    icon: <IconPalette />,
  },
  {
    n: "03",
    titolo: nav.percorsi,
    testo: pages.percorsi.titolo,
    to: "/percorsi",
    icon: <IconLayers />,
  },
  {
    n: "04",
    titolo: nav.blog,
    testo: pages.blog.leggi,
    to: "/blog",
    icon: <IconGrid />,
  },
];

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
 * Poi i quattro riquadri neumorfici.
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
            ? "relative overflow-hidden bg-plate"
            : "relative mt-[var(--nav-offset)] overflow-hidden border-t border-white/10 bg-plate lg:border-t-0"
        }
      >
        {phone ? (
          <img
            src={HERO_MOBILE_IMG}
            alt={titolo}
            width={1200}
            height={1467}
            decoding="async"
            fetchPriority="high"
            className="block aspect-[4/5] max-h-[100svh] w-full object-cover object-top"
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
            className="home-hero-scrim pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[78%]"
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

      <div className="home-action-grid relative z-[2] grid grid-cols-2 xl:grid-cols-4">
        {azioni.map((azione) => (
          <NavLink
            key={azione.n}
            to={azione.to}
            className="home-action-btn group flex flex-col text-ink"
          >
            <span className="home-action-top">
              <span className="home-action-index">{azione.n}</span>
              <span className="home-action-glyph" aria-hidden>
                {azione.icon}
              </span>
            </span>
            <span className="home-action-title">{azione.titolo}</span>
            <span className="home-action-copy">{azione.testo}</span>
          </NavLink>
        ))}
      </div>
    </section>
  );
}
