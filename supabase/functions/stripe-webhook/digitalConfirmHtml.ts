export type DigitalConfirmVars = {
  user_name: string;
  user_email: string;
  product_title: string;
  product_format: string;
  order_id: string;
  transaction_id: string;
  amount: string;
  riservata_url: string;
  whatsapp_url: string;
  support_email: string;
};

export function fillDigitalConfirmHtml(vars: DigitalConfirmVars): string {
  return fillTemplate(DIGITAL_CONFIRM_HTML, vars);
}

export function fillDigitalConfirmText(vars: DigitalConfirmVars): string {
  return fillTemplate(DIGITAL_CONFIRM_TEXT, vars);
}

function fillTemplate(template: string, vars: DigitalConfirmVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key as keyof DigitalConfirmVars];
    return value == null ? "" : String(value);
  });
}

const DIGITAL_CONFIRM_TEXT = `Pagamento ricevuto — Tarot Italia

{{user_name}}, sono Teresa. Il pagamento è andato a buon fine. Il titolo è sbloccato sul tuo spazio.

Titolo: {{product_title}}
Formato: {{product_format}}
Importo: €{{amount}}
Riferimento: {{order_id}}
Transazione: {{transaction_id}}

Area riservata: {{riservata_url}}
Recesso e assistenza: {{whatsapp_url}}

A presto,
Teresa
Maria Teresa Rogani · Tarot Italia

{{support_email}} — ti rispondo personalmente
https://www.tarotitalia.com
`;

export const DIGITAL_CONFIRM_HTML = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pagamento ricevuto — Tarot Italia</title>
  <style type="text/css">
    a { color: #C99A7A; }
    @media only screen and (max-width: 620px) {
      .email-shell { width: 100% !important; }
      .email-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .cta-stack { display: block !important; width: 100% !important; }
      .cta-stack a { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F9F8F6;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;">
    Pagamento ricevuto. Il titolo è sbloccato. I file si aprono nell’Area riservata.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F9F8F6;border-collapse:collapse;">
    <tr>
      <td align="center" class="email-pad" style="padding:32px 16px;">
        <table role="presentation" class="email-shell" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:0 0 28px 0;">
              <a href="https://www.tarotitalia.com" style="text-decoration:none;">
                <img src="https://www.tarotitalia.com/logo.png" width="130" alt="Tarot Italia" style="display:block;border:0;width:130px;height:auto;margin:0 auto;" />
              </a>
              <p style="margin:16px 0 0 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:18px;letter-spacing:0.14em;text-transform:uppercase;color:#2B2523;">
                Tarot Italia
              </p>
              <p style="margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#C99A7A;">
                di Maria Teresa Rogani, operatore olistico
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#2B2523;">
              <p style="margin:0 0 18px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:22px;line-height:1.35;color:#2B2523;">
                Pagamento ricevuto
              </p>
              <p style="margin:0 0 16px 0;">
                {{user_name}}, sono Teresa. Il pagamento è andato a buon fine. Il titolo è sbloccato sul tuo spazio.
              </p>
              <p style="margin:0 0 24px 0;">
                Nell’Area riservata trovi il download. Questa email è la conferma di consegna: non contiene allegati.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 28px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F1F0EC;border:1px solid #C99A7A;border-collapse:collapse;">
                <tr>
                  <td style="padding:22px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#2B2523;">
                    <p style="margin:0 0 14px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:15px;color:#2B2523;">
                      Dettagli dell’acquisto
                    </p>
                    <p style="margin:0 0 6px 0;"><span style="color:#C99A7A;">Titolo</span><br />{{product_title}}</p>
                    <p style="margin:0 0 6px 0;"><span style="color:#C99A7A;">Formato</span><br />{{product_format}}</p>
                    <p style="margin:0 0 6px 0;"><span style="color:#C99A7A;">Importo</span><br />€{{amount}}</p>
                    <p style="margin:0 0 6px 0;"><span style="color:#C99A7A;">Riferimento</span><br />{{order_id}}</p>
                    <p style="margin:0;"><span style="color:#C99A7A;">Transazione</span><br />{{transaction_id}}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 28px 0;">
              <table role="presentation" class="cta-stack" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 10px auto;border-collapse:collapse;">
                <tr>
                  <td align="center" bgcolor="#2B2523" style="background-color:#2B2523;">
                    <a href="{{riservata_url}}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;color:#F9F8F6;">
                      Area Riservata
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" class="cta-stack" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto;border-collapse:collapse;">
                <tr>
                  <td align="center" style="border:1px solid #2B2523;">
                    <a href="{{whatsapp_url}}" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;color:#2B2523;">
                      Recesso e assistenza
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 36px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:16px;line-height:1.6;color:#2B2523;">
              <p style="margin:0 0 6px 0;font-style:italic;">A presto,</p>
              <p style="margin:0;color:#2B2523;">Teresa</p>
              <p style="margin:6px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#C99A7A;">Maria Teresa Rogani · Tarot Italia</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.8;">
              <a href="https://www.tarotitalia.com/privacy" style="color:#C99A7A;text-decoration:underline;">Informativa sulla privacy</a>
              <br />
              <a href="https://www.tarotitalia.com/termini-di-servizio" style="color:#C99A7A;text-decoration:underline;">Termini e Condizioni</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;color:#2B2523;">
              Maria Teresa Rogani · Tarot Italia · Macerata · Via Crispi 37 · P.IVA 02136780430
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;">
              <a href="mailto:{{support_email}}" style="color:#2B2523;text-decoration:underline;">{{support_email}}</a>
              <span style="color:#2B2523;"> — ti rispondo personalmente</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
