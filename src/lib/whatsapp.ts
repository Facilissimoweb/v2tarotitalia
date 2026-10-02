import { siteContent } from "../data/siteContent";
import { STUDIO } from "../data/catalogo";
import type { PurchaseDraft } from "./storage";

export function getWhatsAppNumber() {
  return (import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}

export function formatBookingDay(dateIso: string) {
  if (!dateIso) return "";
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateIso}T12:00:00`));
}

export function buildWhatsAppMessage(draft: PurchaseDraft, optionTitle: string) {
  const { consulti } = siteContent;
  const lines = [
    `Prenotazione consulto — ${siteContent.brand.wordmark}`,
    `Nome: ${draft.name}`,
    `Recapito: ${draft.phone}`,
    `Consulto: ${optionTitle} (${draft.minutes} min) — €${draft.consultPrice}`,
    `Data: ${formatBookingDay(draft.dateIso)}`,
    `Orario: ${draft.slot}`,
    `Modalità: ${draft.mode === "remote" ? "Chiamata vocale WhatsApp" : `In studio a ${STUDIO.city}`}`,
    `Totale: €${draft.total}`,
  ];
  if (draft.pdf) lines.push(`${consulti.pdf.etichetta} (+€${consulti.pdf.prezzo})`);
  if (draft.query) lines.push(`Quesito: ${draft.query}`);
  lines.push("");
  lines.push(consulti.avvisoConferma);
  return lines.join("\n");
}

export function buildRitualisticaMessage(input: {
  name: string;
  phone: string;
  tipo?: string;
  note?: string;
}) {
  const { brand, consulti, ritualistica } = siteContent;
  const lines = [
    `Richiesta ritualistica — ${brand.wordmark}`,
    `Intermediaria: ${brand.titolare} (Teresa)`,
    "Percorso curato da: Maura",
    `Nome: ${input.name}`,
    `Recapito: ${input.phone}`,
  ];
  if (input.tipo) lines.push(`${ritualistica.tipologia}: ${input.tipo}`);
  if (input.note) lines.push(`Nota: ${input.note}`);
  lines.push("");
  lines.push(consulti.avvisoConferma);
  return lines.join("\n");
}

export function whatsappHref(text: string) {
  const phone = getWhatsAppNumber();
  const encoded = encodeURIComponent(text);
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

export function isWhatsAppHref(href: string) {
  return /(?:^https?:\/\/)?(?:api\.)?whatsapp\.com\b|(?:^https?:\/\/)?wa\.me\b/i.test(href);
}

export const WHATSAPP_ANCHOR = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function openWhatsApp(text: string) {
  const a = document.createElement("a");
  a.href = whatsappHref(text);
  a.target = WHATSAPP_ANCHOR.target;
  a.rel = WHATSAPP_ANCHOR.rel;
  a.referrerPolicy = "no-referrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
