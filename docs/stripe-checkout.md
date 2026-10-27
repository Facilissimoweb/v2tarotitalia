# Prenotazione + Stripe Checkout — Tarot Italia

Flusso: slot → `pending_payment` (indice unico) → redirect Checkout → webhook `confirmed` + mail + Calendar + WhatsApp.

**Regola serale:** dalle 19:00 (Europe/Rome) la modalità è sempre `remote`. `create-checkout` e la conferma pagamento riallineano il campo `mode` anche se il client invia «in studio».

## Secrets (Supabase Edge Functions)

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://www.tarotitalia.com
SUPABASE_SERVICE_ROLE_KEY=...
ZOHO_EMAIL=...
ZOHO_PASSWORD=...
GOOGLE_CALENDAR_ID=mariateresarogani@gmail.com
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_CALENDAR_REFRESH_TOKEN=...
GOOGLE_OAUTH_REFRESH_TOKEN=...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_TO=393791038253
```

Non usare prefisso `VITE_`: le chiavi restano solo lato server.

Google Calendar: evento `opaque` (occupato) sul calendario di `mariateresarogani@gmail.com`. Preferire OAuth con refresh token sul Gmail personale; il service account funziona solo se quel calendario è condiviso con l’account di servizio.

WhatsApp: messaggio immediato al recapito di Teresa via Cloud API. Senza finestra 24h serve un template approvato (`WHATSAPP_TEMPLATE`).

## Email di conferma (cliente)

Template HTML: `docs/email-booking-confirm.html`  
Popolamento: `supabase/functions/stripe-webhook/bookingConfirmHtml.ts`  
Invio: `stripe-webhook` su `checkout.session.completed` (e `sync-checkout` solo se è lui a confermare il pagamento), via Zoho SMTP (`smtp.zoho.eu:465`, da `info@tarotitalia.com`). Contestualmente: evento Google Calendar e notifica WhatsApp a Teresa.

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
supabase functions deploy sync-checkout
supabase functions deploy request-refund
```

## Webhook Dashboard Stripe (test)

Endpoint: `https://zaaunvkyhxezhvjmmafx.supabase.co/functions/v1/stripe-webhook`

Eventi: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`

`verify_jwt` della function è `false`: autentica Stripe con `STRIPE_WEBHOOK_SECRET`.
