import type { ArcanoMinore, GradoId, SemeId } from "../data/arcaniMinori";
import { RANK_MARK } from "../data/arcaniMinori";

type Props = {
  arcano: ArcanoMinore;
  className?: string;
};

const INK = "#2B2523";
const FRAME = "#C99A7A";

export function ArcanoMinoreArt({ arcano, className = "" }: Props) {
  const mark = RANK_MARK[arcano.grado];
  const french = arcano.francese.toUpperCase();
  const compact = french.length > 14;

  return (
    <svg
      viewBox="0 0 160 240"
      className={`block h-full w-full ${className}`}
      role="img"
      aria-label={`${arcano.nome}, ${arcano.francese}`}
    >
      <rect width="160" height="240" fill="#F9F8F6" />
      <rect x="8" y="8" width="144" height="224" fill="none" stroke={INK} strokeWidth="0.8" />
      <rect x="14" y="14" width="132" height="212" fill="none" stroke={FRAME} strokeWidth="0.4" />
      <text
        x="80"
        y="32"
        textAnchor="middle"
        fill={FRAME}
        fontFamily="Inter, sans-serif"
        fontSize="8"
        letterSpacing={mark.length > 6 ? 1.2 : 2.4}
      >
        {mark}
      </text>
      <g transform="translate(80 118)" fill="none" stroke={INK} strokeWidth="1">
        {glyph(arcano.seme, arcano.grado)}
      </g>
      <text
        x="80"
        y="214"
        textAnchor="middle"
        fill={INK}
        fontFamily="Noto Serif, serif"
        fontSize={compact ? 7 : 8}
        letterSpacing={compact ? 0.6 : 1.2}
      >
        {french}
      </text>
    </svg>
  );
}

function sword(x = 0, y = 0, scale = 1, rot = 0) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d="M0 -22 L4.5 -6 V11 L0 18 L-4.5 11 V-6 Z" />
      <path d="M-7 6 H7" />
    </g>
  );
}

function crossedPair(spread = 16, rot = 28, scale = 0.92) {
  return (
    <>
      {sword(-spread, 0, scale, -rot)}
      {sword(spread, 0, scale, rot)}
    </>
  );
}

function column(xs: number, ys: number[], scale = 0.72) {
  return ys.map((y) => <g key={`${xs}-${y}`}>{sword(xs, y, scale)}</g>);
}

function glyph(seme: SemeId, grado: GradoId) {
  if (grado === "fante" || grado === "cavaliere" || grado === "regina" || grado === "re") {
    return court(seme, grado);
  }
  return pips(seme, Number(grado === "asso" ? 1 : grado));
}

function pips(seme: SemeId, n: number) {
  switch (seme) {
    case "spade":
      return swordPips(n);
    case "coppe":
      return cupPips(n);
    case "denari":
      return coinPips(n);
    case "bastoni":
      return wandPips(n);
  }
}

function swordPips(n: number) {
  switch (n) {
    case 1:
      return sword(0, 0, 1.55);
    case 2:
      return crossedPair(14, 32, 1.05);
    case 3:
      return (
        <>
          {sword(0, -22, 0.95)}
          {crossedPair(16, 26, 0.88)}
        </>
      );
    case 4:
      return (
        <>
          {sword(-18, -18, 0.82)}
          {sword(18, -18, 0.82)}
          {sword(-18, 18, 0.82)}
          {sword(18, 18, 0.82)}
        </>
      );
    case 5:
      return (
        <>
          {sword(-18, -22, 0.78)}
          {sword(18, -22, 0.78)}
          {sword(0, 0, 0.86)}
          {sword(-18, 22, 0.78)}
          {sword(18, 22, 0.78)}
        </>
      );
    case 6:
      return (
        <>
          {column(-18, [-28, 0, 28], 0.72)}
          {column(18, [-28, 0, 28], 0.72)}
        </>
      );
    case 7:
      return (
        <>
          {sword(0, -36, 0.7)}
          {column(-18, [-14, 12, 38], 0.68)}
          {column(18, [-14, 12, 38], 0.68)}
        </>
      );
    case 8:
      return (
        <>
          {column(-18, [-36, -12, 12, 36], 0.64)}
          {column(18, [-36, -12, 12, 36], 0.64)}
        </>
      );
    case 9:
      return (
        <>
          {sword(0, 0, 0.7)}
          {column(-20, [-36, -12, 12, 36], 0.6)}
          {column(20, [-36, -12, 12, 36], 0.6)}
        </>
      );
    default:
      return (
        <>
          {column(-20, [-40, -20, 0, 20, 40], 0.56)}
          {column(20, [-40, -20, 0, 20, 40], 0.56)}
        </>
      );
  }
}

