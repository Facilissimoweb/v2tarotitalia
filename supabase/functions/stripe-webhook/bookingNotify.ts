import { isEveningSlot, sessionModeLabel } from "../_shared/bookingRules.ts";

const TIMEZONE = "Europe/Rome";

export function bookingSummary(row: Record<string, unknown>) {
  const day = String(row.session_date ?? "");
  const slot = String(row.slot ?? "");
  const name = String(row.guest_name ?? "").trim() || "Gentile";
  const phone = String(row.phone ?? "");
  const minutes = Number(row.minutes ?? 30) || 30;
  const title = row.consult_type === "deep" ? "Consulto di 1 ora" : "Consulto di 30 minuti";
  const mode = sessionModeLabel(String(row.mode ?? "remote"), slot);
  const evening = isEveningSlot(slot);
  return { day, slot, name, phone, minutes, title, mode, evening, id: String(row.id ?? "") };
}

export async function createCalendarEvent(row: Record<string, unknown>, customerEmail: string | null) {
  const token = await googleAccessToken();
  if (!token) {
    console.error("Google Calendar skipped — missing OAuth or service account secrets");
    return;
  }
  const calendarId =
    Deno.env.get("GOOGLE_CALENDAR_ID")?.trim() ||
    Deno.env.get("GOOGLE_CALENDAR_EMAIL")?.trim() ||
    "mariateresarogani@gmail.com";
  const info = bookingSummary(row);
  if (!info.day || !info.slot) return;

  const start = `${info.day}T${info.slot}:00`;
  const end = addMinutes(info.day, info.slot, info.minutes);
  const body: Record<string, unknown> = {
    summary: `Tarot Italia · ${info.title} · ${info.name}`,
    description: [
      info.title,
      `Quando: ${info.day} · ${info.slot}`,
      `Modalità: ${info.mode}`,
      `Recapito: ${info.phone}`,
      customerEmail ? `Email: ${customerEmail}` : "",
      `Riferimento: ${info.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: start, timeZone: TIMEZONE },
    end: { dateTime: end, timeZone: TIMEZONE },
    transparency: "opaque",
    status: "confirmed",
    reminders: { useDefault: true },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=none`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    console.error("Google Calendar insert", res.status, await res.text());
  }
}

export async function notifyWhatsApp(row: Record<string, unknown>) {
  const token = Deno.env.get("WHATSAPP_TOKEN")?.trim() || Deno.env.get("WHATSAPP_ACCESS_TOKEN")?.trim();
  const phoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")?.trim();
  if (!token || !phoneId) {
    console.error("WhatsApp notify skipped — missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return;
  }
  const to = (Deno.env.get("WHATSAPP_TO")?.trim() || "393791038253").replace(/\D/g, "");
  const info = bookingSummary(row);
  const text = [
    "Nuova prenotazione confermata — Tarot Italia",
    `Nome: ${info.name}`,
    `Quando: ${info.day} · ${info.slot}`,
    `Modalità: ${info.mode}`,
    `Recapito: ${info.phone}`,
    `Riferimento: ${info.id}`,
  ].join("\n");

  const template = Deno.env.get("WHATSAPP_TEMPLATE")?.trim();
  const payload = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: Deno.env.get("WHATSAPP_TEMPLATE_LANG")?.trim() || "it" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: info.name },
                { type: "text", text: `${info.day} · ${info.slot}` },
                { type: "text", text: info.mode },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      };

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("WhatsApp notify", res.status, await res.text());
  }
}

function addMinutes(day: string, slot: string, minutes: number) {
  const [hour, minute] = slot.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const pad = (n: number) => String(n).padStart(2, "0");
  const daysAhead = Math.floor(total / (24 * 60));
  const mins = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const endH = Math.floor(mins / 60);
  const endM = mins % 60;
  if (!daysAhead) return `${day}T${pad(endH)}:${pad(endM)}:00`;
  const [year, month, date] = day.split("-").map(Number);
  const next = new Date(year, month - 1, date + daysAhead);
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(endH)}:${pad(endM)}:00`;
}

async function googleAccessToken() {
  const refresh =
    Deno.env.get("GOOGLE_OAUTH_REFRESH_TOKEN")?.trim() ||
    Deno.env.get("GOOGLE_CALENDAR_REFRESH_TOKEN")?.trim();
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET")?.trim();
  if (refresh && clientId && clientSecret) {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const data = (await res.json()) as { access_token?: string };
    if (!res.ok || !data.access_token) {
      console.error("Google OAuth token", res.status, data);
      return null;
    }
    return data.access_token;
  }

  const email = Deno.env.get("GOOGLE_CLIENT_EMAIL")?.trim();
  const key = Deno.env.get("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n").trim();
  if (!email || !key) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signature = await signRs256(unsigned, key);
  const assertion = `${unsigned}.${signature}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = (await res.json()) as { access_token?: string };
  if (!res.ok || !data.access_token) {
    console.error("Google service account token", res.status, data);
    return null;
  }
  return data.access_token;
}

function b64url(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signRs256(data: string, pem: string) {
  const pemBody = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s+/g, "");
  const raw = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(data));
  return b64url(sig);
}
