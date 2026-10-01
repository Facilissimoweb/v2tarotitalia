import { useMemo, useState, type FormEvent } from "react";
import { STUDIO, TARIFFE, type TariffaId } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { TIME_SLOTS, upcomingWeekdays, type Booking, type BookingMode } from "../lib/storage";
import { Button, Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";

export function Consulti() {
  const { addBooking, session } = useAuth();
  const days = useMemo(() => upcomingWeekdays(7), []);
  const [type, setType] = useState<TariffaId>("deep");
  const [mode, setMode] = useState<BookingMode>("remote");
  const [dateIso, setDateIso] = useState(days[0]?.iso ?? "");
  const [slot, setSlot] = useState("15:00");
  const [name, setName] = useState(session?.name ?? "");
  const [phone, setPhone] = useState("");
  const [birth, setBirth] = useState("");
  const [query, setQuery] = useState("");
  const [pdf, setPdf] = useState(true);
  const [done, setDone] = useState<Booking | null>(null);

  const tariffa = TARIFFE.find((t) => t.id === type)!;
  const day = days.find((d) => d.iso === dateIso);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const booking: Booking = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      type,
      minutes: tariffa.minutes as 30 | 60,
      price: tariffa.price as 40 | 70,
      mode,
      dateIso,
      slot,
      name: name.trim(),
      phone: phone.trim(),
      birth: birth || undefined,
      query: query.trim() || undefined,
      pdf,
    };
    addBooking(booking);
    setDone(booking);
  }

  if (done) {
    return (
      <PageHero
        kicker="Richiesta registrata"
        title="La soglia è aperta"
        lead={
          <>
            Gentile <strong className="font-medium">{done.name}</strong>, la prenotazione per{" "}
            <strong className="font-medium">{tariffa.name}</strong> ({done.minutes} min, {done.price}€)
            il <strong className="font-medium">{day?.label}</strong> alle {done.slot} —{" "}
            {done.mode === "remote" ? "chiamata vocale WhatsApp" : `in studio a ${STUDIO.city}`} — è
            stata registrata.
            {done.pdf ? " Il report PDF verrà inviato su WhatsApp al termine." : ""} Entro due ore
            riceverai conferma. Nessun addebito preventivo.
          </>
        }
        cta={{
          to: session ? "/riservata" : "/login",
          label: session ? "Vedi in Area Riservata" : "Accedi per i tuoi consulti",
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
        lead={`Uno spazio di ascolto a ${STUDIO.city} o per via auricolare. Tariffe fisse, protocollo WhatsApp vocale, report PDF su richiesta.`}
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
            {TARIFFE.map((t) => (
              <label
                key={t.id}
                className={`cursor-pointer bg-paper p-8 ${type === t.id ? "ring-1 ring-ink" : ""}`}
              >
                <input
                  type="radio"
                  name="type"
                  className="sr-only"
                  checked={type === t.id}
                  onChange={() => setType(t.id)}
                />
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-sage">{t.kicker}</p>
                    <p className="font-display text-lg">{t.name}</p>
                    <p className="text-xs text-ink/55">Durata: {t.minutes} minuti</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl">{t.price},00 €</p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-sage">Onnicomprensivo</p>
                  </div>
                </div>
                <p className="mt-3 bg-mist p-3 text-[11px] leading-relaxed text-ink/65">{t.summary}</p>
              </label>
            ))}
          </div>
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
            <div className="mt-8 bg-linen p-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink">
                Protocollo di conduzione auricolare
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink/70">{STUDIO.whatsappNote}</p>
              <p className="mt-3 bg-paper p-3 text-[11px] leading-relaxed text-ink/75">
                Su richiesta è incluso l’invio del report sintetico fotografico e interpretativo in
                PDF ad alta risoluzione sul vostro WhatsApp al termine della sessione.
              </p>
            </div>
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
            <label className="flex items-start gap-3 text-[12px] leading-snug text-ink/70">
              <input
                type="checkbox"
                className="mt-0.5 accent-ink"
                checked={pdf}
                onChange={(e) => setPdf(e.target.checked)}
              />
              Desidero ricevere il <strong className="font-medium text-ink"> report fotografico e sintesi PDF</strong> su WhatsApp.
            </label>
          </div>
        </section>
        </Reveal>

        <Reveal>
        <section>
          <div className="bg-mist p-8">
            <Row k="Sessione" v={`${tariffa.name} (${tariffa.minutes} min)`} />
            <Row k="Erogazione" v={mode === "remote" ? "Chiamata vocale WhatsApp" : `In studio a ${STUDIO.city}`} />
            <Row k="Data & ora" v={`${day?.label ?? ""} — ${slot}`} />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.16em] text-ink">Totale sessione</span>
              <span className="font-display text-xl">{tariffa.price},00 €</span>
            </div>
          </div>
          <Button type="submit" className="mt-8 w-full">
            Conferma e riserva la sessione →
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
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="uppercase tracking-[0.14em] text-sage">{k}</span>
      <span className="text-ink">{v}</span>
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
