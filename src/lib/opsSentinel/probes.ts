import { readServerEnv, supabaseAnonKey, supabaseUrl } from "../serverEnv.ts";
import { SUBSTACK_FEED_DEFAULT } from "../substack.ts";
import { tarotChatGroqApiKey } from "../tarotChat/serverEnv.ts";
import type { SentinelProbe } from "./types.ts";

/** Hobby: la funzione Vercel ha 10s. Ogni sonda deve chiudere prima. */
const PROBE_MS = 3_500;

type ProbeBase = Pick<SentinelProbe, "id" | "label" | "severity">;

async function discard(res: Response) {
  try {
    await res.body?.cancel();
  } catch {
    /* ignore */
  }
}

async function lightOk(url: string, signal: AbortSignal, accept: string) {
  const headers = { Accept: accept };
  let res = await fetch(url, { method: "HEAD", redirect: "follow", signal, headers });
  if (res.status === 405 || res.status === 501 || res.status === 403) {
    await discard(res);
    res = await fetch(url, { method: "GET", redirect: "follow", signal, headers });
  }
  await discard(res);
  return res;
}

async function timed(
  base: ProbeBase,
  run: (signal: AbortSignal) => Promise<Pick<SentinelProbe, "status" | "detail">>,
): Promise<SentinelProbe> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_MS);
  try {
    const result = await run(controller.signal);
    return { ...base, ...result, ms: Date.now() - started };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ...base,
      status: "down",
      ms: Date.now() - started,
      detail: aborted ? "timeout" : error instanceof Error ? error.message : "errore",
    };
  } finally {
    clearTimeout(timer);
  }
}

function skipped(base: ProbeBase, detail: string): SentinelProbe {
  return { ...base, status: "skipped", ms: 0, detail };
}

export async function runVercelProbes(): Promise<SentinelProbe[]> {
  const site = (readServerEnv("SITE_URL") || "https://www.tarotitalia.com").replace(/\/$/, "");
  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  const chatKey = tarotChatGroqApiKey();
  const placesKey = readServerEnv("GOOGLE_PLACES_API_KEY");
  const placeId = readServerEnv("GOOGLE_PLACE_ID");
  const feed = readServerEnv("SUBSTACK_FEED_URL", SUBSTACK_FEED_DEFAULT);

  return Promise.all([
    timed({ id: "site", label: "Sito pubblico", severity: "critical" }, async (signal) => {
      const res = await lightOk(site, signal, "text/html");
      if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` };
      return { status: "ok" };
    }),
    !url || !anon
      ? skipped({ id: "supabase", label: "Supabase Auth/DB", severity: "critical" }, "env mancante")
      : timed({ id: "supabase", label: "Supabase Auth/DB", severity: "critical" }, async (signal) => {
          const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
            signal,
            headers: { apikey: anon, Authorization: `Bearer ${anon}` },
          });
          await discard(res);
          if (!res.ok) return { status: "down", detail: `auth HTTP ${res.status}` };
          return { status: "ok" };
        }),
    !chatKey
      ? skipped({ id: "groq-chat", label: "Chat Groq", severity: "critical" }, "chiave mancante")
      : timed({ id: "groq-chat", label: "Chat Groq", severity: "critical" }, async (signal) => {
          const res = await fetch("https://api.groq.com/openai/v1/models", {
            signal,
            headers: { Authorization: `Bearer ${chatKey}` },
          });
          await discard(res);
          if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` };
          return { status: "ok" };
        }),
    !placesKey || !placeId
      ? skipped({ id: "google-places", label: "Recensioni Google", severity: "secondary" }, "env mancante")
      : timed({ id: "google-places", label: "Recensioni Google", severity: "secondary" }, async (signal) => {
          const endpoint = new URL("https://maps.googleapis.com/maps/api/place/details/json");
          endpoint.searchParams.set("place_id", placeId);
          endpoint.searchParams.set("fields", "rating");
          endpoint.searchParams.set("key", placesKey);
          const res = await fetch(endpoint, { signal });
          if (!res.ok) {
            await discard(res);
            return { status: "down", detail: `HTTP ${res.status}` };
          }
          const data = (await res.json()) as { status?: string };
          if (data.status !== "OK") return { status: "down", detail: data.status || "Places" };
          return { status: "ok" };
        }),
    timed({ id: "substack", label: "Feed blog Substack", severity: "secondary" }, async (signal) => {
      const res = await lightOk(feed, signal, "application/rss+xml, application/xml, text/xml");
      if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` };
      return { status: "ok" };
    }),
  ]);
}
