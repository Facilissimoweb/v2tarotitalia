/**
 * Cluster Edge del Guardiano: Stripe, Zoho SMTP (TLS), WhatsApp, Calendar.
 * Auth: Authorization: Bearer OPS_SENTINEL_SECRET (verify_jwt = false).
 * Percorso felice senza nodemailer né supabase-js (cold start corto).
 */
type ProbeStatus = "ok" | "down" | "skipped";
type ProbeSeverity = "critical" | "important" | "secondary";
type Overall = "ok" | "degraded" | "down";

type Probe = {
  id: string;
  label: string;
  severity: ProbeSeverity;
  status: ProbeStatus;
  ms: number;
  detail?: string;
};

const PROBE_MS = 4_000;
const ALERT_MS = 5_000;
const FROM_ADDRESS = "info@tarotitalia.com";
const FROM_NAME = "Tarot Italia · Guardiano";
const STUDIO = "info@tarotitalia.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!authorize(req)) return json({ error: "unauthorized" }, 401);

  let body: { probes?: Probe[] } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const incoming = Array.isArray(body.probes) ? body.probes.filter(isProbe) : [];
  const edge = await runEdgeProbes();
  const probes = mergeProbes(incoming, edge);
  const overall = overallOf(probes);
  const persist = await persistAndAlert(probes, overall);

  return json(
    {
      ok: overall === "ok",
      overall,
      checkedAt: new Date().toISOString(),
      probes,
      alerted: persist.alerted,
      source: "merged",
    },
    overall === "down" ? 503 : 200,
  );
});

async function runEdgeProbes(): Promise<Probe[]> {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const zohoUser = Deno.env.get("ZOHO_EMAIL")?.trim();
  const zohoPass = Deno.env.get("ZOHO_PASSWORD");
  const waToken = Deno.env.get("WHATSAPP_TOKEN")?.trim() || Deno.env.get("WHATSAPP_ACCESS_TOKEN")?.trim();
  const waPhone = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const checkoutUrl = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1/create-checkout` : "";

  return Promise.all([
    stripeKey
      ? timed({ id: "stripe", label: "Stripe Checkout", severity: "critical" }, async (signal) => {
          const res = await fetch("https://api.stripe.com/v1/balance", {
            signal,
            headers: { Authorization: `Bearer ${stripeKey}` },
          });
          await discard(res);
          if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` };
          return { status: "ok" };
        })
      : skip({ id: "stripe", label: "Stripe Checkout", severity: "critical" }, "env mancante"),
    checkoutUrl
      ? timed({ id: "create-checkout", label: "Edge create-checkout", severity: "critical" }, async (signal) => {
          const res = await fetch(checkoutUrl, { method: "OPTIONS", signal });
          await discard(res);
          if (res.status >= 500) return { status: "down", detail: `HTTP ${res.status}` };
          return { status: "ok" };
        })
      : skip({ id: "create-checkout", label: "Edge create-checkout", severity: "critical" }, "SUPABASE_URL mancante"),
    zohoUser && zohoPass
      ? timed({ id: "zoho-smtp", label: "Email Zoho SMTP", severity: "critical" }, async (signal) => {
          await smtpTls(signal);
          return { status: "ok" };
        })
      : skip({ id: "zoho-smtp", label: "Email Zoho SMTP", severity: "critical" }, "env mancante"),
    waToken && waPhone
      ? timed({ id: "whatsapp-cloud", label: "WhatsApp Cloud API", severity: "important" }, async (signal) => {
          const res = await fetch(
            `https://graph.facebook.com/v21.0/${waPhone}?fields=id`,
            { signal, headers: { Authorization: `Bearer ${waToken}` } },
          );
          await discard(res);
          if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` };
          return { status: "ok" };
        })
      : skip({ id: "whatsapp-cloud", label: "WhatsApp Cloud API", severity: "important" }, "env mancante"),
    timed({ id: "google-calendar", label: "Google Calendar", severity: "important" }, async (signal) => {
      const token = await googleAccessToken(signal);
      if (!token) return { status: "skipped", detail: "env mancante" };
      const calendarId =
        Deno.env.get("GOOGLE_CALENDAR_ID")?.trim() ||
        Deno.env.get("GOOGLE_CALENDAR_EMAIL")?.trim() ||
        "mariateresarogani@gmail.com";
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}?fields=id`,
        { signal, headers: { Authorization: `Bearer ${token}` } },
      );
      await discard(res);
      if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` };
      return { status: "ok" };
    }),
  ]);
}

async function smtpTls(signal: AbortSignal) {
  const host = Deno.env.get("ZOHO_SMTP_HOST")?.trim() || "smtp.zoho.eu";
  const port = Number(Deno.env.get("ZOHO_SMTP_PORT") || "465");
  const conn = await Promise.race([
    Deno.connectTls({ hostname: host, port }),
    abortPromise(signal),
  ]);
  conn.close();
}

function abortPromise(signal: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    const fail = () => reject(new DOMException("Aborted", "AbortError"));
    if (signal.aborted) {
      fail();
      return;
    }
    signal.addEventListener("abort", fail, { once: true });
  });
}

async function persistAndAlert(probes: Probe[], overall: Overall) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!supabaseUrl || !serviceKey) return { alerted: false };

  try {
    const rest = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/ops_health_runs`;
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    };
    const lastRes = await fetch(
      `${rest}?select=overall,checked_at,alerted&order=checked_at.desc&limit=24`,
      { headers },
    );
    const rows = lastRes.ok ? ((await lastRes.json()) as Array<Record<string, unknown>>) : [];
    const previous = typeof rows[0]?.overall === "string" ? String(rows[0].overall) : "ok";
    const lastAlert = rows.find((row) => row.alerted === true)?.checked_at;
    const changed = overall !== previous;
    const reminder = overall !== "ok" && hoursSince(lastAlert) >= 1;
    const alerted = changed || reminder;

    await fetch(rest, {
      method: "POST",
      headers: { ...headers, Prefer: "return=minimal" },
      body: JSON.stringify({ overall, probes, alerted, source: "sentinel" }),
    });

    if (alerted) {
      const text = formatAlert(probes, overall, previous);
      await Promise.race([
        Promise.allSettled([sendStudioMail(overall, text), sendWhatsApp(text)]),
        sleep(ALERT_MS),
      ]);
    }
    return { alerted };
  } catch (error) {
    console.error("ops-health persist", error);
    return { alerted: false };
  }
}

