import { siteContent } from "../../data/siteContent.ts";
import { getSupabaseClient } from "../supabase.ts";
import {
  buildLumiereFallback,
  consumeDevCredit,
  ITHA_DEV_PACK,
  isIthaDev,
  readingFromDevDecode,
  readDevCredits,
  readDevReadings,
} from "./dev.ts";
import { isIthaQuestionBlocked, ithaEthicsMessage } from "./safety.ts";
import { ITHA_CREDITS_UNLOCKED, ITHA_UNLOCKED_BALANCE, ithaDemoAccess, type IthaDecode, type IthaDecodeRequest, type IthaPlanId, type IthaReading } from "./types.ts";
import type { DrawnIthaCard } from "../../data/ithaMazzo.ts";

async function authHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const sb = getSupabaseClient();
  const token = (await sb?.auth.getSession())?.data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function requestIthaDecode(input: IthaDecodeRequest) {
  if (isIthaQuestionBlocked(input.question)) {
    throw new Error(ithaEthicsMessage());
  }
  if (isIthaDev() || ithaDemoAccess()) {
    try {
      const response = await fetch("/api/itha-decode", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(input),
      });
      const json = (await response.json()) as {
        error?: string;
        id?: string;
        createdAt?: string;
        credits?: number;
        decode?: IthaDecode;
      };
      if (response.ok && json.decode && json.id) {
        return json as { id: string; createdAt: string; credits: number; decode: IthaDecode };
      }
    } catch {
      // In demo si passa alla decodifica locale se l’API non è pronta.
    }
    return decodeInDev(input);
  }
  const response = await fetch("/api/itha-decode", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  const json = (await response.json()) as {
    error?: string;
    id?: string;
    createdAt?: string;
    credits?: number;
    decode?: IthaDecode;
  };
  if (!response.ok || !json.decode || !json.id) {
    throw new Error(json.error || "decode");
  }
  return json as { id: string; createdAt: string; credits: number; decode: IthaDecode };
}

async function decodeInDev(input: IthaDecodeRequest) {
  if (isIthaQuestionBlocked(input.question)) {
    throw new Error(ithaEthicsMessage());
  }
  const remaining = ITHA_CREDITS_UNLOCKED
    ? ITHA_UNLOCKED_BALANCE
    : consumeDevCredit() ?? (isIthaDev() ? ITHA_DEV_PACK : null);
  if (remaining === null) throw new Error(siteContent.itha.errori.crediti);
  let decode = buildLumiereFallback(input);
  try {
    const response = await fetch("/api/itha-dev-decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = (await response.json()) as { decode?: IthaDecode };
    if (response.ok && json.decode?.analisi && json.decode.coerenza && json.decode.spunto) {
      decode = json.decode;
    }
  } catch {
    // Resta l’argomentazione locale se Groq non è disponibile.
  }
  const saved = readingFromDevDecode(input, decode, remaining);
  return { id: saved.id, createdAt: saved.createdAt, credits: remaining, decode };
}

export async function createPaypalOrder(planId: IthaPlanId) {
  const response = await fetch("/api/paypal-create-order", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ planId }),
  });
  const json = (await response.json()) as { id?: string; error?: string };
  if (!response.ok || !json.id) throw new Error(json.error || "paypal");
  return json.id;
}

export async function capturePaypalOrder(orderId: string) {
  const response = await fetch("/api/paypal-capture-order", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ orderId }),
  });
  const json = (await response.json()) as { credits?: number; error?: string };
  if (!response.ok) throw new Error(json.error || "paypal");
  return json.credits ?? 0;
}

export async function loadIthaCredits() {
  if (ITHA_CREDITS_UNLOCKED) return ITHA_UNLOCKED_BALANCE;
  const local = isIthaDev() ? readDevCredits() : 0;
  const sb = getSupabaseClient();
  if (!sb) return local;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return local;
  const { data } = await sb.from("profiles").select("itha_credits").eq("id", auth.user.id).maybeSingle();
  return Math.max(local, Number(data?.itha_credits ?? 0));
}

export async function loadIthaReadings(): Promise<IthaReading[]> {
  const local = isIthaDev() ? readDevReadings() : [];
  const sb = getSupabaseClient();
  if (!sb) return local;
  const { data, error } = await sb
    .from("itha_readings")
    .select("id, created_at, category, question, cards, analisi, coerenza, spunto")
    .order("created_at", { ascending: false });
  if (error || !data) return local;
  const remote = data.map((row) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    category: row.category as string,
    question: row.question as string,
    cards: row.cards as DrawnIthaCard[],
    decode: {
      analisi: row.analisi as string,
      coerenza: row.coerenza as string,
      spunto: row.spunto as string,
    },
  }));
  const seen = new Set(local.map((item) => item.id));
  return [...local, ...remote.filter((item) => !seen.has(item.id))];
}
