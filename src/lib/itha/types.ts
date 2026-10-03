import type { DrawnIthaCard, IthaPositionId } from "../../data/ithaMazzo.ts";

export type IthaPlanId = "singola" | "pacchetto3" | "pass5";

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
};

export type IthaDecodeRequest = {
  category: string;
  categoryId?: string;
  question: string;
  cards: Array<{
    id: string;
    name: string;
    suit: string;
    rank: string;
    position: IthaPositionId;
  }>;
};

/** Temporaneo: test libero delle letture. Login e registrazione restano invariati. */
export const ITHA_CREDITS_UNLOCKED = true;
export const ITHA_SESSION_UNLOCKED = true;
export const ITHA_UNLOCKED_BALANCE = 999;

export function ithaDemoAccess() {
  return ITHA_CREDITS_UNLOCKED || ITHA_SESSION_UNLOCKED;
}

export const ITHA_PLAN_CREDITS: Record<IthaPlanId, { credits: number; amount: string }> = {
  singola: { credits: 1, amount: "5.00" },
  pacchetto3: { credits: 3, amount: "12.00" },
  pass5: { credits: 5, amount: "20.00" },
};