function formatAlert(probes: Probe[], overall: Overall, previous: string) {
  const failed = probes.filter((probe) => probe.status === "down");
  return [
    `Tarot Italia · Guardiano: ${overall === "ok" ? "ripristino" : "anomalia"}`,
    `Stato: ${previous} → ${overall}`,
    failed.length
      ? failed.map((probe) => `- ${probe.label}: ${probe.detail || "down"}`).join("\n")
      : "Tutte le sonde vitali rispondono.",
  ].join("\n");
}

async function sendStudioMail(overall: Overall, text: string) {
  const zohoUser = Deno.env.get("ZOHO_EMAIL")?.trim();
  const zohoPass = Deno.env.get("ZOHO_PASSWORD");
  if (!zohoUser || !zohoPass) return;
  const nodemailer = (await import("npm:nodemailer@6.9.16")).default;
  const host = Deno.env.get("ZOHO_SMTP_HOST")?.trim() || "smtp.zoho.eu";
  const port = Number(Deno.env.get("ZOHO_SMTP_PORT") || "465");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: zohoUser, pass: zohoPass },
    connectionTimeout: 4_000,
    greetingTimeout: 4_000,
    socketTimeout: 4_000,
  });
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    to: STUDIO,
    subject: overall === "ok" ? "Guardiano: servizi ripristinati" : "Guardiano: anomalia sui servizi",
    text,
  });
  await transporter.close();
}

async function sendWhatsApp(text: string) {
  const token = Deno.env.get("WHATSAPP_TOKEN")?.trim() || Deno.env.get("WHATSAPP_ACCESS_TOKEN")?.trim();
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")?.trim();
  if (!token || !phoneId) return;
  const to = (Deno.env.get("WHATSAPP_TO")?.trim() || "393791038253").replace(/\D/g, "");
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: text.slice(0, 900) },
    }),
  });
  await discard(res);
}

async function googleAccessToken(signal: AbortSignal) {
  const refresh =
    Deno.env.get("GOOGLE_OAUTH_REFRESH_TOKEN")?.trim() ||
    Deno.env.get("GOOGLE_CALENDAR_REFRESH_TOKEN")?.trim();
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")?.trim();
  if (!refresh || !clientId || !clientSecret) return "";
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    await discard(res);
    return "";
  }
  const data = (await res.json()) as { access_token?: string };
  return data.access_token?.trim() ?? "";
}

type ProbeBase = Pick<Probe, "id" | "label" | "severity">;

async function timed(
  base: ProbeBase,
  run: (signal: AbortSignal) => Promise<Pick<Probe, "status" | "detail">>,
): Promise<Probe> {
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

function skip(base: ProbeBase, detail: string): Probe {
  return { ...base, status: "skipped", ms: 0, detail };
}

function overallOf(probes: Probe[]): Overall {
  const live = probes.filter((probe) => probe.status !== "skipped");
  if (live.some((probe) => probe.status === "down" && probe.severity === "critical")) return "down";
  if (live.some((probe) => probe.status === "down")) return "degraded";
  return "ok";
}

function mergeProbes(vercel: Probe[], edge: Probe[]) {
  const map = new Map<string, Probe>();
  for (const probe of [...vercel, ...edge]) map.set(probe.id, probe);
  return [...map.values()];
}

function isProbe(value: unknown): value is Probe {
  if (!value || typeof value !== "object") return false;
  const row = value as Probe;
  return typeof row.id === "string" && typeof row.status === "string";
}

function hoursSince(value: unknown) {
  if (typeof value !== "string") return 99;
  const then = Date.parse(value);
  if (!Number.isFinite(then)) return 99;
  return (Date.now() - then) / 36e5;
}

function authorize(req: Request) {
  const secret = Deno.env.get("OPS_SENTINEL_SECRET")?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
  return token.length > 0 && timingSafeEqual(token, secret);
}

function timingSafeEqual(a: string, b: string) {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < aa.length; i += 1) out |= aa[i]! ^ bb[i]!;
  return out === 0;
}

async function discard(res: Response) {
  try {
    await res.body?.cancel();
  } catch {
    /* ignore */
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
