import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { consultTotal, REPORT_PDF_PRICE, STUDIO, TARIFFE, type TariffaId } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import {
  clearBookingDraft,
  emptyConsents,
  hasRequiredConsents,
  nextBookableDate,
  readBookingDraft,
  slotsForDate,
  writeBookingDraft,
  type BookingMode,
  type Consents,
} from "../lib/storage";
import { buildWhatsAppMessage, formatBookingDay, whatsappHref, WHATSAPP_ANCHOR } from "../lib/whatsapp";
import { AuthForm } from "../components/AuthForm";
import { BookingCalendar } from "../components/BookingCalendar";
import { Button, Kicker } from "../components/Button";
import { ConsentFields } from "../components/ConsentFields";
import { LegalNotice, type LegalKind } from "../components/LegalNotice";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { WidgetFrame } from "../components/WidgetFrame";

const { consulti, auth } = siteContent;

function initialDate() {
  return nextBookableDate();
}

export function Consulti() {
  const { addPurchase, session, ready } = useAuth();
  const navigate = useNavigate();
  const start = initialDate();
  const [type, setType] = useState<TariffaId>("focus");
  const [mode, setMode] = useState<BookingMode>("remote");
  const [dateIso, setDateIso] = useState(start);
  const [slot, setSlot] = useState(() => slotsForDate(start)[0] ?? "09:00");
  const [name, setName] = useState(session?.name ?? "");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [query, setQuery] = useState("");
  const [pdf, setPdf] = useState(false);
  const [consents, setConsents] = useState<Consents>(emptyConsents);
  const [notice, setNotice] = useState<LegalKind | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "magic">("login");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pendingLock = useRef(false);
  const waLink = useRef<HTMLAnchorElement>(null);
  const restored = useRef(false);

  const option = consulti.opzioni.find((o) => o.id === type)!;
  const total = consultTotal(option.prezzo, pdf);
  const dayLabel = formatBookingDay(dateIso);

  useEffect(() => {
    if (restored.current) return;
    const saved = readBookingDraft();
    if (!saved) {
      restored.current = true;
      return;
    }
    restored.current = true;
    setType(saved.type);
    setMode(saved.mode);
    setDateIso(saved.dateIso);
    setSlot(saved.slot);
    setName(saved.name);
    setPhone(saved.phone);
    setBirth(saved.birth ?? "");
    setQuery(saved.query ?? "");
    setPdf(saved.pdf);
    setConsents(saved.consents);
  }, []);

  useEffect(() => {
    if (session?.name && !name) setName(session.name);
    if (session?.consents && hasRequiredConsents(session.consents)) {
      setConsents(session.consents);
    }
  }, [session, name]);

  useEffect(() => {
    if (session) return;
    if (!name.trim() && !phone.trim()) return;
    writeBookingDraft({
      type,
      minutes: option.minuti as 30 | 60,
      consultPrice: option.prezzo as 40 | 60 | 70,
      pdf,
      pdfPrice: (pdf ? REPORT_PDF_PRICE : 0) as 0 | 10,
      total,
      mode,
      dateIso,
      slot,
      name: name.trim(),
      phone: phone.trim(),
      birth: birth || undefined,
      query: query.trim() || undefined,
      consents,
    });
  }, [session, type, option.minuti, option.prezzo, pdf, total, mode, dateIso, slot, name, phone, birth, query, consents]);

  function chooseDate(iso: string) {
    setDateIso(iso);
    const hours = slotsForDate(iso);
    if (hours.length && !hours.includes(slot)) setSlot(hours[0]);
  }

  function draft() {
    return {
      type,
      minutes: option.minuti as 30 | 60,
      consultPrice: option.prezzo as 40 | 60 | 70,
      pdf,
      pdfPrice: (pdf ? REPORT_PDF_PRICE : 0) as 0 | 10,
      total,
      mode,
      dateIso,
      slot,
      name: name.trim(),
      phone: phone.trim(),
      birth: birth || undefined,
      query: query.trim() || undefined,
    };
  }

  function persistDraft() {
    writeBookingDraft({ ...draft(), consents });
  }

  async function confirm() {
    const data = draft();
    if (!data.name || !data.phone || !data.dateIso || !data.slot) return;
    if (!slotsForDate(data.dateIso).includes(data.slot)) {
      setError(consulti.orarioNonDisponibile);
      return;
    }
    if (!session) {
      persistDraft();
      setError(auth.errori.accesso);
      return;
    }
    if (!hasRequiredConsents(consents)) {
      setError(auth.errori.consensi);
      return;
    }
    if (pendingLock.current) return;
    pendingLock.current = true;
    setBusy(true);
    setError(null);
    const err = await addPurchase(data, consents);
    if (err) {
      pendingLock.current = false;
      setBusy(false);
      setError(err);
      return;
    }
    const message = buildWhatsAppMessage(data, option.titolo);
    if (waLink.current) {
      waLink.current.href = whatsappHref(message);
      waLink.current.click();
    }
    clearBookingDraft();
    pendingLock.current = false;
    setBusy(false);
    navigate("/riservata");
  }

  return (
    <div>
      <PageHero
        kicker="Sessioni & booking diretto"
        title={
          <>
            Consulti archetipici &
            <br />
            <span className="italic">divinazione evolutiva</span>
          </>
        }
        lead={`Uno spazio di ascolto intimo e protetto a ${STUDIO.city} o per via auricolare. Tariffe fisse, protocollo WhatsApp vocale, report PDF su richiesta.`}
        cta={{ href: "#prenota", label: siteContent.cta.consultoWhatsapp }}
        media={{
          src: siteContent.chiSiamo.immagini.simboli.src,
          type: "image",
          alt: siteContent.chiSiamo.immagini.simboli.alt,
        }}
      />

      <div
        id="prenota"
        className="mx-auto flex max-w-2xl scroll-mt-28 flex-col gap-20 px-6 pb-24 md:gap-24 md:px-10 md:pb-32"
      >
        <Reveal>
          <section>
            <div className="mb-8 flex justify-between">
              <Kicker>01 · Seleziona il percorso</Kicker>
              <span className="text-[10px] uppercase tracking-[0.16em] text-sage">Tariffa fissa</span>
            </div>
            <div className="grid gap-6">
              {consulti.opzioni.map((opt) => {
                const t = TARIFFE.find((x) => x.id === opt.id)!;
                return (
                  <label
                    key={opt.id}
                    className={`cursor-pointer bg-paper p-8 ${type === opt.id ? "ring-1 ring-ink" : ""}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      className="sr-only"
                      checked={type === opt.id}
                      onChange={() => setType(opt.id)}
                    />
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-sage">{t.kicker}</p>
                        <p className="font-display text-lg">{opt.titolo}</p>
                        <p className="text-xs text-ink/55">Durata: {opt.minuti} minuti</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl">€{opt.prezzo}</p>
                        <p className="text-[9px] uppercase tracking-[0.14em] text-sage">Onnicomprensivo</p>
                      </div>
                    </div>
                    <p className="mt-3 bg-mist p-3 text-[11px] leading-relaxed text-ink/65">{t.summary}</p>
                  </label>
                );
              })}
            </div>
            <label className="mt-8 flex cursor-pointer items-start gap-3 bg-paper p-6 text-[12px] leading-snug text-ink/70">
              <input
                type="checkbox"
                className="mt-0.5 accent-ink"
                checked={pdf}
                onChange={(e) => setPdf(e.target.checked)}
              />
              <span>
                {consulti.pdf.etichetta}
                <strong className="ml-2 font-medium text-ink">+ €{consulti.pdf.prezzo}</strong>
              </span>
            </label>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <Kicker>02 · Modalità d’incontro</Kicker>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode("studio")}
                className={`p-4 text-left ${mode === "studio" ? "bg-ink text-on-ink" : "bg-mist text-ink"}`}
              >
                <p className="font-display">In studio</p>
                <p className={`mt-1 text-[10px] ${mode === "studio" ? "text-on-ink/70" : "text-ink/50"}`}>
                  {STUDIO.city} centro
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMode("remote")}
                className={`p-4 text-left ${mode === "remote" ? "bg-ink text-on-ink" : "bg-mist text-ink"}`}
              >
                <p className="font-display">A distanza</p>
                <p className={`mt-1 text-[10px] ${mode === "remote" ? "text-on-ink/70" : "text-ink/50"}`}>
                  Audio WhatsApp
                </p>
              </button>
            </div>
            {mode === "remote" ? (
              <p className="mt-8 bg-linen p-8 text-[12px] leading-relaxed text-ink/70">{STUDIO.whatsappNote}</p>
            ) : (
              <p className="mt-8 bg-mist p-8 text-[12px] leading-relaxed text-ink/70">
                {siteContent.brand.studioDiTeresa}
              </p>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section>
            <Kicker>03 · Calendario</Kicker>
            <div className="mt-8">
              <BookingCalendar dateIso={dateIso} slot={slot} onDate={chooseDate} onSlot={setSlot} />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="bg-paper p-8 md:p-10">
            <Kicker>04 · Coordinate del consultante</Kicker>
            <div className="mt-8 flex flex-col gap-8">
              <Field label="Nome completo *" value={name} onChange={setName} required placeholder="Es. Elena Silvestri" />
              <Field
                label="Recapito WhatsApp per la chiamata *"
                value={phone}
                onChange={setPhone}
                required
                type="tel"
                placeholder="+39 340 000 0000"
              />
              <Field label="Data di nascita (facoltativa)" value={birth} onChange={setBirth} type="date" />
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.16em] text-sage">
                  Quesito o intento della sessione
                </span>
                <textarea
                  rows={3}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
                  placeholder="Descrivi brevemente l’argomento nodale..."
                />
              </label>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section>
            <div className="bg-mist p-8">
              <Row k="Sessione" v={`${option.titolo} (${option.minuti} min)`} />
              <Row k="Erogazione" v={mode === "remote" ? "Chiamata vocale WhatsApp" : `In studio a ${STUDIO.city}`} />
              <Row k="Data & ora" v={`${dayLabel} — ${slot}`} />
              {pdf ? <Row k={consulti.pdf.etichetta} v={`€${consulti.pdf.prezzo}`} /> : null}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.16em] text-ink">Totale sessione</span>
                <span className="font-display text-xl">€{total}</span>
              </div>
            </div>
            <p className="mt-8 bg-linen p-6 text-[12px] leading-relaxed text-ink/75">{consulti.avvisoConferma}</p>
            {session ? (
              <>
                <div className="mt-8">
                  <ConsentFields
                    consents={consents}
                    onChange={setConsents}
                    onPrivacy={() => setNotice("privacy")}
                    onVendita={() => setNotice("vendita")}
                  />
                </div>
                {error ? <p className="mt-4 text-center text-sm text-ink">{error}</p> : null}
                <Button type="button" className="mt-8 w-full" disabled={busy} onClick={() => void confirm()}>
                  {consulti.conferma}
                </Button>
              </>
            ) : (
              <div className="mt-8 bg-paper p-8 md:p-10">
                <WidgetFrame
                  title={authMode === "login" ? auth.login : authMode === "magic" ? auth.magicLink : auth.registrazione}
                >
                  {ready ? <p className="mb-8 text-center text-sm leading-[1.9] text-ink/70">{consulti.accessoObbligatorio}</p> : null}
                  <AuthForm
                    mode={authMode}
                    onMode={setAuthMode}
                    redirectTo="/consulti"
                    onPrivacy={() => setNotice("privacy")}
                    onVendita={() => setNotice("vendita")}
                    onSuccess={() => {
                      persistDraft();
                      setError(null);
                    }}
                  />
                </WidgetFrame>
                {error ? <p className="mt-6 text-center text-sm text-ink">{error}</p> : null}
              </div>
            )}
            <a
              ref={waLink}
              href={whatsappHref(buildWhatsAppMessage(draft(), option.titolo))}
              {...WHATSAPP_ANCHOR}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            >
              {consulti.conferma}
            </a>
          </section>
        </Reveal>
      </div>
      <LegalNotice kind={notice} onClose={() => setNotice(null)} />
    </div>
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
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.16em] text-sage">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-ink/20 bg-transparent py-2 text-sm outline-none focus:border-ink"
      />
    </label>
  );
}
