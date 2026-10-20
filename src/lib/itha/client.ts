import { siteContent } from "../../data/siteContent.ts";
import { getSupabaseClient } from "../supabase.ts";
import { isIthaQuestionBlocked, ithaEthicsMessage } from "./safety.ts";
import { activeLanguage } from "../language.ts";
import { readJsonSafe } from "../readJsonSafe.ts";
import { fetchWithTimeout, isGroqUnavailable, markGroqUnavailable } from "../remoteApi.ts";
import type { IthaDecode, IthaDecodeRequest, IthaPlanId, IthaReading } from "./types.ts";
import type { DrawnIthaCard } from "../../data/ithaMazzo.ts";

type DecodeResponse = {
  error?: string;
  id?: string;
  createdAt?: string;
  credits?: number;
  decode?: IthaDecode;
};

async function authHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const sb = getSupabaseClient();
  const token = (await sb?.auth.getSession())?.data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function withLanguage(input: IthaDecodeRequest): IthaDecodeRequest {
  return { ...input, language: activeLanguage(input.language) };
}

export async function requestIthaDecode(input: IthaDecodeRequest) {
  const payload = withLanguage(input);
  if (isIthaQuestionBlocked(payload.question)) {
    throw new Error(ithaEthicsMessage());
  }
  return requestRemoteDecode(payload);
}

async function requestRemoteDecode(input: IthaDecodeRequest) {
  if (isGroqUnavailable()) {
    throw new Error(siteContent.itha.groqManca);
  }
  try {
    const response = await fetchWithTimeout("/api/itha-decode", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input),
    });
    const json = await readJsonSafe<DecodeResponse>(response);
    if (response.ok && json?.decode && json.id) {
      return {
        id: json.id,
        createdAt: json.createdAt ?? new Date().toISOString(),
        credits: Number(json.credits ?? 0),
        decode: json.decode,
      };
    }
    if (response.status === 401) {
      throw new Error(json?.error || siteContent.itha.errori.sessione);
    }
    if (response.status === 402) {
      throw new Error(json?.error || siteContent.itha.errori.crediti);
    }
    if (response.status === 422) {
      throw new Error(json?.error || ithaEthicsMessage());
    }
    if (response.status === 503) {
      markGroqUnavailable();
      throw new Error(json?.error || siteContent.itha.groqManca);
    }
    throw new Error(json?.error || siteContent.itha.errori.decodifica);
  } catch (error) {
    if (error instanceof Error) throw error;
    markGroqUnavailable();
    throw new Error(siteContent.itha.groqManca);
  }
}

export async function createPaypalOrder(planId: IthaPlanId) {
  const response = await fetch("/api/paypal-create-order", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ planId }),
  });
  const json = await readJsonSafe<{ id?: string; error?: string }>(response);
  if (!response.ok || !json?.id) throw new Error(json?.error || siteContent.itha.paypalManca);
  return json.id;
}

export async function capturePaypalOrder(orderId: string) {
  const response = await fetch("/api/paypal-capture-order", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ orderId }),
  });
  const json = await readJsonSafe<{ credits?: number; error?: string }>(response);
  if (!response.ok) throw new Error(json?.error || siteContent.itha.paypalOrdine);
  return json?.credits ?? 0;
}

export async function loadIthaCredits() {
  const sb = getSupabaseClient();
  if (!sb) return 0;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return 0;
  const { data } = await sb.from("profiles").select("itha_credits").eq("id", auth.user.id).maybeSingle();
  return Number(data?.itha_credits ?? 0);
}

export async function loadIthaReadings(): Promise<IthaReading[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from("itha_readings")
    .select("id, created_at, category, question, cards, analisi, coerenza, spunto")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
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
}
