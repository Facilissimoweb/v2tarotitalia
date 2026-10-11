type Orb = {
  /** posizione e dimensione in classi Tailwind */
  box: string;
  /** tinta smeraldo o viola con opacità ridotta */
  tone: string;
  /** durata (s) e ritardo (s) del lento respiro */
  duration: number;
  delay: number;
};

const ORBS: Orb[] = [
  { box: "left-[6%] top-[14%] h-40 w-40 md:h-56 md:w-56", tone: "bg-[#3fd69a]/20", duration: 26, delay: 0 },
  { box: "right-[10%] top-[6%] h-28 w-28 md:h-44 md:w-44", tone: "bg-[#8b5cf6]/25", duration: 32, delay: -8 },
  { box: "left-[38%] bottom-[6%] h-48 w-48 md:h-72 md:w-72", tone: "bg-[#8b5cf6]/20", duration: 38, delay: -14 },
  { box: "right-[22%] bottom-[18%] h-24 w-24 md:h-36 md:w-36", tone: "bg-[#3fd69a]/25", duration: 29, delay: -20 },
  { box: "left-[-4%] bottom-[30%] h-32 w-32 md:h-48 md:w-48", tone: "bg-[#1f9d6e]/20", duration: 35, delay: -4 },
];

type Props = {
  className?: string;
};

/**
 * Luce pulviscolo: cerchi sfocati smeraldo e viola che danno profondità allo sfondo.
 * Decorativo (aria-hidden), non intercetta il puntatore, fermo con prefers-reduced-motion.
 */
export function Bokeh({ className = "" }: Props) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}>
      {ORBS.map((orb, i) => (
        <span
          key={i}
          className={`bokeh ${orb.box} ${orb.tone} motion-safe:animate-[bokeh-drift_1s_ease-in-out_infinite]`}
          style={{ animationDuration: `${orb.duration}s`, animationDelay: `${orb.delay}s` }}
        />
      ))}
    </div>
  );
}
