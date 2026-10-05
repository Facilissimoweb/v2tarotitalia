import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { siteContent } from "../../data/siteContent.ts";
import { resolveOutputLanguage } from "../language.ts";
import { buildIthaSystemPrompt, buildIthaUserPrompt } from "./prompt.ts";
import { isIthaQuestionBlocked, ithaEthicsMessage } from "./safety.ts";
import {
  groqApiKey,
  groqModelPreference,
  ITHA_GROQ_LLAMA_70B,
  ITHA_GROQ_OSS_120B,
  supabaseAnonKey,
  supabaseUrl,
} from "./serverEnv.ts";
import { ITHA_CREDITS_UNLOCKED, ITHA_UNLOCKED_BALANCE, ithaDemoAccess, type IthaDecode, type IthaDecodeRequest } from "./types.ts";

const { itha } = siteContent;

type AuthUser = { id: string };
type HandlerResult = { status: number; body: Record<string, unknown> };

function normalizeDecodeRequest(raw: unknown): IthaDecodeRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const question = typeof body.question === "string" ? body.question : "";
  const category = typeof body.category === "string" ? body.category : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : undefined;
  const language = resolveOutputLanguage(typeof body.language === "string" ? body.language : undefined);
  const cards = Array.isArray(body.cards)
    ? body.cards.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const card = item as Record<string, unknown>;
        if (typeof card.id !== "string" || typeof card.position !== "string") return [];
        return [
          {
            id: card.id,
            name: typeof card.name === "string" ? card.name : card.id,
            suit: typeof card.suit === "string" ? card.suit : "",
            rank: typeof card.rank === "string" ? card.rank : "",
            position: card.position as IthaDecodeRequest["cards"][number]["position"],
          },
        ];
      })
    : [];
  return { category, categoryId, language, question, cards };
}

export async function handleIthaDecode(token: string, raw: unknown): Promise<HandlerResult> {
  try {
    return await runIthaDecode(token, raw);
  } catch {
    return { status: 503, body: { error: itha.groqManca } };
  }
}

export async function handleIthaDevPreview(raw: unknown): Promise<HandlerResult> {
  try {
    return await runIthaDecode("", raw);
  } catch {
    return { status: 503, body: { error: itha.groqManca } };
  }
}

async function runIthaDecode(token: string, raw: unknown): Promise<HandlerResult> {
  const body = normalizeDecodeRequest(raw);
  if (!body) return { status: 400, body: { error: itha.quesitoErrore } };
  if (!token && !ithaDemoAccess()) return { status: 401, body: { error: itha.errori.sessione } };
  if (!body.question.trim() || !body.category || body.cards.length === 0) {
    return { status: 400, body: { error: itha.quesitoErrore } };
  }
  if (isIthaQuestionBlocked(body.question)) {
    return { status: 422, body: { error: ithaEthicsMessage(), blocked: true } };
  }

  const key = groqApiKey();
  if (!key) return { status: 503, body: { error: itha.groqManca } };

  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  const demo = ithaDemoAccess();
  if ((!url || !anon) && !demo) return { status: 503, body: { error: itha.errori.sessione } };

  let user: AuthUser | null = null;
  let sb: SupabaseClient | null = null;
  if (url && anon && token) {
    sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    try {
      const { data: userData, error: userError } = await sb.auth.getUser(token);
      user = (userData.user as AuthUser | null) ?? null;
      if ((userError || !user?.id) && !demo) return { status: 401, body: { error: itha.errori.sessione } };
      if (userError || !user?.id) user = null;
    } catch {
      if (!demo) return { status: 401, body: { error: itha.errori.sessione } };
      user = null;
    }
  } else if (!demo) {
    return { status: 401, body: { error: itha.errori.sessione } };
  }

  let remaining = ITHA_UNLOCKED_BALANCE;
  if (!ITHA_CREDITS_UNLOCKED) {
    if (!sb) return { status: 402, body: { error: itha.errori.crediti } };
    const consumed = await sb.rpc("consume_itha_credit");
    if (consumed.error) {
      return { status: 402, body: { error: itha.errori.crediti } };
    }
    remaining = Number(consumed.data ?? 0);
  }

  const decode = await callGroq(key, body);
  if (sb && user?.id) {
    try {
      const { data, error } = await sb
        .from("itha_readings")
        .insert({
          user_id: user.id,
          category: body.category,
          question: body.question.trim(),
          cards: body.cards,
          analisi: decode.analisi,
          coerenza: decode.coerenza,
          spunto: decode.spunto,
        })
        .select("id, created_at")
        .single();
      if (!error && data) {
        return {
          status: 200,
          body: {
            id: data.id,
            createdAt: data.created_at,
            credits: remaining,
            language: body.language,
            decode,
          },
        };
      }
    } catch {
      /* la lettura resta disponibile anche se l’archivio remoto non risponde */
    }
  }
  return {
    status: 200,
    body: {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      credits: remaining,
      language: body.language,
      decode,
    },
  };
}

function groqModels() {
  const preferred = groqModelPreference();
  return [...new Set([preferred, ITHA_GROQ_LLAMA_70B, ITHA_GROQ_OSS_120B].filter(Boolean))];
}

async function callGroq(key: string, body: IthaDecodeRequest): Promise<IthaDecode> {
  let lastError: Error | undefined;
  for (const model of groqModels()) {
    try {
      return await callGroqModel(key, model, body);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("groq");
    }
  }
  throw lastError ?? new Error("groq");
}

async function callGroqModel(key: string, model: string, body: IthaDecodeRequest): Promise<IthaDecode> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildIthaSystemPrompt(body.language) },
        { role: "user", content: buildIthaUserPrompt(body) },
      ],
    }),
  });
  if (response.status === 404 || response.status === 403) throw new Error("model");
  if (!response.ok) throw new Error("groq");
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let parsed: Partial<IthaDecode> = {};
  try {
    parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}") as Partial<IthaDecode>;
  } catch {
    throw new Error("json");
  }
  if (!parsed.analisi || !parsed.coerenza || !parsed.spunto) throw new Error("json");
  return {
    analisi: parsed.analisi,
    coerenza: parsed.coerenza,
    spunto: parsed.spunto,
  };
}
