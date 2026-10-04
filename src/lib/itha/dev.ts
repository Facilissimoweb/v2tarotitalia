import { getIthaCard, type DrawnIthaCard, type IthaSuit } from "../../data/ithaMazzo.ts";
import { buildIthaArgomentazione } from "./argomentazione.ts";
import type { IthaDecode, IthaDecodeRequest, IthaReading } from "./types.ts";

const CREDITS_KEY = "itha-dev-credits";
const READINGS_KEY = "itha-dev-readings";
export const ITHA_DEV_PACK = 5;

export function isIthaDev() {
  return import.meta.env.DEV;
}

export function readDevCredits() {
  if (!isIthaDev()) return 0;
  if (typeof localStorage === "undefined") return ITHA_DEV_PACK;
  const raw = Number(localStorage.getItem(CREDITS_KEY));
  return Number.isFinite(raw) && raw > 0 ? raw : ITHA_DEV_PACK;
}

export function writeDevCredits(n: number) {
  localStorage.setItem(CREDITS_KEY, String(Math.max(0, n)));
  return Math.max(0, n);
}

export function grantDevCredits(pack = ITHA_DEV_PACK) {
  return writeDevCredits(pack);
}

export function consumeDevCredit() {
  if (isIthaDev()) return readDevCredits();
  return null;
}

export function readDevReadings(): IthaReading[] {
  try {
    const raw = localStorage.getItem(READINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as IthaReading[];
  } catch {
    return [];
  }
}

export function saveDevReading(reading: IthaReading) {
  const next = [reading, ...readDevReadings().filter((item) => item.id !== reading.id)];
  localStorage.setItem(READINGS_KEY, JSON.stringify(next));
  return next;
}

export function buildLumiereFallback(input: IthaDecodeRequest): IthaDecode {
  return buildIthaArgomentazione(input);
}

export function readingFromDevDecode(input: IthaDecodeRequest, decode: IthaDecode, credits: number) {
  const cards: DrawnIthaCard[] = input.cards.map((card) => {
    const full = getIthaCard(card.id);
    return {
      ...(full ?? { id: card.id, name: card.name, suit: card.suit as IthaSuit, rank: card.rank }),
      position: card.position,
    } as DrawnIthaCard;
  });
  const reading: IthaReading = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    category: input.category,
    question: input.question.trim(),
    cards,
    decode,
    language: input.language,
  };
  saveDevReading(reading);
  return { id: reading.id, createdAt: reading.createdAt, credits, decode, reading };
}
