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

export async function startDigitalCheckout(
  draft: {
    productId: string;
    name: string;
    phone: string;
  },
  consents: Consents,
) {
  if (!isSupabaseConfigured()) {
    return { error: "pagamentoManca" as const };
  }
  const sb = getSupabaseClient();
  if (!sb) return { error: "pagamentoManca" as const };

  const { data, error } = await sb.functions.invoke("create-digital-checkout", {
    body: {
      productId: draft.productId,
      name: draft.name,
      phone: draft.phone,
      consents,
      returnOrigin: window.location.origin,
    },
  });

  if (error) {
    const msg = [error.message, typeof data === "object" && data && "error" in data ? String((data as { error?: string }).error) : ""]
      .filter(Boolean)
      .join(" ");
    if (/già/i.test(msg) || /possed/i.test(msg) || msg.includes("409")) return { error: "giaTuo" as const, detail: msg };
    return { error: "servizio" as const, detail: error.message };
  }

  const payload = data as { url?: string; orderId?: string; error?: string } | null;
  if (payload?.error) {
    if (/già/i.test(payload.error) || /possed/i.test(payload.error)) {
      return { error: "giaTuo" as const, detail: payload.error };
    }
    return { error: "servizio" as const, detail: payload.error };
  }
  if (!payload?.url) return { error: "servizio" as const };
  if (payload.orderId) sessionStorage.setItem("tarot-italia-checkout-order", payload.orderId);
  return { url: payload.url };
}

export async function syncPaidDigitalOrder(orderId: string) {
  if (!isSupabaseConfigured()) return { error: "servizio" as const };
  const sb = getSupabaseClient();
  if (!sb) return { error: "servizio" as const };
  const { data, error } = await sb.functions.invoke("sync-checkout", {
    body: { orderId, kind: "digital" },
  });
  if (error) return { error: "servizio" as const, detail: error.message };
  const payload = data as { ok?: boolean; status?: string; error?: string } | null;
  if (payload?.error) return { error: "servizio" as const, detail: payload.error };
  return { ok: true as const, status: payload?.status };
}

export async function cancelPendingDigitalCheckout(orderId: string) {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from("digital_orders").update({ status: "cancelled" }).eq("id", orderId).eq("status", "pending_payment");
  sessionStorage.removeItem("tarot-italia-checkout-order");
}
