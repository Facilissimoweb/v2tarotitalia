# Welcome Email Automation — Tarot Italia

Sends the branded welcome message automatically when a new account is created.  
Frontend remains a Vite SPA. Delivery path:

**`auth.users` insert → `handle_new_user` → `public.profiles` insert → PL/pgSQL + `pg_net` → Edge Function → Zoho SMTP**

No Dashboard Database Webhook is required: the HTTP call is defined in a SQL migration.

| Piece | Path / value |
|-------|----------------|
| Edge Function | `supabase/functions/send-welcome-email/` |
| SQL trigger migration | `supabase/migrations/20261025_create_welcome_email_webhook.sql` |
| HTML body | `supabase/functions/send-welcome-email/welcome.html` (= `docs/email-welcome.html`) |
| Subject | `Benvenuta, benvenuto in Tarot Italia: il tuo spazio è pronto` |
| From | `info@tarotitalia.com` |
| Webhook secret (shared) | `tarot_italia_segreto_2026` |
| Guidelines | [`docs/email-guidelines.md`](email-guidelines.md) |

---

## Terminal checklist (production)

Run these **in order** from the project root.

### A) Link the project (skip if already linked)

```bash
supabase login
supabase link --project-ref zaaunvkyhxezhvjmmafx
```

*(Reference ID = Dashboard → Project Settings → General.)*

### B) Set Edge Function secrets

`WELCOME_EMAIL_WEBHOOK_SECRET` **must** match the Bearer token in the SQL migration.

**PowerShell:**

```powershell
supabase secrets set `
  ZOHO_EMAIL=info@tarotitalia.com `
  ZOHO_PASSWORD="YOUR_ZOHO_APP_PASSWORD" `
  WELCOME_EMAIL_WEBHOOK_SECRET="tarot_italia_segreto_2026"
```

**macOS / Linux:**

```bash
supabase secrets set \
  ZOHO_EMAIL=info@tarotitalia.com \
  ZOHO_PASSWORD='YOUR_ZOHO_APP_PASSWORD' \
  WELCOME_EMAIL_WEBHOOK_SECRET='tarot_italia_segreto_2026'
```

Optional SMTP region (defaults: EU host + SSL 465):

```bash
supabase secrets set ZOHO_SMTP_HOST=smtp.zoho.eu ZOHO_SMTP_PORT=465
```

Use a Zoho **App Password**, not the mailbox login password.  
Verify names only: `supabase secrets list`

### C) Deploy the Edge Function

```bash
supabase functions deploy send-welcome-email --no-verify-jwt
```

`--no-verify-jwt` is required: the trigger authenticates with `WELCOME_EMAIL_WEBHOOK_SECRET`, not a user JWT.

### D) Push the SQL webhook migration

```bash
supabase db push
```

This applies `20261025_create_welcome_email_webhook.sql` on the remote DB:

- enables `pg_net`
- creates `public.notify_welcome_email()`
- binds `AFTER INSERT` trigger `on_profile_created_welcome_email` on `public.profiles`

---

## How it works

1. Signup (password, Magic Link, or Google) creates a row in `auth.users`.
2. Existing trigger `on_auth_user_created` → `public.handle_new_user()` inserts into `public.profiles` (see `supabase/schema.sql`).
3. New trigger `on_profile_created_welcome_email` calls `net.http_post` asynchronously to:

   `https://zaaunvkyhxezhvjmmafx.supabase.co/functions/v1/send-welcome-email`

4. Headers include `Authorization: Bearer tarot_italia_segreto_2026`.
5. Body mirrors a Database Webhook shape (`type`, `table`, `schema`, `record` with `email`).
6. The Edge Function sends the Lumiere HTML via Zoho Mail SMTP.

Failures in the trigger are logged as warnings and **never block** registration.

---

## Manual smoke test

```bash
curl -i -X POST "https://zaaunvkyhxezhvjmmafx.supabase.co/functions/v1/send-welcome-email" ^
  -H "Authorization: Bearer tarot_italia_segreto_2026" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"your-test@example.com\"}"
```

Expect `200` and `{ "ok": true }`. Check inbox (and spam).

End-to-end: create a test account → confirm a new `profiles` row → Edge Function logs → email arrives.

Inspect queued HTTP (optional, SQL Editor):

```sql
select id, status_code, content::text
from net._http_response
order by created desc
limit 20;
```

---

## Do **not** also create a Dashboard webhook

Avoid duplicate welcome emails. Use **only** this SQL trigger (or only a Dashboard hook — never both).

---

## Security checklist

- [ ] `ZOHO_PASSWORD` is a Zoho App Password (Edge Secrets only)
- [ ] `WELCOME_EMAIL_WEBHOOK_SECRET=tarot_italia_segreto_2026` matches the migration Bearer token
- [ ] Function deployed with `--no-verify-jwt`
- [ ] Migration applied with `supabase db push`
- [ ] No Dashboard webhook on the same insert path
- [ ] Template stays singular «io» / Teresa

> Rotate the shared secret later by updating **both** the Edge secret and the constant inside `notify_welcome_email()`, then `supabase db push` / re-apply the function definition.

---

## Updating the HTML template

1. Edit `docs/email-welcome.html`.
2. Copy into the function folder:
   ```powershell
   Copy-Item docs/email-welcome.html supabase/functions/send-welcome-email/welcome.html -Force
   ```
3. Redeploy:
   ```bash
   supabase functions deploy send-welcome-email --no-verify-jwt
   ```

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `401 Unauthorized` | Edge secret ≠ migration Bearer (`tarot_italia_segreto_2026`) |
| `503 Email service not configured` | Missing `ZOHO_EMAIL` / `ZOHO_PASSWORD` secrets |
| `500 Failed to send welcome email` | Wrong Zoho host/region or app password — check function logs |
| No email on signup | `handle_new_user` missing, or migration not pushed (`db push`) |
| Duplicate emails | Dashboard webhook **and** SQL trigger both active |
| `pg_net` / `net.http_post` errors | Extension not enabled; re-run migration or enable `pg_net` in Dashboard → Database → Extensions |

---

## Ownership

| Concern | Location |
|---------|----------|
| SMTP Edge Function | `supabase/functions/send-welcome-email/` |
| DB trigger / pg_net | `supabase/migrations/20261025_create_welcome_email_webhook.sql` |
| HTML / voice | `docs/email-welcome.html`, `docs/email-guidelines.md` |
| Site copy | `src/data/siteContent.ts` |
