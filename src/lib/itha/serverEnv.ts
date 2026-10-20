export function readServerEnv(name: string, fallback = "") {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return (env?.[name] ?? fallback)
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/\r/g, "")
    .replace(/^["']|["']$/g, "");
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
  return (
    readServerEnv("VITE_SUPABASE_ANON_KEY") ||
    readServerEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    readServerEnv("SUPABASE_ANON_KEY")
  );
}

export function supabaseServiceKey() {
  return readServerEnv("SUPABASE_SERVICE_ROLE_KEY");
}

const PLACEHOLDER_PAYPAL_IDS = new Set(["", "sb", "your_client_id"]);
const PLACEHOLDER_PAYPAL_SECRETS = new Set(["", "tuo_secret_paypal_qui", "your_secret", "your_paypal_secret"]);

export function paypalClientId() {
  const id = readServerEnv("PAYPAL_CLIENT_ID") || readServerEnv("VITE_PAYPAL_CLIENT_ID");
  return PLACEHOLDER_PAYPAL_IDS.has(id) ? "" : id;
}

export function paypalSecret() {
  const secret = readServerEnv("PAYPAL_CLIENT_SECRET");
  return PLACEHOLDER_PAYPAL_SECRETS.has(secret) ? "" : secret;
}

export function paypalEnv() {
  const env = readServerEnv("PAYPAL_ENV", "sandbox").toLowerCase();
  return env === "live" ? "live" : "sandbox";
}

export function paypalBaseUrl() {
  return paypalEnv() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

/** True solo se Client ID e Secret sono valorizzati (niente placeholder). */
export function paypalCredentialsReady() {
  return Boolean(paypalClientId() && paypalSecret());
}

/** ID webhook dalla dashboard PayPal (Webhooks → Webhook ID). Solo server. */
export function paypalWebhookId() {
  return readServerEnv("PAYPAL_WEBHOOK_ID");
}
