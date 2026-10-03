import { createClient } from "@supabase/supabase-js";
import { siteContent } from "../../data/siteContent.ts";
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
import type { IthaDecode, IthaDecodeRequest } from "./types.ts";

const { itha } = siteContent;

type AuthUser = { id: string };

export async function handleIthaDecode(token: string, body: IthaDecodeRequest) {
  if (!token) return { status: 401, body: { error: itha.errori.sessione } };
  if (!body.question?.trim() || !body.category || !body.cards?.length) {
    return { status: 400, body: { error: itha.quesitoErrore } };
  }
  if (isIthaQuestionBlocked(body.question)) {
    return { status: 422, body: { error: ithaEthicsMessage(), blocked: true } };
  }

  const key = groqApiKey();
  if (!key) return { status: 503, body: { error: itha.groqManca } };

  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  if (!url || !anon) return { status: 503, body: { error: itha.errori.sessione } };

  const sb = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await sb.auth.getUser(token);
  const user = userData.user as AuthUser | null;
  if (userError || !user?.id) return { status: 401, body: { error: itha.errori.sessione } };

  const consumed = await sb.rpc("consume_itha_credit");
  if (consumed.error) {
    return { status: 402, body: { error: itha.errori.crediti } };
  }

  try {
    const decode = await callGroq(key, body);
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
    if (error) return { status: 500, body: { error: itha.errori.decodifica } };
    return {
      status: 200,
      body: {
        id: data.id,
        createdAt: data.created_at,
        credits: consumed.data,
        decode,
      },
    };
  } catch {
    return { status: 500, body: { error: itha.errori.decodifica } };
  }
}

export async function handleIthaDevPreview(body: IthaDecodeRequest) {
  if (!body.question?.trim() || !body.category || !body.cards?.length) {
    return { status: 400, body: { error: itha.quesitoErrore } };
  }
  if (isIthaQuestionBlocked(body.question)) {
    return { status: 422, body: { error: ithaEthicsMessage(), blocked: true } };
  }
  const key = groqApiKey();
  if (!key) return { status: 503, body: { error: itha.groqManca } };
  try {
    const decode = await callGroq(key, body);
    return { status: 200, body: { decode } };
  } catch {
    return { status: 500, body: { error: itha.errori.decodifica } };
  }
}

function groqModels() {
  const preferred = groqModelPreference();
  return [...new Set([preferred, ITHA_GROQ_LLAMA_70B, ITHA_GROQ_OSS_120B].filter(Boolean))];
}

async function callGroq(key: string, body: IthaDecodeRequest): Promise<IthaDecode> {
  let lastError: Error | undefined;
  for (const model of groqModels()) {
    try {
      return await callGroqModel(key, body, model);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("groq");
      if (lastError.message === "json") throw lastError;
    }
  }
  throw lastError ?? new Error("groq");
}

async function callGroqModel(key: string, body: IthaDecodeRequest, model: string): Promise<IthaDecode> {
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
        { role: "system", content: buildIthaSystemPrompt() },
        { role: "user", content: buildIthaUserPrompt(body) },
      ],
    }),
  });
  if (response.status === 404 || response.status === 403) throw new Error("model");
  if (!response.ok) throw new Error("groq");
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}") as Partial<IthaDecode>;
  if (!parsed.analisi || !parsed.coerenza || !parsed.spunto) throw new Error("json");
  return {
    analisi: parsed.analisi,
    coerenza: parsed.coerenza,
    spunto: parsed.spunto,
  };
}
