import { createClient } from "@supabase/supabase-js";
import { siteContent } from "../../data/siteContent.ts";
import { ITHA_PLAN_CREDITS, type IthaPlanId } from "./types.ts";
import {
  paypalBaseUrl,
  paypalClientId,
  paypalCredentialsReady,
  paypalSecret,
  supabaseAnonKey,
  supabaseServiceKey,
  supabaseUrl,
} from "./serverEnv.ts";

const { itha } = siteContent;

type PaypalResult = { status: number; body: Record<string, unknown> };

function isPlanId(value: string): value is IthaPlanId {
  return value in ITHA_PLAN_CREDITS;
}

function configMissing(): PaypalResult {
  return { status: 503, body: { error: itha.paypalManca, code: "paypal-config" } };
}

function authFailed(): PaypalResult {
  return { status: 502, body: { error: itha.paypalAuth, code: "paypal-auth" } };
}

function orderFailed(): PaypalResult {
  return { status: 502, body: { error: itha.paypalOrdine, code: "paypal-order" } };
}

export async function paypalToken(): Promise<{ ok: true; token: string } | { ok: false; reason: "config" | "auth" }> {
  if (!paypalCredentialsReady()) return { ok: false, reason: "config" };
  const id = paypalClientId();
  const secret = paypalSecret();
  const auth = btoa(`${id}:${secret}`);
  let response: Response;
  try {
    response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
  } catch {
    return { ok: false, reason: "auth" };
  }
  if (response.status === 401 || response.status === 403) return { ok: false, reason: "auth" };
  if (!response.ok) return { ok: false, reason: "auth" };
  const json = (await response.json().catch(() => null)) as { access_token?: string } | null;
  if (!json?.access_token) return { ok: false, reason: "auth" };
  return { ok: true, token: json.access_token };
}

/** Accredita solo se l’ordine è ancora `created` (idempotente vs webhook). */
export async function completeIthaOrderIfPending(orderId: string) {
  const url = supabaseUrl();
  const service = supabaseServiceKey();
  if (!url || !service) return { ok: false as const, code: "supabase-config" as const };
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: claimed, error: claimError } = await admin
    .from("itha_orders")
    .update({ status: "completed" })
    .eq("paypal_order_id", orderId)
    .eq("status", "created")
    .select("user_id, plan_id, credits")
    .maybeSingle();
  if (claimError) return { ok: false as const, code: "order-persist" as const };
  if (!claimed) {
    const { data: existing } = await admin
      .from("itha_orders")
      .select("user_id, plan_id, credits, status")
      .eq("paypal_order_id", orderId)
      .maybeSingle();
    if (!existing) return { ok: false as const, code: "order-missing" as const };
    const { data: profile } = await admin
      .from("profiles")
      .select("itha_credits")
      .eq("id", existing.user_id)
      .maybeSingle();
    return {
      ok: true as const,
      credited: false as const,
      userId: existing.user_id as string,
      planId: existing.plan_id as string,
      credits: existing.credits as number,
      balance: Number(profile?.itha_credits ?? 0),
      status: existing.status as string,
    };
  }
  const { data: balance, error: creditError } = await admin.rpc("add_itha_credits", {
    p_user: claimed.user_id,
    p_credits: claimed.credits,
  });
  if (creditError) return { ok: false as const, code: "credits" as const };
  return {
    ok: true as const,
    credited: true as const,
    userId: claimed.user_id as string,
    planId: claimed.plan_id as string,
    credits: claimed.credits as number,
    balance: balance as number,
    status: "completed",
  };
}

/** Scala crediti solo se l’ordine era `completed` (idempotente vs doppio webhook). */
export async function refundIthaOrderIfCompleted(orderId: string) {
  const url = supabaseUrl();
  const service = supabaseServiceKey();
  if (!url || !service) return { ok: false as const, code: "supabase-config" as const };
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: claimed, error: claimError } = await admin
    .from("itha_orders")
    .update({ status: "refunded" })
    .eq("paypal_order_id", orderId)
    .eq("status", "completed")
    .select("user_id, plan_id, credits")
    .maybeSingle();
  if (claimError) return { ok: false as const, code: "order-persist" as const };
  if (!claimed) {
    return { ok: true as const, refunded: false as const };
  }
  const { error: creditError } = await admin.rpc("subtract_itha_credits", {
    p_user: claimed.user_id,
    p_credits: claimed.credits,
  });
  if (creditError) return { ok: false as const, code: "credits" as const };
  return {
    ok: true as const,
    refunded: true as const,
    userId: claimed.user_id as string,
    credits: claimed.credits as number,
  };
}

