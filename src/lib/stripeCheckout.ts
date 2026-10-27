import { resolveBookingMode } from "./bookingRules";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { Consents, PurchaseDraft } from "./storage";

export async function startStripeCheckout(draft: PurchaseDraft, consents: Consents) {
  if (!isSupabaseConfigured()) {
    return { error: "pagamentoManca" as const };
  }
  const sb = getSupabaseClient();
  if (!sb) return { error: "pagamentoManca" as const };

  const { data, error } = await sb.functions.invoke("create-checkout", {
    body: {
      ...draft,
      mode: resolveBookingMode(draft.mode, draft.slot),
      consents,
      returnOrigin: window.location.origin,
    },
  });

  if (error) {
    const msg = [error.message, typeof data === "object" && data && "error" in data ? String((data as { error?: string }).error) : ""]
      .filter(Boolean)
      .join(" ");
    if (msg.includes("409") || /riservato/i.test(msg)) return { error: "slotOccupato" as const };
    return { error: "servizio" as const, detail: error.message };
  }

  const payload = data as { url?: string; bookingId?: string; error?: string } | null;
  if (payload?.error) {
    if (/riservato/i.test(payload.error)) return { error: "slotOccupato" as const, detail: payload.error };
    return { error: "servizio" as const, detail: payload.error };
  }
  if (!payload?.url) return { error: "servizio" as const };

  if (payload.bookingId) sessionStorage.setItem("tarot-italia-checkout-booking", payload.bookingId);
  return { url: payload.url };
}

export async function requestStripeRefund(bookingId: string) {
  if (!isSupabaseConfigured()) return { error: "rimborsoManca" as const };
  const sb = getSupabaseClient();
  if (!sb) return { error: "rimborsoManca" as const };

  const { data, error } = await sb.functions.invoke("request-refund", {
    body: { bookingId },
  });
  if (error) return { error: "rimborsoManca" as const, detail: error.message };
  const payload = data as { ok?: boolean; error?: string } | null;
  if (payload?.error) return { error: "rimborsoManca" as const, detail: payload.error };
  if (!payload?.ok) return { error: "rimborsoManca" as const };
  return { ok: true as const };
}

export async function syncPaidCheckout(bookingId: string) {
  if (!isSupabaseConfigured()) return { error: "servizio" as const };
  const sb = getSupabaseClient();
  if (!sb) return { error: "servizio" as const };
  const { data, error } = await sb.functions.invoke("sync-checkout", {
    body: { bookingId },
  });
  if (error) return { error: "servizio" as const, detail: error.message };
  const payload = data as { ok?: boolean; status?: string; error?: string } | null;
  if (payload?.error) return { error: "servizio" as const, detail: payload.error };
  return { ok: true as const, status: payload?.status };
}

export async function cancelPendingCheckout(bookingId: string) {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from("bookings").update({ status: "cancelled" }).eq("id", bookingId).eq("status", "pending_payment");
  sessionStorage.removeItem("tarot-italia-checkout-booking");
}
