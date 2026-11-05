import {
  Children,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
};

const StackLayer = createContext(0);

const OVERLAP_VH = 0.48;
const TRAVEL_IN_VH = 0.2;
const IN_AMOUNT = 0.12;
const IN_WINDOW_VH = 0.3;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function easeOutQuad(p: number) {
  return 1 - (1 - p) * (1 - p);
}

function liftY(top: number, nextTop: number | null, vh: number) {
  const travel = Math.round(vh * TRAVEL_IN_VH);
  const inStart = vh * (1 - IN_AMOUNT);
  const inEnd = inStart - vh * IN_WINDOW_VH;
  const pIn = clamp01((inStart - top) / (inStart - inEnd));
  const arrive = (1 - easeOutQuad(pIn)) * travel;
  const pinned = nextTop != null && pIn >= 1;
  const pin = pinned ? Math.max(0, Math.min(vh, vh - nextTop)) : 0;
  return arrive + pin;
}

function useOverlapPx() {
  const [px, setPx] = useState(() =>
    typeof window === "undefined" ? 360 : Math.round(window.innerHeight * OVERLAP_VH),
  );
  useEffect(() => {
    const sync = () => setPx(Math.round(window.innerHeight * OVERLAP_VH));
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  return px;
}

function clearTransform(el: HTMLElement | null) {
  if (!el) return;
  el.style.transform = "";
  el.style.willChange = "";
}

function sheetLift(track: HTMLElement) {
  return track.querySelector<HTMLElement>(":scope > .stack-sheet-lift");
}

/**
 * Un solo motore per pagina: fogli in main + footer.
 * overflow-x: clip su html/body impedisce lo sticky CSS nativo.
 */
export function PageStackEngine() {
  const reduce = useReducedMotion();
  const { pathname } = useLocation();

  useEffect(() => {
    const heroes = () =>
      [...document.querySelectorAll<HTMLElement>("[data-home-hero], [data-page-hero]")];
    const tracksOf = () => [...document.querySelectorAll<HTMLElement>(".stack-sheet")];

    const reset = () => {
      tracksOf().forEach((track) => clearTransform(sheetLift(track)));
      heroes().forEach(clearTransform);
    };

    if (reduce) {
      reset();
      return;
    }

    let raf = 0;
    let alive = true;

    const update = () => {
      const tracks = tracksOf();
      const vh = window.innerHeight;
      const first = tracks.find((track) => !track.matches("[data-site-footer]"));
      const flush = Boolean(first?.closest(".stack-deck--flush"));
      const hero = !flush ? (heroes()[0] ?? null) : null;

      if (hero && first) {
        const firstTop = first.getBoundingClientRect().top;
        const pin = Math.max(0, Math.min(vh, vh - firstTop));
        hero.style.willChange = pin ? "transform" : "";
        hero.style.transform = pin ? `translate3d(0, ${pin}px, 0)` : "";
      }

      tracks.forEach((track, index) => {
        const lift = sheetLift(track);
        if (!lift) return;
        track.style.zIndex = String(index + 1);
        const next = tracks[index + 1] ?? null;
        const top = track.getBoundingClientRect().top;
        const nextTop = next ? next.getBoundingClientRect().top : null;
        const y = liftY(top, nextTop, vh);
        lift.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };

    const loop = () => {
      if (!alive) return;
      update();
      raf = requestAnimationFrame(loop);
    };

    const onScroll = () => update();
    const scroller = document.scrollingElement;

    update();
    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("scroll", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll, true);
      scroller?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      reset();
    };
  }, [reduce, pathname]);

  return null;
}

export function StackSheet({ children, className = "", as = "section", id }: Props) {
  const layer = useContext(StackLayer);
  const Tag = as === "div" ? "div" : "section";

  return (
    <Tag id={id} className="stack-sheet" style={{ zIndex: layer || undefined }}>
      <div className={`stack-sheet-lift${className ? ` ${className}` : ""}`}>{children}</div>
    </Tag>
  );
}

type DeckProps = {
  children: ReactNode;
  className?: string;
  flush?: boolean;
};

export function StackDeck({ children, className = "", flush = false }: DeckProps) {
  const reduce = useReducedMotion();
  const overlap = useOverlapPx();

  return (
    <div
      className={`stack-deck${flush ? " stack-deck--flush" : ""}${reduce ? " stack-deck--static" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={reduce ? undefined : { ["--stack-overlap" as string]: `${overlap}px` }}
    >
      {Children.map(children, (child, index) => (
        <StackLayer.Provider value={index + 1}>{child}</StackLayer.Provider>
      ))}
    </div>
  );
}
