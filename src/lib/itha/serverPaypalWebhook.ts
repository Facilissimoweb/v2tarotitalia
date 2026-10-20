import { siteContent } from "../../data/siteContent.ts";
import type { NodeLikeReq } from "./http.ts";
import { readHeader } from "./http.ts";
import {
  completeIthaOrderIfPending,
  paypalToken,
  refundIthaOrderIfCompleted,
} from "./serverPaypal.ts";
import { paypalBaseUrl, paypalCredentialsReady, paypalWebhookId } from "./serverEnv.ts";

const { itha } = siteContent;

type PaypalResult = { status: number; body: Record<string, unknown> };

type PaypalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
    links?: Array<{ rel?: string; href?: string }>;
  };
};

function headerBundle(req: NodeLikeReq) {
  return {
    transmissionId: readHeader(req, "paypal-transmission-id"),
    transmissionTime: readHeader(req, "paypal-transmission-time"),
    transmissionSig: readHeader(req, "paypal-transmission-sig"),
    certUrl: readHeader(req, "paypal-cert-url"),
    authAlgo: readHeader(req, "paypal-auth-algo"),
  };
}

async function verifyWebhookSignature(req: NodeLikeReq, event: PaypalWebhookEvent): Promise<"ok" | "config" | "invalid"> {
  const webhookId = paypalWebhookId();
  if (!paypalCredentialsReady() || !webhookId) return "config";

  const headers = headerBundle(req);
  if (
    !headers.transmissionId ||
    !headers.transmissionTime ||
    !headers.transmissionSig ||
    !headers.certUrl ||
    !headers.authAlgo
  ) {
    return "invalid";
  }

  const access = await paypalToken();
  if (!access.ok) return access.reason === "config" ? "config" : "invalid";

  try {
    const response = await fetch(`${paypalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transmission_id: headers.transmissionId,
        transmission_time: headers.transmissionTime,
        cert_url: headers.certUrl,
        auth_algo: headers.authAlgo,
        transmission_sig: headers.transmissionSig,
        webhook_id: webhookId,
        webhook_event: event,
      }),
    });
    const json = (await response.json().catch(() => null)) as { verification_status?: string } | null;
    if (!response.ok || json?.verification_status !== "SUCCESS") return "invalid";
    return "ok";
  } catch {
    return "invalid";
  }
}

function orderIdFromCaptureResource(resource: PaypalWebhookEvent["resource"]) {
  const related = resource?.supplementary_data?.related_ids?.order_id?.trim();
  if (related) return related;
  const up = resource?.links?.find((link) => link.rel === "up" || link.rel === "order");
  const match = up?.href?.match(/\/orders\/([A-Z0-9]+)/i);
  return match?.[1] ?? "";
}

function orderIdFromRefundResource(resource: PaypalWebhookEvent["resource"]) {
  const up = resource?.links?.find((link) => /capture/i.test(link.rel ?? "") || /captures\//i.test(link.href ?? ""));
  const captureMatch = up?.href?.match(/\/captures\/([A-Z0-9]+)/i);
  // Prefer order id if PayPal includes it; otherwise resolve via capture → order later if needed.
  const related = resource?.supplementary_data?.related_ids?.order_id?.trim();
  if (related) return related;
  return captureMatch?.[1] ? `capture:${captureMatch[1]}` : "";
}

async function resolveOrderIdFromCaptureId(captureId: string) {
  const access = await paypalToken();
  if (!access.ok) return "";
  try {
    const response = await fetch(`${paypalBaseUrl()}/v2/payments/captures/${captureId}`, {
      headers: { Authorization: `Bearer ${access.token}` },
    });
    const json = (await response.json().catch(() => null)) as {
      supplementary_data?: { related_ids?: { order_id?: string } };
      links?: Array<{ rel?: string; href?: string }>;
    } | null;
    if (!response.ok || !json) return "";
    const related = json.supplementary_data?.related_ids?.order_id?.trim();
    if (related) return related;
    const orderLink = json.links?.find((link) => /orders\//i.test(link.href ?? ""));
    return orderLink?.href?.match(/\/orders\/([A-Z0-9]+)/i)?.[1] ?? "";
  } catch {
    return "";
  }
}

async function resolvePaypalOrderId(eventType: string, resource: PaypalWebhookEvent["resource"]) {
  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    return orderIdFromCaptureResource(resource);
  }
  if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
    const raw = orderIdFromRefundResource(resource);
    if (raw.startsWith("capture:")) {
      return resolveOrderIdFromCaptureId(raw.slice("capture:".length));
    }
    return raw;
  }
  return "";
}

export async function handlePaypalWebhook(req: NodeLikeReq, event: PaypalWebhookEvent): Promise<PaypalResult> {
  const verified = await verifyWebhookSignature(req, event);
  if (verified === "config") {
    return { status: 503, body: { error: itha.paypalManca, code: "paypal-webhook-config" } };
  }
  if (verified === "invalid") {
    return { status: 400, body: { error: itha.paypalAuth, code: "paypal-webhook-invalid" } };
  }

  const eventType = event.event_type ?? "";
  if (eventType !== "PAYMENT.CAPTURE.COMPLETED" && eventType !== "PAYMENT.CAPTURE.REFUNDED") {
    return { status: 200, body: { ok: true, ignored: true, eventType } };
  }

  const orderId = await resolvePaypalOrderId(eventType, event.resource);
  if (!orderId) {
    return { status: 200, body: { ok: true, ignored: true, reason: "order-unresolved", eventType } };
  }

  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const settled = await completeIthaOrderIfPending(orderId);
    if (!settled.ok) {
      if (settled.code === "order-missing") {
        return { status: 200, body: { ok: true, ignored: true, reason: "order-missing", orderId } };
      }
      if (settled.code === "supabase-config") {
        return { status: 503, body: { error: itha.paypalManca, code: settled.code } };
      }
      return { status: 500, body: { error: itha.paypalOrdine, code: settled.code } };
    }
    return {
      status: 200,
      body: {
        ok: true,
        eventType,
        orderId,
        credited: settled.credited,
        credits: settled.balance,
      },
    };
  }

  const refunded = await refundIthaOrderIfCompleted(orderId);
  if (!refunded.ok) {
    if (refunded.code === "supabase-config") {
      return { status: 503, body: { error: itha.paypalManca, code: refunded.code } };
    }
    return { status: 500, body: { error: itha.paypalOrdine, code: refunded.code } };
  }
  return {
    status: 200,
    body: {
      ok: true,
      eventType,
      orderId,
      refunded: refunded.refunded,
    },
  };
}
