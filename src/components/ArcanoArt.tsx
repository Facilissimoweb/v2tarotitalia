import type { Arcano } from "../data/arcani";

type Props = {
  arcano: Arcano;
  className?: string;
};

export function ArcanoArt({ arcano, className = "" }: Props) {
  const { id, roman } = arcano;
  return (
    <svg
      viewBox="0 0 160 240"
      className={`block h-full w-full ${className}`}
      role="img"
      aria-label={`${arcano.name}, arcano ${roman}`}
    >
      <rect width="160" height="240" fill="#F9F8F6" />
      <rect x="8" y="8" width="144" height="224" fill="none" stroke="#2B2523" strokeWidth="0.8" />
      <rect x="14" y="14" width="132" height="212" fill="none" stroke="#7A8B78" strokeWidth="0.4" />
      <text
        x="80"
        y="32"
        textAnchor="middle"
        fill="#7A8B78"
        fontFamily="Inter, sans-serif"
        fontSize="8"
        letterSpacing="3"
      >
        {roman}
      </text>
      <g transform="translate(80 118)" fill="none" stroke="#2B2523" strokeWidth="1">
        {glyph(id)}
      </g>
      <text
        x="80"
        y="214"
        textAnchor="middle"
        fill="#2B2523"
        fontFamily="Noto Serif, serif"
        fontSize="9"
        letterSpacing="1.5"
      >
        {arcano.french.toUpperCase()}
      </text>
    </svg>
  );
}

function glyph(id: number) {
  switch (id) {
    case 0:
      return (
        <>
          <circle r="28" strokeDasharray="2 3" />
          <path d="M-8 18 L0 -22 L8 18 Z" />
        </>
      );
    case 1:
      return (
        <>
          <rect x="-22" y="10" width="44" height="8" />
          <circle r="10" cy="-10" />
          <path d="M-18 -4 L-8 8 M18 -4 L8 8 M0 -28 V-20" />
        </>
      );
    case 2:
      return (
        <>
          <rect x="-16" y="-22" width="32" height="44" />
          <path d="M-10 -8 H10 M-10 0 H10 M-10 8 H6" strokeWidth="0.8" />
        </>
      );
    case 3:
      return (
        <>
          <circle r="18" cy="-6" />
          <path d="M0 12 Q-20 28 -8 36 Q0 22 8 36 Q20 28 0 12" />
        </>
      );
    case 4:
      return (
        <>
          <rect x="-20" y="-8" width="40" height="28" />
          <path d="M-20 -8 L0 -28 L20 -8" />
        </>
      );
    case 5:
      return (
        <>
          <path d="M-18 24 V-4 L0 -28 L18 -4 V24" />
          <circle r="6" cy="-2" />
        </>
      );
    case 6:
      return (
        <>
          <circle r="10" cx="-16" />
          <circle r="10" cx="16" />
          <path d="M-6 0 H6 M0 -28 V-12" />
        </>
      );
    case 7:
      return (
        <>
          <path d="M-24 16 H24 M-16 16 L-16 -8 L16 -8 L16 16" />
          <path d="M0 -8 V-28 M-8 -20 H8" />
        </>
      );
    case 8:
      return (
        <>
          <path d="M-28 0 H28" />
          <path d="M0 -22 L6 0 L0 22 L-6 0 Z" />
          <circle r="4" cy="-28" />
        </>
      );
    case 9:
      return (
        <>
          <circle r="8" cy="-18" />
          <path d="M0 -10 V22 M-12 8 H12" />
          <circle r="14" cy="-18" strokeDasharray="1 2" />
        </>
      );
    case 10:
      return (
        <>
          <circle r="26" />
          <circle r="10" />
          <path d="M0 -26 L8 -4 L26 0 L8 4 L0 26 L-8 4 L-26 0 L-8 -4 Z" strokeWidth="0.8" />
        </>
      );
    case 11:
      return (
        <>
          <ellipse rx="22" ry="14" cy="10" />
          <circle r="9" cy="-16" />
          <path d="M-8 -8 Q0 4 18 8" />
        </>
      );
    case 12:
      return (
        <>
          <path d="M-20 -28 H20 M0 -28 V8" />
          <circle r="10" cy="18" />
        </>
      );
    case 13:
      return (
        <>
          <path d="M0 -30 V30 M-18 8 H18" />
          <path d="M-12 -8 L0 6 L12 -8" />
        </>
      );
    case 14:
      return (
        <>
          <path d="M-20 -8 Q0 -28 20 -8" />
          <path d="M-16 16 Q0 4 16 16" />
          <circle r="5" />
        </>
      );
    case 15:
      return (
        <>
          <path d="M-16 22 L-16 -4 L0 -22 L16 -4 L16 22" />
          <circle r="5" cy="-2" />
          <path d="M-10 10 H10" />
        </>
      );
    case 16:
      return (
        <>
          <path d="M-18 24 L-12 -8 H12 L18 24 Z" />
          <path d="M-6 -16 L8 -28 L4 -10" />
        </>
      );
    case 17:
      return (
        <>
          <path d="M0 -28 L4 -6 L26 -4 L6 6 L10 28 L0 12 L-10 28 L-6 6 L-26 -4 L-4 -6 Z" />
        </>
      );
    case 18:
      return (
        <>
          <path d="M-8 -24 Q24 -10 8 20 Q-24 8 -8 -24" />
          <circle r="3" cx="10" cy="-16" fill="#2B2523" stroke="none" />
        </>
      );
    case 19:
      return (
        <>
          <circle r="16" />
          <path d="M0 -28 V-18 M0 18 V28 M-28 0 H-18 M18 0 H28 M-20 -20 L-14 -14 M14 14 L20 20 M20 -20 L14 -14 M-14 14 L-20 20" />
        </>
      );
    case 20:
      return (
        <>
          <path d="M-22 18 Q0 -8 22 18" />
          <circle r="6" cy="-16" />
          <path d="M0 -10 V8" />
        </>
      );
    default:
      return (
        <>
          <circle r="26" />
          <ellipse rx="18" ry="26" />
          <ellipse rx="26" ry="12" />
        </>
      );
  }
}
