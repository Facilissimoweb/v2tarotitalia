import { readServerEnv } from "../itha/serverEnv.ts";

/** Modello di default per Tarot Chat (piano developer Groq). */
export const TAROT_CHAT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const TAROT_CHAT_GROQ_FALLBACK = "openai/gpt-oss-120b";

const PLACEHOLDER_KEYS = new Set([
  "",
  "tua_chiave_groq_qui",
  "your_groq_api_key",
  "TAROTCHAT_GROQ_API_KEY",
]);

/** Chiave dedicata alla chat — solo server, nome esatto richiesto. */
export function tarotChatGroqApiKey() {
  const key = readServerEnv("TAROTCHAT_GROQ_API_KEY");
  return PLACEHOLDER_KEYS.has(key) ? "" : key;
}

export function tarotChatGroqModels() {
  const preferred = readServerEnv("TAROTCHAT_GROQ_MODEL");
  return [...new Set([preferred, TAROT_CHAT_GROQ_MODEL, TAROT_CHAT_GROQ_FALLBACK].filter(Boolean))];
}
