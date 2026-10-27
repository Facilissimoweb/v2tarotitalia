/**
 * Avvia un rimborso Stripe sulla prenotazione dell’utente autenticato.
 * Auth: JWT. Secrets: STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY
 */
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!stripeKey || !supabaseUrl || !serviceKey) {
    return json({ error: "Servizio di rimborso non configurato." }, 503);
  }

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Per rimborsare è necessario accedere." }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
  const user = userData.user;
  if (userErr || !user?.id) return json({ error: "Sessione non valida." }, 401);

  let bookingId = "";
  try {
    const body = (await req.json()) as { bookingId?: string };
    bookingId = (body.bookingId ?? "").trim();
  } catch {
    return json({ error: "Richiesta non valida." }, 400);
  }
  if (!bookingId) return json({ error: "Prenotazione mancante." }, 400);

  const { data: row, error: loadErr } = await admin
    .from("bookings")
    .select("id, user_id, status, stripe_payment_intent_id, stripe_checkout_session_id")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadErr || !row) return json({ error: "Prenotazione non trovata." }, 404);
  if (row.status === "cancelled") return json({ ok: true }, 200);
  if (row.status !== "confirmed") {
    return json({ error: "Questa sessione non può essere rimborsata da qui." }, 409);
  }
  if (!row.stripe_payment_intent_id) {
    return json({ error: "Questa prenotazione non ha un pagamento Stripe." }, 409);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  try {
    await stripe.refunds.create({
      payment_intent: row.stripe_payment_intent_id,
      reason: "requested_by_customer",
      metadata: {
        booking_id: row.id,
        user_id: user.id,
        checkout_session_id: row.stripe_checkout_session_id || "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/already been refunded|has already been refunded/i.test(message)) {
      console.error("stripe refund", error);
      return json({ error: "Stripe non ha potuto rimborsare. Riprova tra poco." }, 502);
    }
  }

  const cancelled = await admin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", row.id)
    .eq("user_id", user.id)
    .eq("status", "confirmed");
  if (cancelled.error) {
    console.error("refund cancel", cancelled.error);
  }

  return json({ ok: true, bookingId: row.id }, 200);
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