function cup(x = 0, y = 0, scale = 1) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-9 -12 H9 V-4 C9 6 4 11 0 14 C-4 11 -9 6 -9 -4 Z" />
      <path d="M0 14 V20 M-6 20 H6" />
    </g>
  );
}

function coin(x = 0, y = 0, scale = 1) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="11" />
      <circle r="6" />
    </g>
  );
}

function wand(x = 0, y = 0, scale = 1, rot = 0) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d="M0 -22 V18" />
      <path d="M-5 -16 H5 M-5 12 H5" />
      <path d="M-4 18 L0 24 L4 18" />
    </g>
  );
}

function cupPips(n: number) {
  const layout = pipLayout(n);
  return layout.map(([x, y], i) => <g key={i}>{cup(x, y, n === 1 ? 1.35 : 0.82)}</g>);
}

function coinPips(n: number) {
  const layout = pipLayout(n);
  return layout.map(([x, y], i) => <g key={i}>{coin(x, y, n === 1 ? 1.4 : 0.78)}</g>);
}

function wandPips(n: number) {
  if (n === 1) return wand(0, 0, 1.4);
  if (n === 2) return (
    <>
      {wand(-14, 0, 1, -18)}
      {wand(14, 0, 1, 18)}
    </>
  );
  const layout = pipLayout(n);
  return layout.map(([x, y], i) => <g key={i}>{wand(x, y, 0.78)}</g>);
}

function pipLayout(n: number): [number, number][] {
  switch (n) {
    case 1:
      return [[0, 0]];
    case 2:
      return [
        [0, -20],
        [0, 20],
      ];
    case 3:
      return [
        [0, -24],
        [-18, 16],
        [18, 16],
      ];
    case 4:
      return [
        [-18, -20],
        [18, -20],
        [-18, 20],
        [18, 20],
      ];
    case 5:
      return [
        [-18, -22],
        [18, -22],
        [0, 0],
        [-18, 22],
        [18, 22],
      ];
    case 6:
      return [
        [-18, -28],
        [18, -28],
        [-18, 0],
        [18, 0],
        [-18, 28],
        [18, 28],
      ];
    case 7:
      return [
        [0, -36],
        [-18, -14],
        [18, -14],
        [-18, 12],
        [18, 12],
        [-18, 38],
        [18, 38],
      ];
    case 8:
      return [
        [-18, -36],
        [18, -36],
        [-18, -12],
        [18, -12],
        [-18, 12],
        [18, 12],
        [-18, 36],
        [18, 36],
      ];
    case 9:
      return [
        [0, 0],
        [-20, -36],
        [20, -36],
        [-20, -12],
        [20, -12],
        [-20, 12],
        [20, 12],
        [-20, 36],
        [20, 36],
      ];
    default:
      return [
        [-20, -40],
        [20, -40],
        [-20, -20],
        [20, -20],
        [-20, 0],
        [20, 0],
        [-20, 20],
        [20, 20],
        [-20, 40],
        [20, 40],
      ];
  }
}

function court(seme: SemeId, grado: GradoId) {
  const emblem =
    seme === "spade" ? sword(22, -6, 0.7, -18) : seme === "coppe" ? cup(22, -8, 0.7) : seme === "denari" ? coin(22, -8, 0.7) : wand(22, -8, 0.7, 12);

  if (grado === "fante") {
    return (
      <>
        <circle r="8" cy="-26" />
        <path d="M0 -18 V12 M-12 12 H12" />
        <path d="M0 -8 L-16 6" />
        {emblem}
      </>
    );
  }

  if (grado === "cavaliere") {
    return (
      <>
        <ellipse rx="26" ry="12" cy="10" />
        <circle r="7" cy="-22" />
        <path d="M0 -15 V4 M-18 10 L8 -4" />
        {emblem}
      </>
    );
  }

  if (grado === "regina") {
    return (
      <>
        <path d="M-10 -34 L0 -42 L10 -34" />
        <circle r="8" cy="-24" />
        <path d="M-16 22 L-12 -8 H12 L16 22 Z" />
        {emblem}
      </>
    );
  }

  return (
    <>
      <path d="M-12 -36 H12 M-8 -36 L-8 -30 L0 -42 L8 -30 L8 -36" />
      <circle r="8" cy="-22" />
      <rect x="-18" y="-6" width="36" height="28" />
      {emblem}
    </>
  );
}
