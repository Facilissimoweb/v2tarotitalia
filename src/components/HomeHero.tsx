import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { NavLink } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";

const { brand, chiSono, home, nav, pages } = siteContent;

const titolo = home.titolo;

/** Stesse icone del menù mobile (MobileSideRail). */
function PersonIcon() {
  return (
    <svg
      className="home-action-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5 C7 16.8 9.2 15.4 12 15.4 C14.8 15.4 17 16.8 18.5 19.5" />
    </svg>
  );
}

function ConsultiIcon() {
  return (
    <svg
      className="home-action-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 4 H15 L17 6 V20 H7 Z" />
      <path d="M9 8 H13 M9 12 H13 M9 16 H11" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg
      className="home-action-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 19 C5 12 10 12 12 8 C14 12 19 12 19 19" />
      <circle cx="12" cy="5" r="2" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg
      className="home-action-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 5 H19 V19 H5 Z" />
      <path d="M8 9 H16 M8 12 H16 M8 15 H13" />
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
    icon: <PersonIcon />,
  },
  {
    n: "02",
    titolo: nav.consulti,
    testo: home.percorsi.letture[0].testo,
    to: "/consulti",
    icon: <ConsultiIcon />,
  },
  {
    n: "03",
    titolo: nav.percorsi,
    testo: pages.percorsi.titolo,
    to: "/percorsi",
    icon: <PathIcon />,
  },
  {
    n: "04",
    titolo: nav.blog,
    testo: pages.blog.leggi,
    to: "/blog",
    icon: <BlogIcon />,
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
