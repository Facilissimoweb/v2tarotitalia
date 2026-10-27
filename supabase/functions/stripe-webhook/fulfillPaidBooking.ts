import { resolveBookingMode } from "../_shared/bookingRules.ts";
import { sendBookingMails } from "./bookingMail.ts";
import { createCalendarEvent, notifyWhatsApp } from "./bookingNotify.ts";

export function withResolvedMode(row: Record<string, unknown>) {
  return {
    ...row,
    mode: resolveBookingMode(String(row.mode ?? "remote"), String(row.slot ?? "")),
  };
}

export async function fulfillPaidBooking(
  row: Record<string, unknown>,
  extras: { customerEmail: string | null; transactionId: string; amountCents: number | null },
) {
  const booking = withResolvedMode(row);
  try {
    await sendBookingMails(booking, extras);
  } catch (error) {
    console.error("booking mail", error);
  }
  try {
    await createCalendarEvent(booking, extras.customerEmail);
  } catch (error) {
    console.error("booking calendar", error);
  }
  try {
    await notifyWhatsApp(booking);
  } catch (error) {
    console.error("booking whatsapp", error);
  }
}
