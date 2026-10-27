import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { consultTotal, REPORT_PDF_PRICE, STUDIO, TARIFFE, type TariffaId } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import {
  emptyConsents,
  nextBookableDate,
  readBookingDraft,
  slotsForDate,
  writeBookingDraft,
  type BookingMode,
} from "../lib/storage";
import { fetchOccupiedSlots, isOccupied } from "../lib/occupiedSlots";
import { formatBookingDay } from "../lib/whatsapp";
import { Button, Kicker } from "../components/Button";
import { BookingCalendar } from "../components/BookingCalendar";
import { PageBanner } from "../components/PageBanner";
import { Reveal } from "../components/Reveal";

const { consulti, nav } = siteContent;

function initialDate() {
  return nextBookableDate();
}

export function Consulti() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const start = initialDate();
  const [type, setType] = useState<TariffaId>("focus");
  const [mode, setMode] = useState<BookingMode>("remote");
  const [dateIso, setDateIso] = useState(start);
  const [slot, setSlot] = useState(() => slotsForDate(start)[0] ?? "09:00");
  const [pdf, setPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restored = useRef(false);

  const option = consulti.opzioni.find((o) => o.id === type)!;
  const total = consultTotal(option.prezzo, pdf);
  const dayLabel = formatBookingDay(dateIso);

  useEffect(() => {
    if (restored.current) return;
    const saved = readBookingDraft();
    restored.current = true;
    if (!saved) return;
    setType(saved.type);
    setMode(saved.mode);
    setPdf(saved.pdf);
    const hoursOnSavedDay = slotsForDate(saved.dateIso);
    const date = hoursOnSavedDay.length ? saved.dateIso : nextBookableDate();
    const hours = slotsForDate(date);
    setDateIso(date);
    setSlot(hours.includes(saved.slot) ? saved.slot : hours[0] ?? saved.slot);
  }, []);

  useEffect(() => {
    const tipo = searchParams.get("tipo");
    if (tipo === "focus" || tipo === "deep") setType(tipo);
  }, [searchParams]);

  function chooseDate(iso: string) {
    setDateIso(iso);
    const hours = slotsForDate(iso);
    if (hours.length && !hours.includes(slot)) setSlot(hours[0]);
  }

  function persistDraft() {
    const saved = readBookingDraft();
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
      name: saved?.name || session?.name || "",
      phone: saved?.phone || "",
      birth: saved?.birth,
      query: saved?.query,
      consents: saved?.consents ?? emptyConsents(),
    });
  }

  async function proceed() {
    if (!dateIso || !slot || !slotsForDate(dateIso).includes(slot)) {
      setError(consulti.orarioNonDisponibile);
      return;
    }
    const taken = await fetchOccupiedSlots(dateIso, dateIso);
    if (isOccupied(taken, dateIso, slot)) {
      setError(consulti.slotOccupato);
      return;
    }
    persistDraft();
    setError(null);
    if (session) navigate("/riservata");
    else navigate("/login", { state: { from: "/riservata" } });
  }

  return (
    <div>
      <PageBanner title={nav.consulti} className="mb-10 md:mb-14" />

      <div
        id="prenota"
        className="mx-auto flex max-w-2xl scroll-mt-28 flex-col gap-20 px-6 pb-24 md:gap-24 md:px-10 md:pb-32"
      >
        <Reveal>
          <section>
            <div className="mb-8 flex justify-between">
              <Kicker>01 · Seleziona il percorso</Kicker>
              <span className="text-[0.625rem] uppercase tracking-[0.16em] text-sage">Tariffa fissa</span>
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
                        <p className="text-[0.625rem] uppercase tracking-[0.16em] text-sage">{t.kicker}</p>
                        <p className="font-display text-lg">{opt.titolo}</p>
                        <p className="text-xs text-ink/55">Durata: {opt.minuti} minuti</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl">€{opt.prezzo}</p>
                        <p className="text-[0.5625rem] uppercase tracking-[0.14em] text-sage">Onnicomprensivo</p>
                      </div>
                    </div>
                    <p className="mt-3 bg-mist p-3 text-[0.6875rem] leading-relaxed text-ink/65">{t.summary}</p>
                  </label>
                );
              })}
            </div>
            <label className="mt-8 flex cursor-pointer items-start gap-3 bg-paper p-6 text-[0.75rem] leading-snug text-ink/70">
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
                <p className={`mt-1 text-[0.625rem] ${mode === "studio" ? "text-on-ink/70" : "text-ink/50"}`}>
                  {STUDIO.city} centro
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMode("remote")}
                className={`p-4 text-left ${mode === "remote" ? "bg-ink text-on-ink" : "bg-mist text-ink"}`}
              >
                <p className="font-display">A distanza</p>
                <p className={`mt-1 text-[0.625rem] ${mode === "remote" ? "text-on-ink/70" : "text-ink/50"}`}>
                  Audio WhatsApp
                </p>
              </button>
            </div>
            {mode === "remote" ? (
              <p className="mt-8 bg-linen p-8 text-[0.75rem] leading-relaxed text-ink/70">{STUDIO.whatsappNote}</p>
            ) : (
              <p className="mt-8 bg-mist p-8 text-[0.75rem] leading-relaxed text-ink/70">
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
          <section>
            <div className="bg-mist p-8">
              <Row k="Sessione" v={`${option.titolo} (${option.minuti} min)`} />
              <Row k="Erogazione" v={mode === "remote" ? "Chiamata vocale WhatsApp" : `In studio a ${STUDIO.city}`} />
              <Row k="Data & ora" v={`${dayLabel} — ${slot}`} />
              {pdf ? <Row k={consulti.pdf.etichetta} v={`€${consulti.pdf.prezzo}`} /> : null}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[0.625rem] uppercase tracking-[0.16em] text-ink">Totale sessione</span>
                <span className="font-display text-xl">€{total}</span>
              </div>
            </div>
            {error ? <p className="mt-4 text-center text-sm text-ink">{error}</p> : null}
            <Button type="button" className="mt-8 w-full" onClick={() => void proceed()}>
              {consulti.procedi}
            </Button>
          </section>
        </Reveal>
      </div>
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
