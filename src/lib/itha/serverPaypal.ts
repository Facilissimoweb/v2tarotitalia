import { createClient } from "@supabase/supabase-js";
import { siteContent } from "../../data/siteContent.ts";
import { ITHA_PLAN_CREDITS, type IthaPlanId } from "./types.ts";
import {
  paypalBaseUrl,
  paypalClientId,
  paypalSecret,
  supabaseAnonKey,
  supabaseServiceKey,
  supabaseUrl,
} from "./serverEnv.ts";

const { itha } = siteContent;

function isPlanId(value: string): value is IthaPlanId {
  return value in ITHA_PLAN_CREDITS;
}

async function paypalToken() {
  const id = paypalClientId();
  const secret = paypalSecret();
  if (!id || !secret) throw new Error("paypal-config");
  const auth = btoa(`${id}:${secret}`);
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("paypal-token");
  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("paypal-token");
  return json.access_token;
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

export async function handlePaypalCreateOrder(token: string, planId: string) {
  const userId = await userFromToken(token);
  if (!userId) return { status: 401, body: { error: itha.errori.sessione } };
  if (!isPlanId(planId)) return { status: 400, body: { error: itha.paypalManca } };
  const plan = ITHA_PLAN_CREDITS[planId];
  try {
    const access = await paypalToken();
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
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
    const json = (await response.json()) as { id?: string };
    if (!response.ok || !json.id) return { status: 502, body: { error: itha.paypalManca } };

    const url = supabaseUrl();
    const service = supabaseServiceKey();
    if (url && service) {
      const admin = createClient(url, service, { auth: { persistSession: false } });
      await admin.from("itha_orders").insert({
        user_id: userId,
        plan_id: planId,
        credits: plan.credits,
        amount: plan.amount,
        paypal_order_id: json.id,
        status: "created",
      });
    }
    return { status: 200, body: { id: json.id } };
  } catch {
    return { status: 503, body: { error: itha.paypalManca } };
  }
}

export async function handlePaypalCaptureOrder(token: string, orderId: string) {
  const userId = await userFromToken(token);
  if (!userId || !orderId) return { status: 401, body: { error: itha.errori.sessione } };
  try {
    const access = await paypalToken();
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
    });
    const json = (await response.json()) as {
      status?: string;
      purchase_units?: Array<{ custom_id?: string; amount?: { value?: string } }>;
    };
    if (!response.ok || json.status !== "COMPLETED") {
      return { status: 502, body: { error: itha.paypalManca } };
    }
    const custom = json.purchase_units?.[0]?.custom_id ?? "";
    const [owner, planId] = custom.split(":");
    if (owner !== userId || !isPlanId(planId)) {
      return { status: 400, body: { error: itha.paypalManca } };
    }
    const plan = ITHA_PLAN_CREDITS[planId];
    const url = supabaseUrl();
    const service = supabaseServiceKey();
    if (!url || !service) return { status: 503, body: { error: itha.paypalManca } };
    const admin = createClient(url, service, { auth: { persistSession: false } });
    const { data, error } = await admin.rpc("add_itha_credits", {
      p_user: userId,
      p_credits: plan.credits,
    });
    if (error) return { status: 500, body: { error: itha.paypalManca } };
    await admin
      .from("itha_orders")
      .update({ status: "completed" })
      .eq("paypal_order_id", orderId);
    return { status: 200, body: { credits: data, planId } };
  } catch {
    return { status: 503, body: { error: itha.paypalManca } };
  }
}
