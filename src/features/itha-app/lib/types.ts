import type { DrawnIthaCard, IthaPositionId } from "../data/ithaMazzo.ts";

export type IthaDecode = {
  analisi: string;
  coerenza: string;
  spunto: string;
};

export type IthaReading = {
  id: string;
  createdAt: string;
  category: string;
  question: string;
  cards: DrawnIthaCard[];
  decode: IthaDecode;
  language?: string;
};

export type IthaDecodeRequest = {
  category: string;
  categoryId?: string;
  language?: string;
  question: string;
  cards: Array<{
    id: string;
    name: string;
    suit: string;
    rank: string;
    position: IthaPositionId;
  }>;
};
