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
import { isEveningSlot, resolveBookingMode, sessionModeLabel } from "../lib/bookingRules";
import { fetchOccupiedSlots, isOccupied } from "../lib/occupiedSlots";
import { loginPath } from "../lib/authReturn";
import { formatBookingDay } from "../lib/whatsapp";
import { Button } from "../components/Button";
import { conPeso } from "../components/Prosa";
import { BookingCalendar } from "../components/BookingCalendar";
import { PageBanner } from "../components/PageBanner";
import { PageFaq } from "../components/PageFaq";
import { Reveal } from "../components/Reveal";
import { StackDeck, StackSheet } from "../components/StackSheet";

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
  const evening = isEveningSlot(slot);
  const meeting = resolveBookingMode(mode, slot);

  useEffect(() => {
    if (restored.current) return;
    const saved = readBookingDraft();
    restored.current = true;
    if (!saved) return;
    setType(saved.type);
    setPdf(saved.pdf);
    const hoursOnSavedDay = slotsForDate(saved.dateIso);
    const date = hoursOnSavedDay.length ? saved.dateIso : nextBookableDate();
    const hours = slotsForDate(date);
    setDateIso(date);
    const nextSlot = hours.includes(saved.slot) ? saved.slot : hours[0] ?? saved.slot;
    setSlot(nextSlot);
    setMode(resolveBookingMode(saved.mode, nextSlot));
  }, []);

  useEffect(() => {
    const tipo = searchParams.get("tipo");
    if (tipo === "focus" || tipo === "deep") setType(tipo);
  }, [searchParams]);

  function chooseDate(iso: string) {
    setDateIso(iso);
    const hours = slotsForDate(iso);
    const nextSlot = hours.length && !hours.includes(slot) ? hours[0] : slot;
    if (nextSlot !== slot) setSlot(nextSlot);
    setMode((current) => resolveBookingMode(current, nextSlot));
  }

  function chooseSlot(hour: string) {
    setSlot(hour);
    setMode((current) => resolveBookingMode(current, hour));
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
      mode: resolveBookingMode(mode, slot),
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
    if (session) navigate("/carrello");
    else navigate(loginPath("/carrello"), { state: { from: "/carrello" } });
  }

  return (
    <div className="min-w-0 overflow-x-clip">
      <PageBanner
        title={nav.consulti}
        subtitle={consulti.intro}
        background={consulti.immagini.hero}
        className="mb-0"
      />

      <StackDeck flush>
      <StackSheet className="bg-paper">
      <div
        id="prenota"
        className="mx-auto flex w-full min-w-0 max-w-2xl scroll-mt-28 flex-col gap-20 px-[clamp(1.25rem,5vw,2.5rem)] pb-24 pt-16 md:gap-24 md:pb-32 md:pt-24"
      >
        <Reveal className="w-full min-w-0">
          <section className="w-full min-w-0">
            <div className="mb-8 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h2 className="label-kicker">01 · Scegli la durata</h2>
              <span className="text-[0.625rem] uppercase tracking-[0.12em] text-ember-soft sm:tracking-[0.16em]">
                Tariffa fissa
              </span>
            </div>
            <div className="grid w-full min-w-0 gap-6">
              {consulti.opzioni.map((opt) => {
                const t = TARIFFE.find((x) => x.id === opt.id)!;
                return (
                  <label
                    key={opt.id}
                    className={`block w-full min-w-0 max-w-full cursor-pointer bg-paper px-5 py-6 sm:p-8 ${type === opt.id ? "ember-seal" : ""}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      className="sr-only"
                      checked={type === opt.id}
                      onChange={() => setType(opt.id)}
                    />
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="min-w-0">
                        <p className="text-[0.625rem] uppercase tracking-[0.12em] text-ember-soft [overflow-wrap:anywhere] sm:tracking-[0.16em]">
                          {t.kicker}
                        </p>
                        <p className="font-display text-lg [overflow-wrap:anywhere]">{opt.titolo}</p>
                        <p className="text-xs text-ink/55">Durata: {opt.minuti} minuti</p>
                      </div>
                      <div className="min-w-0 sm:shrink-0 sm:text-right">
                        <p className="font-display text-xl">€{opt.prezzo}</p>
                        <p className="text-[0.625rem] uppercase tracking-[0.08em] text-ember-soft [overflow-wrap:anywhere] sm:tracking-[0.12em]">
                          Onnicomprensivo
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 min-w-0 bg-mist p-3 text-[0.6875rem] leading-relaxed text-ink/65 [overflow-wrap:anywhere]">
                      {t.summary}
                    </p>
                  </label>
                );
              })}
            </div>
            <label className="mt-8 flex w-full min-w-0 cursor-pointer items-start gap-3 bg-paper p-5 text-[0.75rem] leading-snug text-ink/70 sm:p-6">
              <input
                type="checkbox"
                className="mt-0.5 shrink-0 accent-ink"
                checked={pdf}
                onChange={(e) => setPdf(e.target.checked)}
              />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {consulti.pdf.etichetta}
                <strong className="ml-2 font-medium text-ink">+ €{consulti.pdf.prezzo}</strong>
              </span>
            </label>
          </section>
        </Reveal>

        <Reveal className="w-full min-w-0">
          <section className="w-full min-w-0">
            <h2 className="label-kicker">02 · Modalità d’incontro</h2>
            <div className="mt-8 grid grid-cols-1 gap-3 min-[22rem]:grid-cols-2 min-[22rem]:gap-4">
              <button
                type="button"
                disabled={evening}
                onClick={() => {
                  if (!evening) setMode("studio");
                }}
                className={`min-w-0 p-4 text-left ${
                  meeting === "studio" ? "ember-seal-dark bg-plate text-on-ink" : "bg-mist text-ink"
                } ${evening ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <p className="font-display [overflow-wrap:anywhere]">{consulti.modalita.presenza}</p>
                <p className={`mt-1 text-[0.625rem] [overflow-wrap:anywhere] ${meeting === "studio" ? "text-on-ink/70" : "text-ink/50"}`}>
                  {consulti.modalita.presenzaNota}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMode("remote")}
                className={`min-w-0 p-4 text-left ${meeting === "remote" ? "ember-seal-dark bg-plate text-on-ink" : "bg-mist text-ink"}`}
              >
                <p className="font-display [overflow-wrap:anywhere]">{consulti.modalita.distanza}</p>
                <p className={`mt-1 text-[0.625rem] ${meeting === "remote" ? "text-on-ink/70" : "text-ink/50"}`}>
                  {consulti.modalita.distanzaNota}
                </p>
              </button>
            </div>
            <p className="mt-4 min-w-0 text-[0.6875rem] leading-relaxed text-ink/65 [overflow-wrap:anywhere]">
              {evening ? consulti.studioSeraChiuso : consulti.seraOnline}
            </p>
            {meeting === "remote" ? (
              <p className="mt-8 min-w-0 bg-linen p-5 text-[0.75rem] leading-relaxed text-ink/70 [overflow-wrap:anywhere] sm:p-8">
                {STUDIO.whatsappNote}
              </p>
            ) : (
              <p className="mt-8 min-w-0 bg-mist p-5 text-[0.75rem] leading-relaxed text-ink/70 [overflow-wrap:anywhere] sm:p-8">
                {conPeso(siteContent.brand.studioDiTeresa)}
              </p>
            )}
          </section>
        </Reveal>

        <Reveal className="w-full min-w-0">
          <section className="w-full min-w-0">
            <h2 className="label-kicker">03 · Scegli giorno e orario</h2>
            <div className="mt-8 min-w-0">
              <BookingCalendar dateIso={dateIso} slot={slot} onDate={chooseDate} onSlot={chooseSlot} />
            </div>
          </section>
        </Reveal>

        <Reveal className="w-full min-w-0">
          <section className="w-full min-w-0">
            <div className="min-w-0 bg-mist p-5 sm:p-8">
              <Row k="Sessione" v={`${option.titolo} (${option.minuti} min)`} />
              <Row k="Erogazione" v={sessionModeLabel(meeting, slot, STUDIO.city)} />
              <Row k="Data & ora" v={`${dayLabel} — ${slot}`} />
              {pdf ? <Row k={consulti.pdf.etichetta} v={`€${consulti.pdf.prezzo}`} /> : null}
              <div className="mt-3 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="min-w-0 text-[0.625rem] uppercase tracking-[0.12em] text-ink [overflow-wrap:anywhere] sm:tracking-[0.16em]">
                  Totale sessione
                </span>
                <span className="font-display text-xl">€{total}</span>
              </div>
            </div>
            {error ? <p className="mt-4 text-center text-sm text-ink">{error}</p> : null}
            <Button type="button" className="ti-btn-plain mt-8 w-full max-w-full whitespace-normal text-center" onClick={() => void proceed()}>
              {consulti.procedi}
            </Button>
          </section>
        </Reveal>
      </div>
      </StackSheet>

      <StackSheet className="bg-ivory px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-16">
          <article className="border-t border-ink/15 pt-6">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ember-soft">
              Il consulto
            </p>
            <h2 className="mt-4 font-display text-2xl font-normal leading-snug text-ink md:text-3xl">
              Lettura dei tarocchi dal vivo
            </h2>
            <p className="mt-5 text-sm leading-[1.9] text-ink/75">
              {conPeso(consulti.letturaDalVivo)}
            </p>
          </article>
          <article className="border-t border-ink/15 pt-6">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ember-soft">
              La sede
            </p>
            <h2 className="mt-4 font-display text-2xl font-normal leading-snug text-ink md:text-3xl">
              Lettura dei tarocchi in Via Crispi a Macerata
            </h2>
            <p className="mt-5 text-sm leading-[1.9] text-ink/75">
              {conPeso(siteContent.brand.studioDiTeresa)}
            </p>
            <p className="mt-4 text-sm leading-[1.9] text-ink/75">
              {conPeso(consulti.studioSeraChiuso)}
            </p>
          </article>
        </div>
      </StackSheet>

      <PageFaq kicker={consulti.faq.kicker} titolo={consulti.faq.titolo} voci={consulti.faq.voci} />
      </StackDeck>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1.5 text-xs">
      <span className="min-w-0 uppercase tracking-[0.12em] text-ember-soft [overflow-wrap:anywhere] sm:tracking-[0.16em]">
        {k}
      </span>
      <span className="min-w-0 text-left text-ink [overflow-wrap:anywhere] sm:text-right">{v}</span>
    </div>
  );
}
