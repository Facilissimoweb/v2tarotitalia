/**
 * Crea Checkout Session Stripe per dispense e materiali digitali.
 * Auth: JWT utente. Secrets: STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, SITE_URL
 * Prezzi allineati a src/data/siteContent.ts → pages.corsi.prodotti
 */
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const CATALOG = {
  trattato: { title: "Trattato degli Arcani Maggiori", price: 24, format: "PDF" },
  velo: { title: "Il Velo di Maya", price: 32, format: "Audio + PDF" },
  taccuino: { title: "Taccuino di studio", price: 12, format: "Tavole" },
  alchemici: { title: "Strumenti complementari", price: 18, format: "Tre PDF" },
} as const;

type ProductId = keyof typeof CATALOG;
const HOLD_SECONDS = 30 * 60;

type Body = {
  productId?: string;
  name?: string;
  phone?: string;
  consents?: { privacy?: boolean; adult?: boolean; refund?: boolean };
  returnOrigin?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!stripeKey || !supabaseUrl || !serviceKey) {
    return json({ error: "Servizio di pagamento non configurato." }, 503);
  }

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
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

  const productId = (body.productId ?? "") as ProductId;
  const catalog = CATALOG[productId];
  if (!catalog) return json({ error: "Titolo non valido." }, 400);

  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();
  if (!name || !phone) return json({ error: "Indica nome e recapito." }, 400);
  if (!body.consents?.privacy || !body.consents.adult || !body.consents.refund) {
    return json({ error: "Per procedere è necessario accettare tutti i consensi obbligatori." }, 400);
  }

  const owned = await admin
    .from("digital_orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .in("status", ["confirmed", "completed"])
    .maybeSingle();
  if (owned.data) {
    return json({ error: "Questo titolo è già nel tuo archivio." }, 409);
  }

  await admin
    .from("digital_orders")
    .update({ status: "cancelled" })
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("status", "pending_payment");

  const orderId = crypto.randomUUID();
  const insert = await admin.from("digital_orders").insert({
    id: orderId,
    user_id: user.id,
    product_id: productId,
    title: catalog.title,
    format: catalog.format,
    price: catalog.price,
    guest_name: name,
    phone,
    status: "pending_payment",
    consent_privacy: true,
    consent_adult: true,
    consent_refund: true,
  });
  if (insert.error) {
    console.error("digital insert", insert.error);
    return json({ error: "Non riesco a riservare l’acquisto. Riprova tra poco." }, 500);
  }

  const siteUrl = resolveSiteUrl(body.returnOrigin);
  const gate = encodeURIComponent(Deno.env.get("SITE_ACCESS")?.trim() || "tarot2026");
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: orderId,
      expires_at: Math.floor(Date.now() / 1000) + HOLD_SECONDS,
      success_url: `${siteUrl}/riservata?checkout=ok&order=${orderId}&sezione=corsi&access=${gate}`,
      cancel_url: `${siteUrl}/riservata?checkout=cancel&order=${orderId}&sezione=corsi&access=${gate}`,
      metadata: { kind: "digital", order_id: orderId, product_id: productId, user_id: user.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: catalog.price * 100,
            product_data: {
              name: `Tarot Italia — ${catalog.title}`,
              description: catalog.format,
            },
          },
        },
      ],
    });

    await admin
      .from("digital_orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", orderId);

    if (!session.url) {
      await admin.from("digital_orders").update({ status: "cancelled" }).eq("id", orderId);
      return json({ error: "Stripe non ha restituito l’indirizzo di pagamento." }, 502);
    }
    return json({ url: session.url, orderId }, 200);
  } catch (error) {
    console.error("stripe digital session", error);
    await admin.from("digital_orders").update({ status: "cancelled" }).eq("id", orderId);
    return json({ error: "Il pagamento non è partito. Riprova tra poco." }, 502);
  }
});

function resolveSiteUrl(requested?: string) {
  const fallback = (Deno.env.get("SITE_URL")?.trim() || "https://www.tarotitalia.com").replace(/\/$/, "");
  const allowed = new Set([
    fallback,
    "https://www.tarotitalia.com",
    "https://tarotitalia.com",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:4173",
    "http://localhost:4173",
  ]);
  const raw = (requested ?? "").trim().replace(/\/$/, "");
  if (!raw) return fallback;
  try {
    const origin = new URL(raw).origin;
    if (allowed.has(origin)) return origin;
  } catch {
    /* origin non valido: si usa SITE_URL */
  }
  return fallback;
}

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
