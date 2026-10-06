export function readServerEnv(name: string, fallback = "") {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return (env?.[name] ?? fallback).trim().replace(/^["']|["']$/g, "");
}

/** Llama 3.3 70B. Su Groq resta disponibile solo per i piani enterprise. */
export const ITHA_GROQ_LLAMA_70B = "llama-3.3-70b-versatile";

/** Sostituto ufficiale Groq del 70B per i piani developer: 120B, produzione. */
export const ITHA_GROQ_OSS_120B = "openai/gpt-oss-120b";

const PLACEHOLDER_GROQ_KEYS = new Set(["", "tua_chiave_groq_qui", "your_groq_api_key"]);

export function groqApiKey() {
  const key = readServerEnv("ITHA_GROQ_API_KEY") || readServerEnv("GROQ_API_KEY");
  return PLACEHOLDER_GROQ_KEYS.has(key) ? "" : key;
}

export function groqModelPreference() {
  return readServerEnv("ITHA_GROQ_MODEL");
}

export function supabaseUrl() {
  return readServerEnv("VITE_SUPABASE_URL") || readServerEnv("SUPABASE_URL");
}

export function supabaseAnonKey() {
  return readServerEnv("VITE_SUPABASE_ANON_KEY") || readServerEnv("SUPABASE_ANON_KEY");
}

export function supabaseServiceKey() {
  return readServerEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function paypalClientId() {
  return readServerEnv("PAYPAL_CLIENT_ID") || readServerEnv("VITE_PAYPAL_CLIENT_ID");
}

export function paypalSecret() {
  return readServerEnv("PAYPAL_CLIENT_SECRET");
}

export function paypalBaseUrl() {
  const env = readServerEnv("PAYPAL_ENV", "sandbox").toLowerCase();
  return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}
