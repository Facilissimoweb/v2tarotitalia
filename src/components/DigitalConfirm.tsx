import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { emptyConsents, hasRequiredConsents, type Consents } from "../lib/storage";
import {
  clearDigitalDraft,
  discardSettledDigitalDraft,
  readDigitalDraft,
  writeDigitalDraft,
} from "../lib/digitalOrders";
import { startDigitalCheckout } from "../lib/stripeCheckout";
import { Button, Kicker } from "./Button";
import { ConsentFields } from "./ConsentFields";
import { LegalNotice, type LegalKind } from "./LegalNotice";

const { auth, consulti, pages } = siteContent;
const copy = pages.corsi;

export function DigitalConfirm() {
  const { session, digitalOrders, ownsDigital } = useAuth();
  const [searchParams] = useSearchParams();
  const checkout = searchParams.get("checkout");
  const paidReturn = checkout === "ok" || checkout === "cancel";
  if (paidReturn) discardSettledDigitalDraft();
  discardSettledDigitalDraft(digitalOrders);
  const draft = paidReturn ? null : readDigitalDraft();
  const [name, setName] = useState(() => draft?.name || session?.name || "");
  const [phone, setPhone] = useState(() => draft?.phone || "");
  const [consents, setConsents] = useState<Consents>(
    () => (session?.consents && hasRequiredConsents(session.consents) ? session.consents : draft?.consents ?? emptyConsents()),
  );
  const [notice, setNotice] = useState<LegalKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!draft) return null;
  if (ownsDigital(draft.productId)) {
    clearDigitalDraft();
    return (
      <p className="mb-10 bg-mist p-5 text-sm leading-relaxed text-ink">
        {copy.giaTuo}
      </p>
    );
  }

  async function confirm() {
    if (!draft) return;
    if (!name.trim() || !phone.trim()) {
      setError(consulti.recapito);
      return;
    }
    if (!hasRequiredConsents(consents)) {
      setError(auth.errori.consensi);
      return;
    }
    setBusy(true);
    setError(null);
    const payload = { ...draft, name: name.trim(), phone: phone.trim(), consents };
    writeDigitalDraft(payload);
    const result = await startDigitalCheckout(payload, consents);
    setBusy(false);
    if (result.error === "giaTuo") {
      setError(copy.giaTuo);
      return;
    }
    if (result.error === "pagamentoManca") {
      setError(consulti.pagamentoManca);
      return;
    }
    if (result.error) {
      setError(consulti.pagamentoManca);
      return;
    }
    if (result.url) window.location.assign(result.url);
  }

  return (
    <section className="mb-10 bg-paper p-8 md:p-10">
      <Kicker>{copy.conferma}</Kicker>
      <h2 className="mt-3 font-display text-xl">{draft.title}</h2>
      <p className="mt-2 text-sm leading-[1.9] text-ink/70">{copy.avviso}</p>

      <div className="mt-8 border-t border-ink/10 pt-6">
        <Row k={copy.prodotto} v={draft.title} />
        <Row k={copy.formatoLabel} v={draft.format} />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{copy.totale}</span>
          <span className="font-display text-xl">€{draft.price}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Field label={copy.nome} value={name} onChange={setName} />
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
        {copy.paga}
      </Button>
      <LegalNotice kind={notice} onClose={() => setNotice(null)} />
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-xs">
      <span className="uppercase tracking-[0.16em] text-ember-soft">{k}</span>
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
      <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{label}</span>
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
