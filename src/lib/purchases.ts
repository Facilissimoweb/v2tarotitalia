import { REPORT_PDF_PRICE } from "../data/catalogo";
import type { Purchase, PurchaseDraft, Consents, PurchaseStatus, BookingMode } from "./storage";
import type { TariffaId } from "../data/catalogo";

export type PurchaseRow = {
  id: string;
  user_id: string | null;
  consult_type: string;
  minutes: number;
  consult_price: number | string;
  pdf_report: boolean;
  pdf_price: number | string;
  total_price: number | string;
  mode: string;
  session_date: string | null;
  slot: string | null;
  guest_name: string | null;
  phone: string | null;
  birth: string | null;
  query: string | null;
  status: string;
  consent_privacy: boolean;
  consent_adult: boolean;
  consent_refund: boolean;
  created_at: string;
};

export function draftToPurchase(draft: PurchaseDraft, consents: Consents): Purchase {
  return {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    consents,
  };
}

export function purchaseToInsert(userId: string | null, purchase: Purchase) {
  return {
    id: purchase.id,
    user_id: userId,
    consult_type: purchase.type,
    minutes: purchase.minutes,
    consult_price: purchase.consultPrice,
    pdf_report: purchase.pdf,
    pdf_price: purchase.pdf ? REPORT_PDF_PRICE : 0,
    total_price: purchase.total,
    mode: purchase.mode,
    session_date: purchase.dateIso || null,
    slot: purchase.slot || null,
    guest_name: purchase.name,
    phone: purchase.phone,
    birth: purchase.birth || null,
    query: purchase.query || null,
    status: purchase.status,
    consent_privacy: purchase.consents.privacy,
    consent_adult: purchase.consents.adult,
    consent_refund: purchase.consents.refund,
  };
}

export function rowToPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    createdAt: row.created_at,
    type: (row.consult_type as TariffaId) || "focus",
    minutes: (Number(row.minutes) as 30 | 60) || 30,
    consultPrice: Number(row.consult_price) as 40 | 60 | 70,
    pdf: row.pdf_report,
    pdfPrice: Number(row.pdf_price) as 0 | 10,
    total: Number(row.total_price),
    mode: (row.mode as BookingMode) || "remote",
    dateIso: row.session_date ?? "",
    slot: row.slot ?? "",
    name: row.guest_name ?? "",
    phone: row.phone ?? "",
    birth: row.birth ?? undefined,
    query: row.query ?? undefined,
    status: (row.status as PurchaseStatus) || "pending",
    consents: {
      privacy: row.consent_privacy,
      adult: row.consent_adult,
      refund: row.consent_refund,
    },
  };
}
