import { siteContent } from "../data/siteContent";

/** Indirizzo ufficiale di contatto pubblico. */
export const OFFICIAL_MAIL = siteContent.brand.email;

export type MailtoFields = {
  subject?: string;
  body?: string;
};

export function mailtoHref(email: string = OFFICIAL_MAIL, fields?: MailtoFields) {
  const address = email.trim().replace(/^mailto:/i, "");
  const parts: string[] = [];
  if (fields?.subject) parts.push(`subject=${encodeURIComponent(fields.subject)}`);
  if (fields?.body) parts.push(`body=${encodeURIComponent(fields.body)}`);
  return parts.length ? `mailto:${address}?${parts.join("&")}` : `mailto:${address}`;
}

/**
 * Apre il client di posta in modo affidabile (evita click assorbiti da overlay/router/translate).
 * Preferisce location.assign (handler di protocollo nativo); fallback sull’anchor programmatico
 * come per WhatsApp (`openWhatsApp`).
 */
export function openMailto(email: string = OFFICIAL_MAIL, fields?: MailtoFields) {
  const href = mailtoHref(email, fields);
  try {
    window.location.assign(href);
    return;
  } catch {
    /* fallback sotto */
  }
  const a = document.createElement("a");
  a.href = href;
  a.setAttribute("rel", "noopener noreferrer");
  document.body.appendChild(a);
  a.click();
  a.remove();
}
