import { siteContent } from "../../data/siteContent.ts";
import { extractTarotChatActions } from "./actions.ts";
import { tarotChatGroqApiKey, tarotChatGroqModels } from "./serverEnv.ts";
import type { TarotChatMessage, TarotChatRequest } from "./types.ts";

const { tarotChat: copy } = siteContent;

const MAX_MESSAGES = 24;
const MAX_CONTENT_CHARS = 2000;

function sanitizeMessages(raw: unknown): TarotChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: TarotChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim().slice(0, MAX_CONTENT_CHARS);
    if (!trimmed) continue;
    const clean = role === "assistant" ? extractTarotChatActions(trimmed).text : trimmed;
    if (!clean) continue;
    out.push({ role, content: clean });
  }
  if (out.length === 0) return null;
  return out.slice(-MAX_MESSAGES);
}

function replyFromGroq(json: unknown): string {
  const message = (json as { choices?: Array<{ message?: { content?: unknown; reasoning?: unknown } }> })
    ?.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("")
      .trim();
    if (joined) return joined;
  }
  return "";
}

async function callGroq(key: string, model: string, messages: TarotChatMessage[]) {
  const oss = model.includes("gpt-oss");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: oss ? 1 : 0.7,
      max_tokens: 900,
      ...(oss ? { reasoning_effort: "low" } : {}),
      messages: [{ role: "system", content: copy.systemPrompt }, ...messages],
    }),
  });
  if (response.status === 404 || response.status === 403) throw new Error("model");
  if (!response.ok) throw new Error("groq");
  const json: unknown = await response.json();
  const reply = replyFromGroq(json);
  if (!reply) throw new Error("empty");
  return extractTarotChatActions(reply);
}

export async function handleTarotChat(body: unknown): Promise<{ status: number; body: unknown }> {
  const key = tarotChatGroqApiKey();
  if (!key) {
    return { status: 503, body: { error: copy.erroreConfig } };
  }

  const messages = sanitizeMessages((body as TarotChatRequest | null)?.messages);
  if (!messages) {
    return { status: 400, body: { error: copy.erroreInput } };
  }
  if (messages[messages.length - 1]?.role !== "user") {
    return { status: 400, body: { error: copy.erroreInput } };
  }

  let lastError: Error | null = null;
  for (const model of tarotChatGroqModels()) {
    try {
      const { text, actions } = await callGroq(key, model, messages);
      return { status: 200, body: { reply: text, actions } };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("groq");
      if (lastError.message === "model" || lastError.message === "empty") continue;
      break;
    }
  }

  return {
    status: 503,
    body: { error: lastError?.message === "empty" ? copy.erroreRisposta : copy.erroreRete },
  };
}
