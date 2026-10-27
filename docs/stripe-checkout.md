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
