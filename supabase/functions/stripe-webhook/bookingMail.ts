import nodemailer from "npm:nodemailer@6.9.16";
import { sessionModeLabel } from "../_shared/bookingRules.ts";
import { fillBookingConfirmHtml, fillBookingConfirmText } from "./bookingConfirmHtml.ts";

const FROM_ADDRESS = "info@tarotitalia.com";
const FROM_NAME = "Maria Teresa Rogani · Tarot Italia";
const STUDIO = "info@tarotitalia.com";

export async function sendBookingMails(
  row: Record<string, unknown>,
  extras: { customerEmail: string | null; transactionId: string; amountCents: number | null },
) {
  const zohoUser = Deno.env.get("ZOHO_EMAIL")?.trim();
  const zohoPass = Deno.env.get("ZOHO_PASSWORD");
  if (!zohoUser || !zohoPass) {
    console.error("Missing ZOHO secrets — booking mail skipped");
    return;
  }

  const host = Deno.env.get("ZOHO_SMTP_HOST")?.trim() || "smtp.zoho.eu";
  const port = Number(Deno.env.get("ZOHO_SMTP_PORT") || "465");
  const site = (Deno.env.get("SITE_URL")?.trim() || "https://www.tarotitalia.com").replace(/\/$/, "");
  const day = String(row.session_date ?? "");
  const slot = String(row.slot ?? "");
  const name = String(row.guest_name ?? "").trim() || "Gentile";
  const phone = String(row.phone ?? "");
  const titleBase = row.consult_type === "deep" ? "Consulto di 1 ora" : "Consulto di 30 minuti";
  const title = row.pdf_report ? `${titleBase} · Report di sintesi in PDF inviato via WhatsApp` : titleBase;
  const mode = sessionModeLabel(String(row.mode ?? "remote"), slot);
  const euros =
    extras.amountCents != null && extras.amountCents >= 0
      ? extras.amountCents / 100
      : Number(row.total_price ?? 0);
  const amount = Number.isFinite(euros)
    ? euros.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : String(row.total_price ?? "");
  const bookingId = String(row.id ?? "");
  const vars = {
    user_name: name,
    user_email: extras.customerEmail ?? "",
    session_title: title,
    session_mode: mode,
    booking_date: formatBookingDate(day),
    booking_time: slot,
    booking_id: bookingId,
    transaction_id: extras.transactionId || "—",
    amount,
    phone,
    riservata_url: `${site}/riservata`,
    whatsapp_url: "https://wa.me/393791038253",
    support_email: FROM_ADDRESS,
  };
  const htmlVars = {
    ...vars,
    user_name: escapeHtml(vars.user_name),
    user_email: escapeHtml(vars.user_email),
    session_title: escapeHtml(vars.session_title),
    session_mode: escapeHtml(vars.session_mode),
    booking_date: escapeHtml(vars.booking_date),
    booking_time: escapeHtml(vars.booking_time),
    booking_id: escapeHtml(vars.booking_id),
    transaction_id: escapeHtml(vars.transaction_id),
    amount: escapeHtml(vars.amount),
    phone: escapeHtml(vars.phone),
    riservata_url: escapeHtml(vars.riservata_url),
    whatsapp_url: escapeHtml(vars.whatsapp_url),
    support_email: escapeHtml(vars.support_email),
  };
  const html = fillBookingConfirmHtml(htmlVars);
  const text = fillBookingConfirmText(vars);
  const studioText = [
    `Nuova prenotazione confermata — Tarot Italia`,
    `Nome: ${name}`,
    `Email: ${extras.customerEmail ?? "—"}`,
    `Recapito: ${phone}`,
    `Sessione: ${title}`,
    `Quando: ${vars.booking_date} · ${slot}`,
    `Modalità: ${mode}`,
    `Totale: €${amount}`,
    `Riferimento: ${bookingId}`,
    `Transazione: ${extras.transactionId || "—"}`,
  ].join("\n");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: zohoUser, pass: zohoPass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  });

  if (extras.customerEmail) {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      replyTo: FROM_ADDRESS,
      to: extras.customerEmail,
      subject: `Pagamento ricevuto — ${vars.booking_date} · ${slot}`,
      text,
      html,
    });
  }

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    replyTo: extras.customerEmail || FROM_ADDRESS,
    to: STUDIO,
    subject: `Nuova prenotazione — ${name} · ${vars.booking_date} ${slot}`,
    text: studioText,
    html: `<div style="font-family:Georgia,serif;color:#2B2523;background:#F9F8F6;padding:28px"><p>${escapeHtml(studioText).replaceAll("\n", "<br>")}</p></div>`,
  });

  await transporter.close();
}

function formatBookingDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre",
  ];
  if (!year || !month || !day || month < 1 || month > 12) return iso;
  return `${day} ${months[month - 1]} ${year}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
