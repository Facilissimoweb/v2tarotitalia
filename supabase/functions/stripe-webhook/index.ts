/**
 * Webhook Stripe: conferma o libera lo slot; mail, Calendar e WhatsApp.
 * verify_jwt = false. Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 * SUPABASE_SERVICE_ROLE_KEY, ZOHO_EMAIL, ZOHO_PASSWORD,
 * Google Calendar OAuth o service account, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID
 */
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { resolveBookingMode } from "../_shared/bookingRules.ts";
import { fulfillPaidBooking } from "./fulfillPaidBooking.ts";
import { deliverDigitalOrder } from "./deliverDigitalOrder.ts";

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
    if (session.metadata?.kind === "digital") {
      await fulfillDigitalOrder(admin, session);
      return new Response("ok", { status: 200 });
    }
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

    const paidFields = {
      status: "confirmed",
      mode: resolveBookingMode(String(row.mode ?? "remote"), String(row.slot ?? "")),
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      stripe_amount_total: typeof session.amount_total === "number" ? session.amount_total : null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    let confirmed = await admin
      .from("bookings")
      .update(paidFields)
      .eq("id", bookingId)
      .in("status", ["pending_payment", "pending", "pending_whatsapp", "cancelled"])
      .select("*");
    if (confirmed.error) {
      console.error("booking confirm full", confirmed.error);
      confirmed = await admin
        .from("bookings")
        .update({
          status: "confirmed",
          mode: paidFields.mode,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: paidFields.stripe_payment_intent_id,
        })
        .eq("id", bookingId)
        .in("status", ["pending_payment", "pending", "pending_whatsapp", "cancelled"])
        .select("*");
      if (confirmed.error) {
        console.error("booking confirm", confirmed.error);
        return new Response("ok", { status: 200 });
      }
    }
    const booked = confirmed.data?.[0];
    if (!booked) return new Response("ok", { status: 200 });

    const customerEmail =
      session.customer_email || session.customer_details?.email || (await emailForUser(admin, row.user_id));
    await fulfillPaidBooking(booked, {
      customerEmail,
      transactionId: paidFields.stripe_payment_intent_id || session.id,
      amountCents: typeof session.amount_total === "number" ? session.amount_total : null,
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.kind === "digital") {
      const orderId = session.metadata?.order_id || session.client_reference_id;
      if (orderId) {
        await admin
          .from("digital_orders")
          .update({ status: "cancelled" })
          .eq("id", orderId)
          .eq("status", "pending_payment");
      }
    } else {
      const bookingId = session.metadata?.booking_id || session.client_reference_id;
      if (bookingId) {
        await admin
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId)
          .eq("status", "pending_payment");
      }
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

async function fulfillDigitalOrder(
  admin: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId) return;
  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  await admin
    .from("digital_orders")
    .update({
      status: "confirmed",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
      stripe_amount_total: typeof session.amount_total === "number" ? session.amount_total : null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .in("status", ["pending_payment", "pending", "cancelled"]);

  const customerEmail =
    session.customer_email || session.customer_details?.email || (await emailForUser(admin, session.metadata?.user_id ?? null));
  try {
    await deliverDigitalOrder(admin, orderId, {
      customerEmail,
      transactionId: paymentIntent || session.id,
      amountCents: typeof session.amount_total === "number" ? session.amount_total : null,
    });
  } catch (error) {
    console.error("digital delivery", error);
  }
}

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

    const digitalByIntent = await admin
      .from("digital_orders")
      .update({ status: "cancelled" })
      .eq("stripe_payment_intent_id", paymentIntent)
      .in("status", ["pending_payment", "pending", "confirmed"])
      .select("id");
    if (digitalByIntent.data && digitalByIntent.data.length > 0) return;
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
