import { readServerEnv, supabaseServiceKey, supabaseUrl } from "../serverEnv.ts";
import { runVercelProbes } from "./probes.ts";
import type { SentinelOverall, SentinelProbe, SentinelReport } from "./types.ts";

/** Tempo residuo dopo le sonde Vercel, dentro il tetto Hobby di 10s. */
const EDGE_MS = 5_500;

function overallOf(probes: SentinelProbe[]): SentinelOverall {
  const live = probes.filter((probe) => probe.status !== "skipped");
  if (live.some((probe) => probe.status === "down" && probe.severity === "critical")) return "down";
  if (live.some((probe) => probe.status === "down")) return "degraded";
  return "ok";
}

function fallbackReport(probes: SentinelProbe[], source: SentinelReport["source"]): SentinelReport {
  const overall = overallOf(probes);
  return {
    ok: overall === "ok",
    overall,
    checkedAt: new Date().toISOString(),
    probes,
    alerted: false,
    source,
  };
}

export async function runOpsSentinel(): Promise<SentinelReport> {
  const vercelProbes = await runVercelProbes();
  const edgeUrl = supabaseUrl();
  const secret = readServerEnv("OPS_SENTINEL_SECRET");
  if (!edgeUrl || !secret) {
    return fallbackReport(vercelProbes, "vercel");
  }

  const service = supabaseServiceKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EDGE_MS);
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    };
    if (service) headers.apikey = service;
    const res = await fetch(`${edgeUrl.replace(/\/$/, "")}/functions/v1/ops-health`, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify({ probes: vercelProbes }),
    });
    if (!res.ok && res.status !== 503) {
      const edgeFail: SentinelProbe = {
        id: "ops-health",
        label: "Cluster Edge (Stripe/email/WhatsApp)",
        severity: "critical",
        status: "down",
        ms: 0,
        detail: `HTTP ${res.status}`,
      };
      return fallbackReport([...vercelProbes, edgeFail], "vercel");
    }
    const payload = (await res.json()) as SentinelReport;
    if (!payload?.probes || !payload.overall) return fallbackReport(vercelProbes, "vercel");
    return { ...payload, source: "merged" };
  } catch (error) {
    const edgeFail: SentinelProbe = {
      id: "ops-health",
      label: "Cluster Edge (Stripe/email/WhatsApp)",
      severity: "critical",
      status: "down",
      ms: 0,
      detail: error instanceof Error ? error.message : "cluster irraggiungibile",
    };
    return fallbackReport([...vercelProbes, edgeFail], "vercel");
  } finally {
    clearTimeout(timer);
  }
}

export function sentinelAuthorized(token: string) {
  const secret = readServerEnv("OPS_SENTINEL_SECRET");
  if (!secret || !token) return false;
  return timingSafeEqual(token, secret);
}

export function sentinelConfigured() {
  return Boolean(readServerEnv("OPS_SENTINEL_SECRET"));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
