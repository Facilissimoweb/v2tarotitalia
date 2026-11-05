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
  /** Titolo del foglio per il segnalibro. Solo testi da siteContent. */
  label?: string;
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

function sheetLabel(track: HTMLElement) {
  const explicit = track.getAttribute("data-sheet-label")?.replace(/\s+/g, " ").trim();
  if (explicit) return explicit;
  const kickers = [...track.querySelectorAll(".label-kicker")];
  for (const kicker of kickers) {
    if (kicker.closest("[data-widget-brand]")) continue;
    if (kicker.parentElement?.querySelector(".logo-hero-ring")) continue;
    const text = kicker.textContent?.replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  const heading = track.querySelector("h2");
  return heading?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

/**
 * Un solo motore per pagina: fogli in main + footer.
 * overflow-x: clip su html/body impedisce lo sticky CSS nativo.
 */
export function PageStackEngine() {
  const reduce = useReducedMotion();
  const { pathname } = useLocation();

  useEffect(() => {
    const markOf = () => document.querySelector<HTMLElement>("[data-sheet-bookmark]");
    const tracksOf = () => [...document.querySelectorAll<HTMLElement>(".stack-sheet")];
    const heroesOf = () =>
      [...document.querySelectorAll<HTMLElement>("[data-home-hero], [data-page-hero]")];

    const reset = () => {
      tracksOf().forEach((track) => clearTransform(sheetLift(track)));
      heroesOf().forEach(clearTransform);
      const mark = markOf();
      if (mark) {
        mark.hidden = true;
        mark.dataset.on = "0";
        mark.textContent = "";
        mark.removeAttribute("data-label");
        mark.style.top = "";
      }
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
      heroesOf().forEach(clearTransform);

      let active: HTMLElement | null = null;
      let activeTop = 0;

      tracks.forEach((track, index) => {
        const lift = sheetLift(track);
        if (!lift) return;
        track.style.zIndex = String(index + 1);
        const next = tracks[index + 1] ?? null;
        const top = track.getBoundingClientRect().top;
        const nextTop = next ? next.getBoundingClientRect().top : null;
        const y = liftY(top, nextTop, vh);
        lift.style.transform = `translate3d(0, ${y}px, 0)`;
        const liftTop = lift.getBoundingClientRect().top;
        if (liftTop <= vh * 0.62) {
          active = track;
          activeTop = liftTop;
        }
      });

      const mark = markOf();
      if (!mark) return;
      const label = active ? sheetLabel(active) : "";
      if (!active || !label) {
        mark.hidden = true;
        mark.dataset.on = "0";
        return;
      }

      const header = document.querySelector<HTMLElement>("header.site-chrome");
      const dock = document.querySelector<HTMLElement>("[data-contact-dock]");
      const minTop = Math.round((header?.getBoundingClientRect().bottom ?? 80) + 6);
      mark.hidden = false;
      mark.dataset.on = "1";
      if (mark.dataset.label !== label) {
        mark.dataset.label = label;
        mark.textContent = label;
        mark.classList.remove("is-swap");
        void mark.offsetWidth;
        mark.classList.add("is-swap");
      }
      const tabH = Math.max(mark.offsetHeight || 88, 72);
      const dockTop = dock ? dock.getBoundingClientRect().top : vh;
      const maxTop = Math.round(Math.min(vh, dockTop) - tabH - 12);
      const top = Math.min(maxTop, Math.max(minTop, Math.round(activeTop)));
      mark.style.top = `${top}px`;
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

  return <p data-sheet-bookmark className="sheet-bookmark" hidden aria-hidden="true" />;
}

export function StackSheet({ children, className = "", as = "section", id, label }: Props) {
  const layer = useContext(StackLayer);
  const Tag = as === "div" ? "div" : "section";

  return (
    <Tag
      id={id}
      className="stack-sheet"
      data-sheet-label={label || undefined}
      style={{ zIndex: layer || undefined }}
    >
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