async function userFromToken(token: string) {
  const url = supabaseUrl();
  const anon = supabaseAnonKey();
  if (!url || !anon || !token) return null;
  const sb = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user?.id) return null;
  return data.user.id;
}

function mapTokenError(reason: "config" | "auth"): PaypalResult {
  return reason === "config" ? configMissing() : authFailed();
}

export async function handlePaypalCreateOrder(token: string, planId: string): Promise<PaypalResult> {
  if (!paypalCredentialsReady()) return configMissing();

  const userId = await userFromToken(token);
  if (!userId) return { status: 401, body: { error: itha.errori.sessione, code: "session" } };
  if (!isPlanId(planId)) return { status: 400, body: { error: itha.paypalManca, code: "plan" } };

  const plan = ITHA_PLAN_CREDITS[planId];
  const access = await paypalToken();
  if (!access.ok) return mapTokenError(access.reason);

  try {
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: { currency_code: "EUR", value: plan.amount },
            description: `Itha ${planId} · ${plan.credits} crediti`,
            custom_id: `${userId}:${planId}`,
          },
        ],
      }),
    });
    const json = (await response.json().catch(() => null)) as { id?: string } | null;
    if (!response.ok || !json?.id) return orderFailed();

    const url = supabaseUrl();
    const service = supabaseServiceKey();
    if (!url || !service) {
      return { status: 503, body: { error: itha.paypalManca, code: "supabase-config" } };
    }
    const admin = createClient(url, service, { auth: { persistSession: false } });
    const { error: insertError } = await admin.from("itha_orders").insert({
      user_id: userId,
      plan_id: planId,
      credits: plan.credits,
      amount: plan.amount,
      paypal_order_id: json.id,
      status: "created",
    });
    if (insertError) {
      return { status: 500, body: { error: itha.paypalOrdine, code: "order-persist" } };
    }
    return { status: 200, body: { id: json.id } };
  } catch {
    return orderFailed();
  }
}

export async function handlePaypalCaptureOrder(token: string, orderId: string): Promise<PaypalResult> {
  if (!paypalCredentialsReady()) return configMissing();
  if (!orderId.trim()) return { status: 400, body: { error: itha.paypalOrdine, code: "order-id" } };

  const userId = await userFromToken(token);
  if (!userId) return { status: 401, body: { error: itha.errori.sessione, code: "session" } };

  const access = await paypalToken();
  if (!access.ok) return mapTokenError(access.reason);

  try {
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access.token}`,
        "Content-Type": "application/json",
      },
    });
    const json = (await response.json().catch(() => null)) as {
      status?: string;
      purchase_units?: Array<{ custom_id?: string; amount?: { value?: string } }>;
    } | null;
    if (!response.ok || json?.status !== "COMPLETED") return orderFailed();

    const custom = json.purchase_units?.[0]?.custom_id ?? "";
    const [owner, planId] = custom.split(":");
    if (owner !== userId || !isPlanId(planId)) {
      return { status: 400, body: { error: itha.paypalOrdine, code: "order-mismatch" } };
    }
    const settled = await completeIthaOrderIfPending(orderId);
    if (!settled.ok) {
      if (settled.code === "supabase-config") {
        return { status: 503, body: { error: itha.paypalManca, code: settled.code } };
      }
      return { status: 500, body: { error: itha.paypalOrdine, code: settled.code } };
    }
    if (settled.userId !== userId) {
      return { status: 400, body: { error: itha.paypalOrdine, code: "order-mismatch" } };
    }
    return {
      status: 200,
      body: {
        credits: settled.balance,
        planId,
        credited: settled.credited,
      },
    };
  } catch {
    return orderFailed();
  }
}
