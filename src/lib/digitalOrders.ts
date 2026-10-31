import type { DigitalProductId } from "../data/catalogo";
import { digitalProductById } from "../data/catalogo";
import type { Consents, PurchaseStatus } from "./storage";
import { emptyConsents } from "./storage";

export type DigitalOrder = {
  id: string;
  productId: DigitalProductId;
  title: string;
  format: string;
  price: number;
  name: string;
  phone: string;
  status: PurchaseStatus;
  consents: Consents;
  createdAt: string;
  paidAt?: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  stripeAmountTotal?: number;
};

export type DigitalDraft = {
  productId: DigitalProductId;
  title: string;
  format: string;
  price: number;
  name: string;
  phone: string;
  consents: Consents;
};

export type DigitalOrderRow = {
  id: string;
  user_id: string | null;
  product_id: string;
  title: string;
  format: string;
  price: number | string;
  guest_name: string | null;
  phone: string | null;
  status: string;
  consent_privacy: boolean;
  consent_adult: boolean;
  consent_refund: boolean;
  created_at: string;
  paid_at?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_amount_total?: number | string | null;
};

const DIGITAL_DRAFT_KEY = "tarot-italia-digital-draft";
const DIGITAL_ORDERS_KEY = "tarot-italia-digital-orders";
const CHECKOUT_ORDER_KEY = "tarot-italia-checkout-order";

export function isDigitalProductId(id: string): id is DigitalProductId {
  return id === "trattato" || id === "velo" || id === "taccuino" || id === "alchemici";
}

export function draftFromProduct(productId: DigitalProductId, name = "", phone = ""): DigitalDraft | null {
  const product = digitalProductById(productId);
  if (!product) return null;
  return {
    productId: product.id,
    title: product.title,
    format: product.format,
    price: product.price,
    name,
    phone,
    consents: emptyConsents(),
  };
}

export function readDigitalDraft(): DigitalDraft | null {
  try {
    const raw = sessionStorage.getItem(DIGITAL_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DigitalDraft;
    if (!parsed || !isDigitalProductId(parsed.productId)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDigitalDraft(draft: DigitalDraft) {
  sessionStorage.setItem(DIGITAL_DRAFT_KEY, JSON.stringify(draft));
}

export function clearDigitalDraft() {
  sessionStorage.removeItem(DIGITAL_DRAFT_KEY);
}

export function rememberDigitalCheckout(orderId: string) {
  sessionStorage.setItem(CHECKOUT_ORDER_KEY, orderId);
}

export function takeDigitalCheckoutId() {
  const id = sessionStorage.getItem(CHECKOUT_ORDER_KEY);
  sessionStorage.removeItem(CHECKOUT_ORDER_KEY);
  return id;
}

export function isPaidDigital(order: DigitalOrder) {
  return order.status === "confirmed" || order.status === "completed";
}

export function isCartDigital(order: DigitalOrder) {
  return order.status === "pending_payment" || order.status === "pending";
}

export function ownedProductIds(orders: DigitalOrder[]) {
  return new Set(orders.filter(isPaidDigital).map((order) => order.productId));
}

export function sameDigitalSnapshot(a: DigitalOrder[], b: DigitalOrder[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      item.id === other.id &&
      item.status === other.status &&
      item.paidAt === other.paidAt &&
      item.stripePaymentIntentId === other.stripePaymentIntentId
    );
  });
}

export function rowToDigitalOrder(row: DigitalOrderRow): DigitalOrder | null {
  if (!isDigitalProductId(row.product_id)) return null;
  const productId = row.product_id;
  const product = digitalProductById(productId);
  return {
    id: row.id,
    productId,
    title: row.title || product?.title || productId,
    format: row.format || product?.format || "PDF",
    price: Number(row.price),
    name: row.guest_name ?? "",
    phone: row.phone ?? "",
    status: (row.status as PurchaseStatus) || "pending_payment",
    createdAt: row.created_at,
    paidAt: row.paid_at || undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id || undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id || undefined,
    stripeAmountTotal: row.stripe_amount_total != null ? Number(row.stripe_amount_total) : undefined,
    consents: {
      privacy: row.consent_privacy,
      adult: row.consent_adult,
      refund: row.consent_refund,
    },
  };
}

export function readLocalDigitalOrders(): DigitalOrder[] {
  try {
    const raw = localStorage.getItem(DIGITAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DigitalOrder[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((order) => Boolean(order && isDigitalProductId(order.productId)));
  } catch {
    return [];
  }
}

export function writeLocalDigitalOrders(orders: DigitalOrder[]) {
  localStorage.setItem(DIGITAL_ORDERS_KEY, JSON.stringify(orders));
}

export function discardSettledDigitalDraft(orders: DigitalOrder[] = []) {
  if (typeof window !== "undefined") {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "ok" || checkout === "cancel") {
      clearDigitalDraft();
      return;
    }
  }
  const draft = readDigitalDraft();
  if (!draft) return;
  if (orders.some((order) => order.productId === draft.productId && isPaidDigital(order))) {
    clearDigitalDraft();
  }
}
