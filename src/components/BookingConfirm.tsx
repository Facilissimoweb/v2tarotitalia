import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { STUDIO } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import {
  discardSettledBookingDraft,
  draftMatchesSettled,
  emptyConsents,
  hasRequiredConsents,
  readBookingDraft,
  slotsForDate,
  writeBookingDraft,
  type Consents,
} from "../lib/storage";
import { isEveningSlot, resolveBookingMode, sessionModeLabel } from "../lib/bookingRules";
import { startStripeCheckout } from "../lib/stripeCheckout";
import { formatBookingDay } from "../lib/whatsapp";
import { Button, Kicker } from "./Button";
import { ConsentFields } from "./ConsentFields";
import { LegalNotice, type LegalKind } from "./LegalNotice";

const { auth, consulti } = siteContent;

/** Riepilogo e conferma finale della prenotazione, nell’Area riservata. */
export function BookingConfirm() {
  const { session, purchases } = useAuth();
  const [searchParams] = useSearchParams();
  const checkout = searchParams.get("checkout");
  const paidReturn = checkout === "ok" || checkout === "cancel";
  if (paidReturn) discardSettledBookingDraft();
  if (draftMatchesSettled(purchases)) discardSettledBookingDraft(purchases);
  const draft = paidReturn || draftMatchesSettled(purchases) ? null : readBookingDraft();
  const [name, setName] = useState(() => draft?.name || session?.name || "");
  const [phone, setPhone] = useState(() => draft?.phone || "");
  const [consents, setConsents] = useState<Consents>(
    () => (session?.consents && hasRequiredConsents(session.consents) ? session.consents : draft?.consents ?? emptyConsents()),
  );
  const [notice, setNotice] = useState<LegalKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!draft) return null;

  const option = consulti.opzioni.find((o) => o.id === draft.type);
  const dayLabel = formatBookingDay(draft.dateIso);

  async function confirm() {
    if (!draft) return;
    if (!name.trim() || !phone.trim()) {
      setError(consulti.recapito);
      return;
    }
    if (!slotsForDate(draft.dateIso).includes(draft.slot)) {
      setError(consulti.orarioNonDisponibile);
      return;
    }
    if (!hasRequiredConsents(consents)) {
      setError(auth.errori.consensi);
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      ...draft,
      mode: resolveBookingMode(draft.mode, draft.slot),
      name: name.trim(),
      phone: phone.trim(),
    };
    writeBookingDraft({ ...payload, consents });
    const result = await startStripeCheckout(payload, consents);
    setBusy(false);
    if (result.error === "slotOccupato") {
      setError(consulti.slotOccupato);
      return;
    }
    if (result.error === "pagamentoManca") {
      setError(consulti.pagamentoManca);
      return;
    }
    if (result.error || !result.url) {
      setError(result.detail || auth.errori.servizio);
      return;
    }
    window.location.assign(result.url);
  }

  return (
    <section className="mb-16 bg-paper p-8 md:p-10">
      <Kicker>{auth.sogliaTitolo}</Kicker>
      <h2 className="mt-4 font-display text-2xl font-light leading-snug text-ink">{consulti.conferma}</h2>
      <p className="mt-4 text-sm leading-[1.9] text-ink/70">{consulti.avvisoConferma}</p>

      <div className="mt-8 bg-mist p-6">
        <Row k="Sessione" v={`${option?.titolo ?? draft.type} (${draft.minutes} min)`} />
        <Row k="Erogazione" v={sessionModeLabel(draft.mode, draft.slot, STUDIO.city)} />
        <Row k="Data & ora" v={`${dayLabel} — ${draft.slot}`} />
        {draft.pdf ? <Row k={consulti.pdf.etichetta} v={`€${draft.pdfPrice || consulti.pdf.prezzo}`} /> : null}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ink">Totale sessione</span>
          <span className="font-display text-xl">€{draft.total}</span>
        </div>
      </div>
      {isEveningSlot(draft.slot) ? (
        <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink/65">{consulti.seraOnline}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-8">
        <Field label="Nome completo *" value={name} onChange={setName} />
        <Field label={consulti.recapito} value={phone} onChange={setPhone} type="tel" />
      </div>

      <div className="mt-8">
        <ConsentFields
          consents={consents}
          onChange={setConsents}
          onPrivacy={() => setNotice("privacy")}
          onVendita={() => setNotice("vendita")}
        />
      </div>

      {error ? <p className="mt-4 text-sm text-ink">{error}</p> : null}
      <Button type="button" className="mt-8 w-full" disabled={busy} onClick={() => void confirm()}>
        {consulti.pagaStripe}
      </Button>
      <LegalNotice kind={notice} onClose={() => setNotice(null)} />
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-xs">
      <span className="uppercase tracking-[0.14em] text-sage">{k}</span>
      <span className="text-right text-ink">{v}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.625rem] uppercase tracking-[0.16em] text-sage">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
      />
    </label>
  );
}
