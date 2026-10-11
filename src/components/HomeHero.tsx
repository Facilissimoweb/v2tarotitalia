import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "./Button";
import { GoogleReviewsHeroLink } from "./PageHero";
import { Reveal } from "./Reveal";

const { brand, cta, home } = siteContent;

type Props = {
  onOpenFormazione: () => void;
};

/**
 * Profondità a strati: il puntatore sposta ogni livello in misura diversa
 * (variabili CSS --px / --py, nessun re-render React). Disattivata su touch
 * e con prefers-reduced-motion.
 */
function useDepth(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    let frame = 0;
    const set = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
      });
    };
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      set(((event.clientX - rect.left) / rect.width - 0.5) * 2, ((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    const onLeave = () => set(0, 0);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}

/**
 * Parallasse allo scroll: --sy cresce con lo scorrimento (10% della distanza),
 * limitato al margine extra dell'immagine. Attivo solo con la hero visibile;
 * disattivato con prefers-reduced-motion.
 */
function useScrollParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const shift = Math.min(Math.max(-rect.top * 0.1, 0), rect.height * 0.07);
      el.style.setProperty("--sy", shift.toFixed(1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
}

function Layer({
  depth,
  className = "",
  children,
}: {
  depth: number;
  className?: string;
  children?: ReactNode;
}) {
  const style: CSSProperties = {
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)`,
  };
  return (
    <div
      aria-hidden
      className={`absolute transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/** Geometria sacra in due livelli controrotanti: puro SVG, nessun asset. */
function SacredGeometry() {
  const slow = "motion-safe:animate-[spin_140s_linear_infinite]";
  const slowReverse = "motion-safe:animate-[spin_110s_linear_infinite_reverse]";
  return (
    <>
      <svg viewBox="0 0 400 400" fill="none" className={`absolute inset-0 h-full w-full text-ink/25 ${slow}`}>
        <defs>
          <mask id="hero-seal-hole-a">
            <rect width="400" height="400" fill="white" />
            <circle cx="200" cy="200" r="126" fill="black" />
          </mask>
        </defs>
        <g mask="url(#hero-seal-hole-a)">
          <circle cx="200" cy="200" r="196" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle
            cx="200"
            cy="200"
            r="152"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 7"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M200 4 369.7 298 30.3 298Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
      <svg viewBox="0 0 400 400" fill="none" className={`absolute inset-0 h-full w-full text-sage ${slowReverse}`}>
        <defs>
          <mask id="hero-seal-hole-b">
            <rect width="400" height="400" fill="white" />
            <circle cx="200" cy="200" r="126" fill="black" />
          </mask>
        </defs>
        <g mask="url(#hero-seal-hole-b)">
          <path
            d="M200 4 396 200 200 396 4 200Z"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <rect
            x="92"
            y="92"
            width="216"
            height="216"
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <circle cx="200" cy="4" r="3" fill="currentColor" />
        <circle cx="396" cy="200" r="3" fill="currentColor" />
        <circle cx="200" cy="396" r="3" fill="currentColor" />
        <circle cx="4" cy="200" r="3" fill="currentColor" />
      </svg>
    </>
  );
}

export function HomeHero({ onOpenFormazione }: Props) {
  const root = useRef<HTMLElement>(null);
  useDepth(root);
  useScrollParallax(root);

  return (
    <section ref={root} data-home-hero className="relative overflow-hidden bg-ivory">
      {/* Anello di sfondo, tagliato dal bordo: profondità senza peso */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -left-56 h-[34rem] w-[34rem] rounded-full border border-ink/10 md:-bottom-72 md:-left-72 md:h-[48rem] md:w-[48rem]"
      />

      {/*
        Il Matto in formato copertina, ancorato sul lato destro dello schermo (il volto
        resta fuori dal sigillo): scorre con la pagina a velocità ridotta (parallasse).
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-[7%] left-[30%] h-[107%] w-[70%] will-change-transform min-[1200px]:left-[65%] min-[1200px]:w-[55%]"
          style={{
            transform: "translate3d(0, calc(var(--sy, 0) * 1px), 0)",
            // Bordo sinistro sfumato: niente taglio netto sulla figura ritagliata
            maskImage: "linear-gradient(to right, transparent, #000 16%)",
            WebkitMaskImage: "linear-gradient(to right, transparent, #000 16%)",
          }}
        >
          {/* object-position: il volto (circa 27% dell'altezza) resta sempre nel primo schermo */}
          <img
            src="/matto-hero.png"
            alt=""
            decoding="async"
            className="h-full w-full object-cover object-[30%_22%] opacity-50 mix-blend-multiply"
          />
        </div>
        {/* Velo ivory solo sul lato del testo: il volto resta libero */}
        <div className="absolute inset-0 bg-gradient-to-r from-ivory/60 via-ivory/5 via-35% to-transparent min-[1200px]:from-ivory/90 min-[1200px]:via-ivory/30" />
      </div>

      {/*
        Fino a 1199px (mobile, tablet, laptop medi): colonna unica centrata. Le due
        colonne diventano `contents`, così ogni blocco è un elemento diretto della
        griglia e si riordina con `order-*`:
        1 titolo · 2 logo · 3 sottotitolo · 4 CTA · 5 link secondari.
        Da 1200px in su le colonne tornano blocchi e la struttura è quella desktop a due colonne.
      */}
      <div className="relative mx-auto grid w-full max-w-3xl items-center gap-0 px-6 py-20 md:px-10 md:py-28 min-[1200px]:min-h-[calc(100svh-7rem)] min-[1200px]:max-w-7xl min-[1200px]:grid-cols-12 min-[1200px]:gap-10 min-[1200px]:py-32">
        {/* Testo: colonna ampia, allineata a sinistra */}
        <div className="contents min-[1200px]:col-span-7 min-[1200px]:block">
          <Reveal className="order-1 min-[1200px]:order-none">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-12 bg-sage" />
              <Kicker>{home.kicker}</Kicker>
            </div>
          </Reveal>

          <Reveal delay={100} className="order-1 min-[1200px]:order-none">
            <h1 className="mt-8 font-display text-[2.75rem] font-light leading-[1.05] tracking-tight text-ink sm:text-6xl md:mt-10 xl:text-7xl">
              <span className="block">{home.titolo}</span>
              <span className="block italic text-moss md:pl-12 xl:pl-24">{home.titoloCorsivo}</span>
            </h1>
          </Reveal>

          <Reveal delay={200} className="order-3 min-[1200px]:order-none">
            <p className="mt-10 max-w-md border-l border-sage/60 bg-ivory/90 py-4 pl-6 pr-4 text-base leading-[1.85] text-ink/85 backdrop-blur-sm md:mt-12">
              {brand.slogan}
            </p>
          </Reveal>

          <Reveal delay={300} className="order-4 min-[1200px]:order-none">
            <div className="mt-12 flex flex-col gap-3 sm:flex-row md:mt-14">
              <Button to="/consulti" variant="primary" className="w-full sm:w-auto">
                {home.ctaConsulto} <span aria-hidden>→</span>
              </Button>
              <Button to="/rituali" variant="ghost" className="w-full bg-ivory/90! hover:bg-mist! sm:w-auto">
                {cta.ritualistica}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={380} className="order-5 min-[1200px]:order-none">
            <div className="mt-10 flex flex-col items-start gap-6 border-t border-ink/10 pt-8 md:mt-12 min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:gap-10">
              <button
                type="button"
                onClick={onOpenFormazione}
                className="inline-flex items-center gap-3 border-b border-ink/30 bg-ivory/90 px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-200 hover:border-ink hover:text-moss"
              >
                {cta.formazioneOlistica}
              </button>
              <GoogleReviewsHeroLink href="#recensioni-google" label={home.recensioni.heroCta} onMedia={false} />
            </div>
          </Reveal>
        </div>

        {/* Composizione: sigillo al centro di strati geometrici sovrapposti */}
        <div className="contents min-[1200px]:col-span-5 min-[1200px]:block">
          <Reveal
            delay={160}
            className="order-2 mt-12 md:mt-16 min-[1200px]:order-none min-[1200px]:m-0"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[15rem] sm:max-w-[18rem] min-[1200px]:max-w-[21rem]">
              <Layer depth={14} className="inset-0">
                <SacredGeometry />
              </Layer>

              {/* Solo il sigillo: PNG già trasparente, nessuna maschera, cornice o riquadro */}
              <Layer depth={26} className="inset-[12%]">
                <img src={brand.logoHero} alt="" className="h-full w-full object-contain" />
              </Layer>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
