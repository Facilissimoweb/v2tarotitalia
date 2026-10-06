import { useEffect, useRef, useState, type FormEvent } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { useRitualistica } from "../context/RitualisticaContext";
import { emptyConsents, hasRequiredConsents, type Consents } from "../lib/storage";
import { buildRitualisticaMessage, whatsappHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";
import { AuthForm } from "./AuthForm";
import { Button } from "./Button";
import { ConsentFields } from "./ConsentFields";
import { LegalNotice, type LegalKind } from "./LegalNotice";
import { WidgetDialog } from "./WidgetDialog";

const { brand, legal, ritualistica, consulti, auth, nav } = siteContent;

type Pane = "richiesta" | "accesso";

export function RitualisticaModal() {
  const { session } = useAuth();
  const { open, tipoId, closeRitualistica } = useRitualistica();
  const [pane, setPane] = useState<Pane>("richiesta");
  const [legalKind, setLegalKind] = useState<LegalKind | null>(null);
  const [consents, setConsents] = useState<Consents>(emptyConsents);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const waLink = useRef<HTMLAnchorElement>(null);

  const tipo = ritualistica.tipologie.find((t) => t.id === tipoId);
  const ready = hasRequiredConsents(consents);

  useEffect(() => {
    if (session?.name && !name) setName(session.name);
  }, [session, name]);

  if (!open) return null;

  function resetAndClose() {
    setPane("richiesta");
    setLegalKind(null);
    setConsents(emptyConsents());
    setName("");
    setPhone("");
    setNote("");
    setError(null);
    setSent(false);
    closeRitualistica();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!session) {
      setPane("accesso");
      setError(auth.errori.accesso);
      return;
    }
    if (!ready) {
      setError(auth.errori.consensi);
      return;
    }
    const displayName = name.trim() || session?.name || "";
    const recapito = phone.trim();
    if (!displayName || !recapito) return;
    const message = buildRitualisticaMessage({
      name: displayName,
      phone: recapito,
      tipo: tipo?.titolo,
      note: note.trim() || undefined,
    });
    if (waLink.current) {
      waLink.current.href = whatsappHref(message);
      waLink.current.click();
    }
    setSent(true);
  }

  return (
    <>
      <WidgetDialog title={ritualistica.titoloWidget} onClose={resetAndClose} wide>
        {sent ? (
          <div className="flex flex-col gap-6 text-left">
            <p className="text-sm leading-[1.9] text-ink/75">{consulti.avvisoConferma}</p>
            <p className="text-sm leading-[1.9] text-ink/70">{ritualistica.chiacchierata}</p>
            <Button href={whatsappHref(buildRitualisticaMessage({
              name: name.trim() || session?.name || "",
              phone: phone.trim(),
              tipo: tipo?.titolo,
              note: note.trim() || undefined,
            }))} className="w-full">
              {ritualistica.inviaWhatsapp}
            </Button>
          </div>
        ) : pane === "accesso" ? (
          <div className="flex flex-col gap-8 text-left">
            <p className="text-sm leading-[1.9] text-ink/75">{consulti.accessoObbligatorio}</p>
            <AuthForm
              redirectTo={`${window.location.pathname}${window.location.search}`}
              onPrivacy={() => setLegalKind("privacy")}
              onVendita={() => setLegalKind("vendita")}
              onSuccess={() => setPane("richiesta")}
            />
            <button
              type="button"
              onClick={() => setPane("richiesta")}
              className="text-center text-[10px] uppercase tracking-[0.16em] text-sage hover:text-ink"
            >
              {ritualistica.tornaScelta}
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-8 text-left" onSubmit={onSubmit}>
            <p className="text-sm leading-[1.9] text-ink/75">{ritualistica.mediazione}</p>
            {tipo ? (
              <p className="bg-mist p-5 text-sm leading-relaxed text-ink/75">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-sage">
                  {ritualistica.tipologia}
                </span>
                {tipo.titolo}
              </p>
            ) : null}
            <p className="text-sm leading-[1.9] text-ink/70">{ritualistica.chiacchierata}</p>

            <section className="max-h-56 overflow-y-auto border-y border-ink/10 py-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-sage">{ritualistica.legaleKicker}</p>
              <p className="mt-4 text-xs leading-[1.9] text-ink/70">{brand.deontologia}</p>
              <p className="mt-6 font-display text-sm text-ink">{legal.disclaimer.heading}</p>
              {legal.disclaimer.paragrafi.map((p) => (
                <p key={p.slice(0, 48)} className="mt-4 text-[11px] leading-[1.85] text-ink/65">
                  {p}
                </p>
              ))}
            </section>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setLegalKind("privacy")}
                className="text-left text-[11px] underline decoration-sage/40 underline-offset-4 hover:text-ink"
              >
                {ritualistica.privacyApri}
              </button>
              <button
                type="button"
                onClick={() => setLegalKind("disclaimer")}
                className="text-left text-[11px] underline decoration-sage/40 underline-offset-4 hover:text-ink"
              >
                {ritualistica.disclaimerApri}
              </button>
              <button
                type="button"
                onClick={() => setLegalKind("vendita")}
                className="text-left text-[11px] underline decoration-sage/40 underline-offset-4 hover:text-ink"
              >
                {legal.vendita.leggi}
              </button>
            </div>

            <ConsentFields
              consents={consents}
              onChange={setConsents}
              onPrivacy={() => setLegalKind("privacy")}
              onVendita={() => setLegalKind("vendita")}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-sage">{ritualistica.nome} *</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-sage">{ritualistica.telefono} *</span>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.16em] text-sage">{ritualistica.nota}</span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </label>

            {error ? <p className="text-sm text-ink">{error}</p> : null}

            {session ? (
              <Button type="submit" className="w-full" disabled={!ready}>
                {ritualistica.inviaWhatsapp}
              </Button>
            ) : (
              <Button type="button" className="w-full" onClick={() => setPane("accesso")}>
                {nav.accedi}
              </Button>
            )}
            <a
              ref={waLink}
              href={whatsappHref(
                buildRitualisticaMessage({
                  name: name.trim() || session?.name || "",
                  phone: phone.trim(),
                  tipo: tipo?.titolo,
                  note: note.trim() || undefined,
                }),
              )}
              {...WHATSAPP_ANCHOR}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            >
              {ritualistica.inviaWhatsapp}
            </a>
            <p className="text-center text-[12px] leading-relaxed text-ink/55">{consulti.accessoObbligatorio}</p>
            {!session ? (
              <button
                type="button"
                onClick={() => setPane("accesso")}
                className="text-center text-[10px] uppercase tracking-[0.16em] text-sage hover:text-ink"
              >
                {nav.accedi} · {auth.registrazione}
              </button>
            ) : null}
          </form>
        )}
      </WidgetDialog>
      <LegalNotice kind={legalKind} onClose={() => setLegalKind(null)} />
    </>
  );
}
