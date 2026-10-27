/**
 * Webhook Stripe: conferma o libera lo slot; invia le mail.
 * verify_jwt = false. Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 * SUPABASE_SERVICE_ROLE_KEY, ZOHO_EMAIL, ZOHO_PASSWORD
 */
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import nodemailer from "npm:nodemailer@6.9.16";

const FROM_ADDRESS = "info@tarotitalia.com";
const FROM_NAME = "Maria Teresa Rogani · Tarot Italia";
const STUDIO = "info@tarotitalia.com";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response("not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing signature", { status: 400 });

  const raw = await req.text();
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, webhookSecret);
  } catch (error) {
    console.error("stripe signature", error);
    return new Response("invalid signature", { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id || session.client_reference_id;
    if (!bookingId) return new Response("ok", { status: 200 });

    const { data: row } = await admin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (!row || row.status === "confirmed" || row.status === "completed") {
      return new Response("ok", { status: 200 });
    }

    const confirmed = await admin
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      })
      .eq("id", bookingId)
      .in("status", ["pending_payment", "pending", "pending_whatsapp", "cancelled"]);
    if (confirmed.error) {
      console.error("booking confirm", confirmed.error);
      return new Response("ok", { status: 200 });
    }

    const customerEmail =
      session.customer_email || session.customer_details?.email || (await emailForUser(admin, row.user_id));
    try {
      await sendBookingMails(row, customerEmail);
    } catch (error) {
      console.error("booking mail", error);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id || session.client_reference_id;
    if (bookingId) {
      await admin
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("status", "pending_payment");
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.refunded) {
      await releaseBookingAfterRefund(admin, stripe, charge);
    }
  }

  return new Response("ok", { status: 200 });
});

async function releaseBookingAfterRefund(
  admin: ReturnType<typeof createClient>,
  stripe: Stripe,
  charge: Stripe.Charge,
) {
  const paymentIntent =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;

  if (paymentIntent) {
    const byIntent = await admin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("stripe_payment_intent_id", paymentIntent)
      .in("status", ["pending_payment", "pending", "pending_whatsapp", "confirmed"])
      .select("id");
    if (byIntent.error) {
      console.error("refund cancel by intent", byIntent.error);
    }
    if (byIntent.data && byIntent.data.length > 0) return;
  }

  if (!paymentIntent) return;

  try {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntent, limit: 1 });
    const session = sessions.data[0];
    if (!session) return;
    const bookingId = session.metadata?.booking_id || session.client_reference_id;
    const query = admin
      .from("bookings")
      .update({ status: "cancelled" })
      .in("status", ["pending_payment", "pending", "pending_whatsapp", "confirmed"]);
    if (bookingId) {
      await query.eq("id", bookingId);
      return;
    }
    if (session.id) {
      await query.eq("stripe_checkout_session_id", session.id);
    }
  } catch (error) {
    console.error("refund lookup", error);
  }
}

async function emailForUser(
  admin: ReturnType<typeof createClient>,
  userId: string | null,
): Promise<string | null> {
  if (!userId) return null;
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

async function sendBookingMails(row: Record<string, unknown>, customerEmail: string | null) {
  const zohoUser = Deno.env.get("ZOHO_EMAIL")?.trim();
  const zohoPass = Deno.env.get("ZOHO_PASSWORD");
  if (!zohoUser || !zohoPass) {
    console.error("Missing ZOHO secrets — booking mail skipped");
    return;
  }

  const host = Deno.env.get("ZOHO_SMTP_HOST")?.trim() || "smtp.zoho.eu";
  const port = Number(Deno.env.get("ZOHO_SMTP_PORT") || "465");
  const day = String(row.session_date ?? "");
  const slot = String(row.slot ?? "");
  const name = String(row.guest_name ?? "");
  const phone = String(row.phone ?? "");
  const title = row.consult_type === "deep" ? "Consulto di 1 ora" : "Consulto di 30 minuti";
  const mode = row.mode === "remote" ? "Chiamata vocale WhatsApp" : "In studio a Macerata";
  const total = String(row.total_price ?? "");
  const text = [
    `Prenotazione confermata — Tarot Italia`,
    `Nome: ${name}`,
    `Recapito: ${phone}`,
    `Sessione: ${title}`,
    `Quando: ${day} · ${slot}`,
    `Modalità: ${mode}`,
    `Totale: €${total}`,
  ].join("\n");

  const html = `<div style="font-family:Georgia,serif;color:#2B2523;background:#F9F8F6;padding:28px">
  <p>Tarot Italia</p>
  <h1 style="font-weight:400">Prenotazione confermata</h1>
  <p>${escapeHtml(name)} · ${escapeHtml(phone)}</p>
  <p>${escapeHtml(title)}<br>${escapeHtml(day)} · ${escapeHtml(slot)}<br>${escapeHtml(mode)}<br>Totale €${escapeHtml(total)}</p>
  <p>A presto,<br>Maria Teresa Rogani</p>
</div>`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: zohoUser, pass: zohoPass },
  });

  if (customerEmail) {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      replyTo: FROM_ADDRESS,
      to: customerEmail,
      subject: `Prenotazione confermata — ${day} · ${slot}`,
      text,
      html,
    });
  }

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    replyTo: customerEmail || FROM_ADDRESS,
    to: STUDIO,
    subject: `Nuova prenotazione — ${name} · ${day} ${slot}`,
    text,
    html,
  });

  await transporter.close();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
