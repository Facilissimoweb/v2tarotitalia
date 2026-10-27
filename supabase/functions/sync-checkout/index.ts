/**
 * Allinea una prenotazione a Stripe se il pagamento è già andato a buon fine
 * ma il webhook non ha ancora scritto confirmed.
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
    return json({ error: "Servizio non configurato." }, 503);
  }

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "Per verificare il pagamento è necessario accedere." }, 401);

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

  const { data: row } = await admin
    .from("bookings")
    .select("id, user_id, status, stripe_checkout_session_id")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) return json({ error: "Prenotazione non trovata." }, 404);
  if (row.status === "confirmed" || row.status === "completed") return json({ ok: true, status: row.status }, 200);
  if (row.status !== "pending_payment" || !row.stripe_checkout_session_id) {
    return json({ ok: true, status: row.status }, 200);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(row.stripe_checkout_session_id);
  } catch (error) {
    console.error("stripe retrieve", error);
    return json({ error: "Non riesco a verificare il pagamento su Stripe." }, 502);
  }

  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) return json({ ok: true, status: row.status }, 200);

  const confirmed = await admin
    .from("bookings")
    .update({
      status: "confirmed",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      stripe_amount_total: typeof session.amount_total === "number" ? session.amount_total : null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("status", "pending_payment");
  if (confirmed.error) {
    console.error("sync confirm", confirmed.error);
    return json({ error: "Non riesco ad aggiornare la prenotazione." }, 500);
  }

  return json({ ok: true, status: "confirmed" }, 200);
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
