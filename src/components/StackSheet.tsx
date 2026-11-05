import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
};

const StackLayer = createContext(0);

const OVERLAP_VH = 0.48;
/** Corsa di entrata: visibile, più ampia della precedente, sempre < overlap. */
const TRAVEL_IN_VH = 0.22;
/** Corsa di uscita speculare: il foglio si tucks sotto il successivo. */
const TRAVEL_OUT_VH = 0.14;
/** Equivalente Framer `viewport={{ once: false, amount: 0.12 }}`. */
const IN_AMOUNT = 0.12;
const IN_WINDOW_VH = 0.28;
/** Inclinazione del foglio in arrivo / a riposo / in uscita (gradi). */
const TILT_IN = 1.7;
const TILT_REST = 0.45;
const TILT_OUT = 1.15;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function easeOutQuad(p: number) {
  return 1 - (1 - p) * (1 - p);
}

function easeInOut(p: number) {
  return p * p * (3 - 2 * p);
}

function liftPose(top: number, bottom: number, vh: number, hasNext: boolean, sign: number) {
  const travelIn = Math.round(vh * TRAVEL_IN_VH);
  const travelOut = Math.round(vh * TRAVEL_OUT_VH);
  const inStart = vh * (1 - IN_AMOUNT);
  const inEnd = inStart - vh * IN_WINDOW_VH;

  const pIn = clamp01((inStart - top) / (inStart - inEnd));
  const easedIn = easeOutQuad(pIn);
  const y = (1 - easedIn) * travelIn;
  const rot = sign * (TILT_IN + (TILT_REST - TILT_IN) * easedIn);

  if (!hasNext || pIn < 1) return { y, rot };

  const nextTop = bottom - vh * OVERLAP_VH;
  const pOut = clamp01((inStart - nextTop) / (inStart - inEnd));
  const easedOut = easeInOut(pOut);
  return {
    y: easedOut * travelOut,
    rot: sign * (TILT_REST + (TILT_OUT - TILT_REST) * easedOut),
  };
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

/**
 * Foglio di sezione.
 * Overlap CSS = copertura. Bordo alto obliquo = sfogliamento.
 * Transform sul foglio interno = corsa + lieve tilt, misurati sul guscio fermo.
 */
export function StackSheet({ children, className = "", as = "section", id }: Props) {
  const layer = useContext(StackLayer);
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLElement | null>(null);
  const liftRef = useRef<HTMLDivElement | null>(null);
  const Tag = as === "div" ? "div" : "section";
  const live = layer > 0 && !reduce;
  const sign = layer % 2 === 0 ? -1 : 1;

  useEffect(() => {
    if (!live) {
      if (liftRef.current) liftRef.current.style.transform = "";
      return;
    }

    let raf = 0;
    let alive = true;

    const update = () => {
      const track = trackRef.current;
      const lift = liftRef.current;
      if (!track || !lift) return;
      const rect = track.getBoundingClientRect();
      const { y, rot } = liftPose(
        rect.top,
        rect.bottom,
        window.innerHeight,
        Boolean(track.nextElementSibling),
        sign,
      );
      lift.style.transform = `translate3d(0, ${y}px, 0) rotate(${rot.toFixed(3)}deg)`;
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
    };
  }, [live, sign]);

  return (
    <Tag
      ref={(node) => {
        trackRef.current = node;
      }}
      id={id}
      className="stack-sheet"
      style={{ zIndex: layer || undefined }}
    >
      <div ref={liftRef} className={`stack-sheet-lift${className ? ` ${className}` : ""}`}>
        {children}
      </div>
    </Tag>
  );
}

type DeckProps = {
  children: ReactNode;
  className?: string;
  /** Non copre l’elemento precedente al mazzo (solo i fogli fra loro). */
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
