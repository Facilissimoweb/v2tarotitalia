import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { consultTotal, REPORT_PDF_PRICE, STUDIO, TARIFFE, type TariffaId } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { hasRequiredConsents, TIME_SLOTS, upcomingWeekdays, type BookingMode, type Purchase } from "../lib/storage";
import { Button, Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const { consulti } = siteContent;

export function Consulti() {
  const { addPurchase, session, openAuth } = useAuth();
  const days = useMemo(() => upcomingWeekdays(7), []);
  const [type, setType] = useState<TariffaId>("focus");
  const [mode, setMode] = useState<BookingMode>("remote");
  const [dateIso, setDateIso] = useState(days[0]?.iso ?? "");
  const [slot, setSlot] = useState("15:00");
  const [name, setName] = useState(session?.name ?? "");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [query, setQuery] = useState("");
  const [pdf, setPdf] = useState(false);
  const [done, setDone] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const pendingLock = useRef(false);

  const option = consulti.opzioni.find((o) => o.id === type)!;
  const day = days.find((d) => d.iso === dateIso);
  const total = consultTotal(option.prezzo, pdf);

  useEffect(() => {
    if (session?.name && !name) setName(session.name);
  }, [session, name]);

  function draft() {
    return {
      type,
      minutes: option.minuti as 30 | 60,
      consultPrice: option.prezzo as 40 | 70,
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

  async function confirm() {
    const data = draft();
    if (!data.name || !data.phone) return;
    if (!session || !hasRequiredConsents(session.consents)) {
      setPending(true);
      openAuth();
      return;
    }
    if (pendingLock.current) return;
    pendingLock.current = true;
    setError(null);
    const err = await addPurchase(data, session.consents);
    pendingLock.current = false;
    if (err) {
      setError(err);
      return;
    }
    setPending(false);
    setDone({
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "pending",
      consents: session.consents,
    });
  }

  useEffect(() => {
    if (!pending || !session || !hasRequiredConsents(session.consents) || done) return;
    void confirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, session]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void confirm();
  }

  if (done) {
    return (
      <PageHero
        kicker="Richiesta registrata"
        title="La soglia è aperta"
        lead={
          <>
            Gentile <strong className="font-medium">{done.name}</strong>, la prenotazione per{" "}
            <strong className="font-medium">{option.titolo}</strong> ({done.minutes} min, {done.total}€)
            il <strong className="font-medium">{day?.label}</strong> alle {done.slot} —{" "}
            {done.mode === "remote" ? "chiamata vocale WhatsApp" : `in studio a ${STUDIO.city}`} — è
            stata registrata.
            {done.pdf
              ? ` ${consulti.pdf.etichetta} (+€${consulti.pdf.prezzo}).`
              : ""}{" "}
            Entro due ore riceverai conferma. Nessun addebito preventivo.
          </>
        }
        cta={{
          to: "/riservata",
          label: siteContent.nav.riservata,
        }}
        secondary={{ to: "/", label: "Torna alla Home" }}
        media={{
          src: siteContent.chiSiamo.immagini.simboli.src,
          type: "image",
          alt: siteContent.chiSiamo.immagini.simboli.alt,
        }}
      />
    );
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

      <form
        id="prenota"
        className="mx-auto flex max-w-2xl scroll-mt-28 flex-col gap-20 px-6 pb-24 md:gap-24 md:px-10 md:pb-32"
        onSubmit={onSubmit}
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
          <Kicker>03 · Sincronicità temporale</Kicker>
          <div className="mt-8 bg-paper p-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-sage">Giorni disponibili</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setDateIso(d.iso)}
                  className={`flex flex-col items-center py-2.5 ${
                    dateIso === d.iso ? "bg-ink text-on-ink" : "bg-mist text-ink"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider opacity-70">{d.day}</span>
                  <span className="font-display text-base">{d.num}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-sage">Fasce orarie</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`py-3 text-xs tracking-wide ${
                  slot === s ? "bg-ink text-on-ink" : "bg-paper text-ink"
                }`}
              >
                {s}
              </button>
            ))}
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
            <Row k="Data & ora" v={`${day?.label ?? ""} — ${slot}`} />
            {pdf ? <Row k={consulti.pdf.etichetta} v={`€${consulti.pdf.prezzo}`} /> : null}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.16em] text-ink">Totale sessione</span>
              <span className="font-display text-xl">€{total}</span>
            </div>
          </div>
          {error ? <p className="mt-4 text-center text-sm text-ink">{error}</p> : null}
          <Button type="submit" className="mt-8 w-full">
            {consulti.conferma}
          </Button>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.14em] text-ink/45">
            Pagamento sicuro post-accettazione. Nessun addebito preventivo.
          </p>
        </section>
        </Reveal>
      </form>
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
