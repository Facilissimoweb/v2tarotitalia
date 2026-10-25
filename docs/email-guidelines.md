# Tarot Italia — Email Guidelines

**Master blueprint** for all transactional and marketing emails from Tarot Italia (`tarotitalia.com`).  
Align every template with this document before shipping. Site copy and identity remain governed by `src/data/siteContent.ts` and `.cursor/rules/site-content.mdc`; this file covers **email-only** structure, voice, and HTML constraints.

**Production welcome template:** [`docs/email-welcome.html`](email-welcome.html) (Zoho Mail–ready).  
**Automated delivery (Edge Function + webhook):** [`docs/README-email-automation.md`](README-email-automation.md).

---

## 1. Brand Identity & Voice

| Rule | Specification |
|------|----------------|
| **Sender identity** | Maria Teresa Rogani · Tarot Italia (independent professional) |
| **Perspective** | Strictly singular feminine: **«io»**. Never «noi», «nostro», «il team», «lo Studio» as a plural collective. |
| **Tone** | Elegant, authoritative, deeply human. Clear, reassuring, uncompromisingly ethical. |
| **Avoid** | Esoteric fluff, aggressive sales language, false urgency, predictions, medical/legal claims, invented methods or titles. |
| **Confidenziale** | In intimate messages, «Teresa» is acceptable; formal/legal contexts use **Maria Teresa Rogani**. |
| **Official subtitle** | di Maria Teresa Rogani, operatore olistico |

**Do / Don’t (microcopy)**

```
✅ Ti do il benvenuto. Sono Teresa…
✅ Ti conferma la prenotazione…
✅ Scrivimi a info@tarotitalia.com se hai bisogno di chiarimenti.

❌ Benvenuti nel nostro spazio…
❌ Il nostro team ti contatterà…
❌ Energia cosmica che vibra con te…
```

---

## 2. Visual & Design System (HTML Email)

Prefer **tables + inline styles**. Radius **0px** (Lumiere).

### Palette

| Token | Hex | Use |
|-------|-----|-----|
| Ivory (background) | `#F9F8F6` | Body / outer wrapper |
| Ink (text / headers) | `#2B2523` | Titles, body copy |
| Sage (accent) | `#7A8B78` | Borders, dividers, secondary links |
| Soft container | `#F1F0EC` | Nested boxes, CTA wells, tutela block |

### Typography (email-safe)

| Role | Stack |
|------|--------|
| Headers & sign-offs | `Georgia, 'Times New Roman', Times, serif` |
| Body | `Arial, Helvetica, sans-serif` |

### Layout

- **Max width:** `560px`, centered.
- Nested `<table role="presentation">`.
- Inline CSS; optional `@media` only for fluid width.
- Images: absolute HTTPS URLs; `display:block` on logos.
- Buttons: solid ink or sage, ivory text, generous padding, 0 radius.

---

## 3. Standard Elements (Required in Every Email)

### 3.1 Header

1. Centered logo → `https://www.tarotitalia.com/logo.png`, **width 130px**, linked to Home.
2. Subtitle under the logo: **di Maria Teresa Rogani, operatore olistico**  
   (Optional wordmark **Tarot Italia** between logo and subtitle.)

### 3.2 Body

- One clear purpose per email.
- Soft containers (`#F1F0EC`) for CTA groups when needed.
- **Welcome / onboarding:** include a clear CTA block with at least:
  - **Percorsi** → `https://www.tarotitalia.com/percorsi` (primary emphasis)
  - **Area Riservata** → `https://www.tarotitalia.com/riservata` (or login flow URL used in production)
  - **Consulti** → `https://www.tarotitalia.com/consulti`
- Sign-off (Georgia): *Con cura,* then **Teresa** / **Maria Teresa Rogani · Tarot Italia**.

### 3.3 Footer (advanced — stack in this order)

Replicate the website footer inside the email. Blocks **stacked cleanly**, top → bottom:

#### A. Transparency / brand protection

- **Heading:** Trasparenza e tutela del marchio  
- **Text (exact):**  
  `tarotitalia.com è l’unico canale ufficiale autorizzato. Non sollecito mai consulti o servizi tramite chat private o social non richiesti.`  
