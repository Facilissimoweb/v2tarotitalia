import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "./BrandLogo";
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
      </svg>
      <svg viewBox="0 0 400 400" fill="none" className={`absolute inset-0 h-full w-full text-sage ${slowReverse}`}>
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

  return (
    <section ref={root} data-home-hero className="relative overflow-hidden bg-ivory">
      {/* Anello di sfondo, tagliato dal bordo: profondità senza peso */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -left-56 h-[34rem] w-[34rem] rounded-full border border-ink/10 md:-bottom-72 md:-left-72 md:h-[48rem] md:w-[48rem]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-20 px-6 py-20 md:px-10 md:py-28 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-12 lg:gap-10 lg:py-32">
        {/* Testo: colonna ampia, allineata a sinistra */}
        <div className="lg:col-span-7">
          <Reveal>
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-12 bg-sage" />
              <Kicker>{home.kicker}</Kicker>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mt-8 font-display text-[2.75rem] font-light leading-[1.05] tracking-tight text-ink sm:text-6xl md:mt-10 xl:text-7xl">
              <span className="block">{home.titolo}</span>
              <span className="block italic text-moss md:pl-12 xl:pl-24">{home.titoloCorsivo}</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-10 max-w-md border-l border-sage/60 pl-6 text-base leading-[1.85] text-ink/70 md:mt-12">
              {brand.slogan}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-12 flex flex-col gap-3 sm:flex-row md:mt-14">
              <Button to="/consulti" variant="primary" className="w-full sm:w-auto">
                {home.ctaConsulto} <span aria-hidden>→</span>
              </Button>
              <Button to="/rituali" variant="ghost" className="w-full sm:w-auto">
                {cta.ritualistica}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-10 flex flex-col items-start gap-6 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:gap-10 md:mt-12">
              <button
                type="button"
                onClick={onOpenFormazione}
                className="inline-flex items-center gap-3 border-b border-ink/30 pb-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-200 hover:border-ink hover:text-moss"
              >
                {cta.formazioneOlistica}
              </button>
              <GoogleReviewsHeroLink href="#recensioni-google" label={home.recensioni.heroCta} onMedia={false} />
            </div>
          </Reveal>
        </div>

        {/* Composizione: sigillo al centro di strati geometrici sovrapposti */}
        <div className="lg:col-span-5">
          <Reveal delay={160}>
            <div className="relative mx-auto aspect-square w-full max-w-sm sm:max-w-md lg:max-w-none">
              <Layer depth={6} className="inset-x-[8%] top-[8%] bottom-[14%] bg-mist lg:bg-linen" />

              <Layer depth={14} className="inset-0">
                <SacredGeometry />
              </Layer>

              <Layer depth={26} className="inset-[24%] bg-paper shadow-[0_32px_70px_-28px_rgba(43,37,35,0.45)] ring-1 ring-ink/10">
                <span className="absolute inset-0 flex items-center justify-center">
                  <BrandLogo tone="hero" className="h-[78%] w-[78%]" />
                </span>
              </Layer>

              <Layer depth={40} className="-bottom-4 left-2 bg-ink px-6 py-5 text-on-ink sm:-left-4">
                <p className="text-[9px] uppercase tracking-[0.22em] text-on-ink/60">{brand.name}</p>
                <p className="mt-2 font-display text-lg leading-snug">{brand.titolare}</p>
              </Layer>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mx-auto mt-16 flex max-w-sm justify-between gap-6 border-t border-ink/10 pt-4 text-[9px] uppercase tracking-[0.2em] text-ink/55 sm:max-w-md lg:max-w-none">
              <span>{brand.coords}</span>
              <span>{brand.region}</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
