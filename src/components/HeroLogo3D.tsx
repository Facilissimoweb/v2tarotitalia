import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { BrandLogo } from "./BrandLogo";
import { mountHeroLogo3D, type HeroLogo3DHandle } from "../hero-3d/heroLogo3d";
import "../hero-3d/heroLogo3d.css";

type Props = {
  className?: string;
};

/**
 * Ponte React → modulo vanilla del logo 3D (solo Hero Home).
 * Con reduced-motion, errore di caricamento o WebGL assente: fallback 2D.
 */
export function HeroLogo3D({ className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduce || failed) return;
    const host = hostRef.current;
    if (!host) return;

    let alive = true;
    let handle: HeroLogo3DHandle | null = null;

    void (async () => {
      try {
        const next = await mountHeroLogo3D(host);
        if (!alive) {
          next.destroy();
          return;
        }
        handle = next;
      } catch (err) {
        console.error("[HeroLogo3D]", err);
        if (alive) setFailed(true);
      }
    })();

    return () => {
      alive = false;
      handle?.destroy();
      handle = null;
    };
  }, [reduce, failed]);

  if (reduce || failed) {
    return (
      <BrandLogo
        tone="hero"
        className={`mx-auto h-full w-full drop-shadow-[0_0_40px_rgba(255,254,251,1)] ${className}`.trim()}
      />
    );
  }

  return (
    <div
      ref={hostRef}
      className={`mx-auto ${className}`.trim()}
      role="img"
      aria-label="Logo Tarot Italia"
    />
  );
}