- Present inside a soft container (`#F1F0EC`) with optional 1px sage border.

#### B. Secondary legal links

| Label | URL |
|-------|-----|
| Informativa sulla privacy | `https://www.tarotitalia.com/privacy` |
| Disclaimer Legale (Deontologia & Legge) | `https://www.tarotitalia.com/disclaimer` |
| Termini e Condizioni | `https://www.tarotitalia.com/termini` |

> **Route note:** `/disclaimer` is a public page; `/termini` redirects permanently to `/termini-di-servizio`. Never use `/chi-siamo`.

#### C. Interactive contact buttons

| Action | Label | Href |
|--------|-------|------|
| WhatsApp | WhatsApp | `https://wa.me/393791038253` |
| Phone | Chiama | `tel:+393791038253` |

(Numbers from brand: `+39 379 103 82 53`.)

#### D. Secondary logo (above nav)

- `https://www.tarotitalia.com/logo.png`, **width 90px**, centered.

#### E. Navigation menu

| Label | URL |
|-------|-----|
| Home | `https://www.tarotitalia.com` |
| Chi sono | `https://www.tarotitalia.com/chi-sono` |
| Consulti | `https://www.tarotitalia.com/consulti` |
| Percorsi | `https://www.tarotitalia.com/percorsi` |
| Blog | `https://www.tarotitalia.com/blog` |
| Contatti | `https://www.tarotitalia.com/contatti` |

#### F. Studio & fiscal data

1. `Maria Teresa Rogani · Tarot Italia · Macerata · Via Crispi 37 · P.IVA 02136780430`
2. Support: [`info@tarotitalia.com`](mailto:info@tarotitalia.com) — *ti rispondo personalmente*
3. Motto (Georgia italic, sage): **Ad Astra per Aspera**

---

## 4. Contact constants

```
WhatsApp: https://wa.me/393791038253
Phone:    tel:+393791038253
Support:  info@tarotitalia.com
Logo:     https://www.tarotitalia.com/logo.png
```

---

## 5. Future Email Types

Each type reuses header + advanced footer. Subject lines: clear, no clickbait.

### 5.1 Area Riservata — access & password recovery

| Email | Purpose |
|-------|---------|
| Welcome / account created | Confirm registration; CTA Percorsi + Riservata + Consulti |
| Magic link / login | One-time access; calm expiry copy |
| Password recovery | Reset link; no alarmism |

### 5.2 Corsi / Percorsi — enrollment & milestones

| Email | Purpose |
|-------|---------|
| Enrollment confirmation | Path name + next step (titles only from site content) |
| Milestone / materials | Soft container for links |
| Pause / completion | Dignified closure; Contatti optional |

### 5.3 Consulti — booking & follow-ups

| Email | Purpose |
|-------|---------|
| Booking confirmation | Date/time, channel; Via Crispi 37 if in person |
| Reminder | Gentle, 24–48h before |
| Follow-up | Thank-you; Percorsi/Contatti without pressure |

---

## 6. Compliance Checklist

- [ ] Singular «io» throughout
- [ ] Header logo 130px + subtitle
- [ ] Welcome body includes Percorsi + Riservata + Consulti CTAs
- [ ] Footer order: tutela → legal → WhatsApp/Chiama → logo 90px → nav → fiscal → support → motto
- [ ] Nav uses `/chi-sono` (never `/chi-siamo`)
- [ ] Fiscal line exact
- [ ] Max width 560px; palette ivory / ink / sage / `#F1F0EC`
- [ ] No PayPal/credits pitches; no unauthorized methods; no medical claims
- [ ] Marketing: unsubscribe where legally required

---

## 7. Ownership

| Concern | Source of truth |
|---------|-----------------|
| Website copy, formation, deontologia, tutela text | `src/data/siteContent.ts` |
| Email layout, voice, footer stack | **This file** + `docs/email-welcome.html` |
| Brand / Lumiere site rules | `.cursor/rules/site-content.mdc` |

Update this document when fiscal data, phone numbers, nav URLs, or palette tokens change.
