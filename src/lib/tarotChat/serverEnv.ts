import { groqApiKey, ITHA_GROQ_OSS_120B, readServerEnv } from "../serverEnv.ts";

/** Produzione Groq (developer): GPT-OSS 120B. Llama 3.3 70B è spento fuori enterprise. */
export const TAROT_CHAT_GROQ_MODEL = ITHA_GROQ_OSS_120B;
export const TAROT_CHAT_GROQ_FALLBACK = "qwen/qwen3.6-27b";
export const TAROT_CHAT_GROQ_FALLBACK_FAST = "openai/gpt-oss-20b";

const PLACEHOLDER_KEYS = new Set([
  "",
  "tua_chiave_groq_qui",
  "tua_chiave_tarotchat_groq_qui",
  "your_groq_api_key",
  "TAROTCHAT_GROQ_API_KEY",
]);

/** Chiave chat: TAROTCHAT_GROQ_API_KEY, altrimenti la stessa Groq di Itha. Solo server. */
export function tarotChatGroqApiKey() {
  const dedicated = readServerEnv("TAROTCHAT_GROQ_API_KEY");
  if (!PLACEHOLDER_KEYS.has(dedicated)) return dedicated;
  return groqApiKey();
}

export function tarotChatGroqModels() {
  const preferred = readServerEnv("TAROTCHAT_GROQ_MODEL");
  return [
    ...new Set(
      [preferred, TAROT_CHAT_GROQ_MODEL, TAROT_CHAT_GROQ_FALLBACK, TAROT_CHAT_GROQ_FALLBACK_FAST].filter(Boolean),
    ),
  ];
}
