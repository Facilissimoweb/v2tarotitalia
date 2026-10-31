import nodemailer from "npm:nodemailer@6.9.16";
import { fillDigitalConfirmHtml, fillDigitalConfirmText } from "./digitalConfirmHtml.ts";

const FROM_ADDRESS = "info@tarotitalia.com";
const FROM_NAME = "Maria Teresa Rogani · Tarot Italia";
const STUDIO = "info@tarotitalia.com";

export async function sendDigitalDeliveryMail(
  row: Record<string, unknown>,
  extras: { customerEmail: string | null; transactionId: string; amountCents: number | null },
): Promise<string | null> {
  const zohoUser = Deno.env.get("ZOHO_EMAIL")?.trim();
  const zohoPass = Deno.env.get("ZOHO_PASSWORD");
  if (!zohoUser || !zohoPass) {
    console.error("Missing ZOHO secrets — digital mail skipped");
    return null;
  }

  const host = Deno.env.get("ZOHO_SMTP_HOST")?.trim() || "smtp.zoho.eu";
  const port = Number(Deno.env.get("ZOHO_SMTP_PORT") || "465");
  const site = (Deno.env.get("SITE_URL")?.trim() || "https://www.tarotitalia.com").replace(/\/$/, "");
  const gate = encodeURIComponent(Deno.env.get("SITE_ACCESS")?.trim() || "tarot2026");
  const name = String(row.guest_name ?? "").trim() || "Gentile";
  const title = String(row.title ?? "Titolo");
  const format = String(row.format ?? "");
  const orderId = String(row.id ?? "");
  const productId = String(row.product_id ?? "");
  const sezione = productId === "alchemici" ? "alchemici" : "corsi";
  const euros =
    extras.amountCents != null && extras.amountCents >= 0
      ? extras.amountCents / 100
      : Number(row.price ?? 0);
  const amount = Number.isFinite(euros)
    ? euros.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : String(row.price ?? "");
  const vars = {
    user_name: name,
    user_email: extras.customerEmail ?? "",
    product_title: title,
    product_format: format,
    order_id: orderId,
    transaction_id: extras.transactionId || "—",
    amount,
    riservata_url: `${site}/riservata?sezione=${sezione}&access=${gate}`,
    whatsapp_url: "https://wa.me/393791038253",
    support_email: FROM_ADDRESS,
  };
  const htmlVars = {
    ...vars,
    user_name: escapeHtml(vars.user_name),
    user_email: escapeHtml(vars.user_email),
    product_title: escapeHtml(vars.product_title),
    product_format: escapeHtml(vars.product_format),
    order_id: escapeHtml(vars.order_id),
    transaction_id: escapeHtml(vars.transaction_id),
    amount: escapeHtml(vars.amount),
    riservata_url: escapeHtml(vars.riservata_url),
    whatsapp_url: escapeHtml(vars.whatsapp_url),
    support_email: escapeHtml(vars.support_email),
  };

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: zohoUser, pass: zohoPass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
  });

  let messageId: string | null = null;
  if (extras.customerEmail) {
    const sent = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      replyTo: FROM_ADDRESS,
      to: extras.customerEmail,
      subject: `Pagamento ricevuto — ${title}`,
      text: fillDigitalConfirmText(vars),
      html: fillDigitalConfirmHtml(htmlVars),
    });
    messageId = typeof sent.messageId === "string" ? sent.messageId : null;
  }

  const studioText = [
    `Nuovo acquisto digitale confermato — Tarot Italia`,
    `Nome: ${name}`,
    `Email: ${extras.customerEmail ?? "—"}`,
    `Titolo: ${title}`,
    `Formato: ${format}`,
    `Totale: €${amount}`,
    `Riferimento: ${orderId}`,
    `Transazione: ${extras.transactionId || "—"}`,
  ].join("\n");

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    replyTo: extras.customerEmail || FROM_ADDRESS,
    to: STUDIO,
    subject: `Nuovo acquisto digitale — ${name} · ${title}`,
    text: studioText,
  });

  return messageId;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
