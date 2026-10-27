# Prenotazione + Stripe Checkout — Tarot Italia

Flusso: slot → `pending_payment` (indice unico) → redirect Checkout → webhook `confirmed` + mail.

## Secrets (Supabase Edge Functions)

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://www.tarotitalia.com
SUPABASE_SERVICE_ROLE_KEY=...
ZOHO_EMAIL=...
ZOHO_PASSWORD=...
```

Non usare prefisso `VITE_`: le chiavi restano solo lato server.

## Email di conferma (cliente)

Template HTML: `docs/email-booking-confirm.html`  
Popolamento: `supabase/functions/stripe-webhook/bookingConfirmHtml.ts`  
Invio: `stripe-webhook` su `checkout.session.completed`, via Zoho SMTP (`smtp.zoho.eu:465`, da `info@tarotitalia.com`).

Segnaposto: `{{user_name}}` `{{user_email}}` `{{session_title}}` `{{session_mode}}` `{{booking_date}}` `{{booking_time}}` `{{booking_id}}` `{{transaction_id}}` `{{amount}}` `{{phone}}` `{{riservata_url}}` `{{whatsapp_url}}` `{{support_email}}`

Dopo una modifica al template, allineare il file `.ts` e ridistribuire:

```bash
supabase functions deploy stripe-webhook
```

## Deploy

```bash
supabase db push
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy request-refund
```

## Webhook Dashboard Stripe (test)

Endpoint: `https://zaaunvkyhxezhvjmmafx.supabase.co/functions/v1/stripe-webhook`

Eventi: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`

`verify_jwt` della function è `false`: autentica Stripe con `STRIPE_WEBHOOK_SECRET`.
