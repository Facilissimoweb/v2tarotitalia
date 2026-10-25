/**
 * Tarot Italia — Welcome email (Zoho SMTP)
 *
 * Trigger: Supabase Database Webhook on INSERT (auth.users or public.profiles).
 * Secrets: ZOHO_EMAIL, ZOHO_PASSWORD, WELCOME_EMAIL_WEBHOOK_SECRET
 * Optional: ZOHO_SMTP_HOST (default smtp.zoho.eu), ZOHO_SMTP_PORT (default 465)
 */
import nodemailer from "npm:nodemailer@6.9.16";
import { WELCOME_HTML, WELCOME_TEXT } from "./welcomeHtml.ts";

const FROM_ADDRESS = "info@tarotitalia.com";
const FROM_NAME = "Maria Teresa Rogani · Tarot Italia";
const SUBJECT = "Benvenuta, benvenuto in Tarot Italia: il tuo spazio è pronto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!authorize(req)) {
    return json({ error: "Unauthorized" }, 401);
  }

  const zohoUser = Deno.env.get("ZOHO_EMAIL")?.trim();
  const zohoPass = Deno.env.get("ZOHO_PASSWORD");
  if (!zohoUser || !zohoPass) {
    console.error("Missing ZOHO_EMAIL or ZOHO_PASSWORD secrets");
    return json({ error: "Email service not configured" }, 503);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const email = extractEmail(payload);
  if (!email || !EMAIL_RE.test(email)) {
    console.error("Welcome email skipped: no valid email in payload");
    return json({ error: "No valid email in webhook payload" }, 400);
  }

  const host = Deno.env.get("ZOHO_SMTP_HOST")?.trim() || "smtp.zoho.eu";
  const port = Number(Deno.env.get("ZOHO_SMTP_PORT") || "465");
  const secure = port === 465;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: zohoUser,
        pass: zohoPass,
      },
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 30_000,
    });

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      replyTo: FROM_ADDRESS,
      to: email,
      subject: SUBJECT,
      text: WELCOME_TEXT,
      html: WELCOME_HTML,
    });

    await transporter.close();

    console.log(`Welcome email sent to ${maskEmail(email)}`);
    return json({ ok: true }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMTP failure";
    console.error("Welcome email SMTP error:", message);
    return json({ error: "Failed to send welcome email" }, 500);
  }
});

function authorize(req: Request): boolean {
  const secret = Deno.env.get("WELCOME_EMAIL_WEBHOOK_SECRET")?.trim();
  if (!secret) {
    console.error("Missing WELCOME_EMAIL_WEBHOOK_SECRET");
    return false;
  }

  const header = req.headers.get("authorization") ?? "";
  const bearer = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const custom = req.headers.get("x-webhook-secret")?.trim();
  const candidate = bearer || custom || "";

  return candidate.length > 0 && timingSafeEqual(candidate, secret);
}

/** Extract email from Database Webhook / Auth Hook / manual test payloads. */
function extractEmail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const direct = asEmail(root.email);
  if (direct) return direct;

  const record = asRecord(root.record) ?? asRecord(asRecord(root.body)?.record);
  if (record) {
    const fromRecord = asEmail(record.email);
    if (fromRecord) return fromRecord;
  }

  const user = asRecord(root.user) ?? asRecord(asRecord(root.data)?.user);
  if (user) {
    const fromUser = asEmail(user.email);
    if (fromUser) return fromUser;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email || null;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < aa.length; i++) out |= aa[i]! ^ bb[i]!;
  return out === 0;
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-webhook-secret, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
