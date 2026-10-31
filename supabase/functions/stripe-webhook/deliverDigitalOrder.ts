import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendDigitalDeliveryMail } from "./digitalMail.ts";

type Admin = SupabaseClient;

export async function deliverDigitalOrder(
  admin: Admin,
  orderId: string,
  extras?: { customerEmail?: string | null; transactionId?: string; amountCents?: number | null },
) {
  const { data: row } = await admin
    .from("digital_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!row) return;
  if (row.status !== "confirmed" && row.status !== "completed") return;
  if (row.email_sent_at) return;

  const claimed = await admin
    .from("digital_orders")
    .update({ email_sent_at: new Date().toISOString(), email_error: null, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("email_sent_at", null)
    .in("status", ["confirmed", "completed"])
    .select("*")
    .maybeSingle();
  if (claimed.error) {
    console.error("digital email claim", claimed.error);
    return;
  }
  if (!claimed.data) return;

  const customerEmail = extras?.customerEmail || (await emailForUser(admin, String(claimed.data.user_id)));
  const transactionId =
    extras?.transactionId ||
    String(claimed.data.stripe_payment_intent_id || claimed.data.stripe_checkout_session_id || claimed.data.id);
  const amountCents =
    extras?.amountCents ??
    (typeof claimed.data.stripe_amount_total === "number" ? claimed.data.stripe_amount_total : null);

  try {
    const messageId = await sendDigitalDeliveryMail(claimed.data, {
      customerEmail,
      transactionId,
      amountCents,
    });
    await admin
      .from("digital_orders")
      .update({
        email_message_id: messageId,
        email_error: customerEmail ? null : "Destinatario senza email.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  } catch (error) {
    console.error("digital mail", error);
    await admin
      .from("digital_orders")
      .update({
        email_sent_at: null,
        email_error: error instanceof Error ? error.message.slice(0, 500) : "Invio non riuscito.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }
}

async function emailForUser(admin: Admin, userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}
