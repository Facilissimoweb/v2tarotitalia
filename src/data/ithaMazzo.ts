import { ARCANI } from "./arcani.ts";

export type IthaSuit = "maggiori" | "bastoni" | "coppe" | "spade" | "pentacoli";

export type IthaCard = {
  id: string;
  name: string;
  suit: IthaSuit;
  rank: string;
  majorId?: number;
};

export type IthaPositionId = "vincolo" | "specchio" | "soglia";

export type DrawnIthaCard = IthaCard & {
  position: IthaPositionId;
};

const SUITS: { id: Exclude<IthaSuit, "maggiori">; label: string }[] = [
  { id: "bastoni", label: "Bastoni" },
  { id: "coppe", label: "Coppe" },
  { id: "spade", label: "Spade" },
  { id: "pentacoli", label: "Pentacoli" },
];

const RANKS = [
  { id: "asso", name: "Asso" },
  { id: "2", name: "Due" },
  { id: "3", name: "Tre" },
  { id: "4", name: "Quattro" },
  { id: "5", name: "Cinque" },
  { id: "6", name: "Sei" },
  { id: "7", name: "Sette" },
  { id: "8", name: "Otto" },
  { id: "9", name: "Nove" },
  { id: "10", name: "Dieci" },
  { id: "fante", name: "Fante" },
  { id: "cavaliere", name: "Cavaliere" },
  { id: "regina", name: "Regina" },
  { id: "re", name: "Re" },
] as const;

const MAGGIORI: IthaCard[] = ARCANI.map((arcano) => ({
  id: `maggiori-${arcano.slug}`,
  name: arcano.name,
  suit: "maggiori",
  rank: arcano.roman,
  majorId: arcano.id,
}));

const MINORI: IthaCard[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    id: `${suit.id}-${rank.id}`,
    name: `${rank.name} di ${suit.label}`,
    suit: suit.id,
    rank: rank.name,
  })),
);

export const ITHA_MAZZO: IthaCard[] = [...MAGGIORI, ...MINORI];

const ROW_ORDER: IthaSuit[] = ["maggiori", "spade", "coppe", "pentacoli", "bastoni"];

export function ithaDeckRows() {
  return ROW_ORDER.map((suit) => ({
    suit,
    cards: ITHA_MAZZO.filter((card) => card.suit === suit),
  }));
}

export function getIthaCard(id: string) {
  return ITHA_MAZZO.find((card) => card.id === id);
}

export function getIthaCardImagePath(cardId: string) {
  return `/itha/mazzo/${cardId}.svg`;
}

export function shuffleIthaMazzo(): IthaCard[] {
  const pool = [...ITHA_MAZZO];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function drawCrocicchio(deck = shuffleIthaMazzo()): DrawnIthaCard[] {
  const positions: IthaPositionId[] = ["vincolo", "specchio", "soglia"];
  return positions.map((position, i) => ({ ...deck[i], position }));
}
