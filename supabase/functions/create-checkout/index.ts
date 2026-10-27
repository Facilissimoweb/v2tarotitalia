/**
 * Crea Checkout Session Stripe e riserva lo slot (pending_payment).
 * Auth: JWT utente. Secrets: STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SITE_URL
 */
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const FOCUS = { type: "focus", minutes: 30, price: 40, title: "Consulto di 30 minuti" };
const DEEP = { type: "deep", minutes: 60, price: 60, title: "Consulto di 1 ora" };
const PDF_PRICE = 10;
const HOLD_SECONDS = 30 * 60;

type Body = {
  type?: string;
  minutes?: number;
  consultPrice?: number;
  pdf?: boolean;
  pdfPrice?: number;
  total?: number;
  mode?: string;
  dateIso?: string;
  slot?: string;
  name?: string;
  phone?: string;
  birth?: string;
  query?: string;
  consents?: { privacy?: boolean; adult?: boolean; refund?: boolean };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const siteUrl = (Deno.env.get("SITE_URL")?.trim() || "https://www.tarotitalia.com").replace(/\/$/, "");
  if (!stripeKey || !supabaseUrl || !serviceKey) {
    return json({ error: "Servizio di pagamento non configurato." }, 503);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Per pagare è necessario accedere." }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  const user = userData.user;
  if (userErr || !user?.id || !user.email) {
    return json({ error: "Sessione non valida. Accedi di nuovo." }, 401);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Richiesta non valida." }, 400);
  }

  const catalog = body.type === "deep" ? DEEP : body.type === "focus" ? FOCUS : null;
  if (!catalog) return json({ error: "Tipo di consulto non valido." }, 400);
  if (body.mode !== "studio" && body.mode !== "remote") {
    return json({ error: "Modalità non valida." }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dateIso ?? "") || !/^\d{2}:\d{2}$/.test(body.slot ?? "")) {
    return json({ error: "Seleziona una fascia oraria disponibile." }, 400);
  }
  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  if (!name || !phone) return json({ error: "Indica nome e recapito." }, 400);
  if (!body.consents?.privacy || !body.consents.adult || !body.consents.refund) {
    return json({ error: "Per procedere è necessario accettare tutti i consensi obbligatori." }, 400);
  }

  const pdf = Boolean(body.pdf);
  const total = catalog.price + (pdf ? PDF_PRICE : 0);
  const bookingId = crypto.randomUUID();

  const insert = await admin.from("bookings").insert({
    id: bookingId,
    user_id: user.id,
    consult_type: catalog.type,
    minutes: catalog.minutes,
    consult_price: catalog.price,
    pdf_report: pdf,
    pdf_price: pdf ? PDF_PRICE : 0,
    total_price: total,
    mode: body.mode,
    session_date: body.dateIso,
    slot: body.slot,
    guest_name: name,
    phone,
    birth: body.birth || null,
    query: body.query || null,
    status: "pending_payment",
    consent_privacy: true,
    consent_adult: true,
    consent_refund: true,
  });

  if (insert.error) {
    if (insert.error.code === "23505") {
      return json({ error: "Questo orario è appena stato riservato. Scegline un altro." }, 409);
    }
    console.error("booking insert", insert.error);
    return json({ error: "Non riesco a riservare lo slot. Riprova tra poco." }, 500);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: catalog.price * 100,
        product_data: {
          name: `Tarot Italia — ${catalog.title}`,
          description: `${body.dateIso} · ${body.slot} · ${body.mode === "remote" ? "WhatsApp" : "In studio"}`,
        },
      },
    },
  ];
  if (pdf) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: PDF_PRICE * 100,
        product_data: { name: "Report di sintesi in PDF" },
      },
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: bookingId,
      expires_at: Math.floor(Date.now() / 1000) + HOLD_SECONDS,
      success_url: `${siteUrl}/riservata?checkout=ok`,
      cancel_url: `${siteUrl}/riservata?checkout=cancel&booking=${bookingId}`,
      metadata: { booking_id: bookingId, user_id: user.id },
      line_items: lineItems,
    });

    await admin
      .from("bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", bookingId);

    if (!session.url) {
      await admin.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      return json({ error: "Stripe non ha restituito l’indirizzo di pagamento." }, 502);
    }
    return json({ url: session.url, bookingId }, 200);
  } catch (error) {
    console.error("stripe session", error);
    await admin.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    return json({ error: "Il pagamento non è partito. Riprova tra poco." }, 502);
  }
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
}
