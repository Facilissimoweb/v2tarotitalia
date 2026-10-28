import { useMemo, useState } from "react";
import { siteContent } from "../../../data/siteContent.ts";
import { useAuth } from "../../../context/AuthContext.tsx";
import { useLanguage } from "../../../context/LanguageContext";
import { isSourceLanguage } from "../../../lib/language.ts";
import { AuthForm } from "../../../components/AuthForm";
import { Button, Kicker } from "../../../components/Button";
import { LegalNotice, type LegalKind } from "../../../components/LegalNotice";
import { WidgetDialog } from "../../../components/WidgetDialog";
import { useItha } from "../context/IthaContext.tsx";
import { ithaDeckRows, type DrawnIthaCard, type IthaCard, type IthaPositionId } from "../data/ithaMazzo.ts";
import { requestIthaDecode } from "../lib/client.ts";
import { downloadIthaPdf } from "../lib/pdf.ts";
import { ithaCardSections } from "../lib/prompt.ts";
import type { IthaReading } from "../lib/types.ts";
import { isIthaQuestionBlocked } from "../lib/safety.ts";
import { IthaCardBack, IthaCardFace } from "./IthaCardFace.tsx";

const { itha } = siteContent;

type Pane = "intro" | "auth" | "hub" | "category" | "question" | "draw" | "reading" | "archive";

export function IthaModal() {
  const { session, openAuth } = useAuth();
  const { open, closeItha, readings, refreshItha } = useItha();
  const { language } = useLanguage();
  const [pane, setPane] = useState<Pane>("intro");
  const [legal, setLegal] = useState<LegalKind | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<DrawnIthaCard[]>([]);
  const [reading, setReading] = useState<IthaReading | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = itha.campi.find((c) => c.id === categoryId);

  if (!open) return null;

  function resetFlow() {
    setCategoryId("");
    setQuestion("");
    setCards([]);
    setReading(null);
    setError(null);
    setBusy(false);
  }

  function canEnterHub() {
    return Boolean(session);
  }

  function goHub() {
    resetFlow();
    setPane(canEnterHub() ? "hub" : "auth");
  }

  function onClose() {
    resetFlow();
    setPane("intro");
    closeItha();
  }

  async function decode(drawn: DrawnIthaCard[] = cards) {
    if (!category || !question.trim() || drawn.length !== 3) return;
    setBusy(true);
    setError(null);
    try {
      const result = await requestIthaDecode({
        category: category.titolo,
        categoryId: category.id,
        language,
        question: question.trim(),
        cards: drawn.map((card) => ({
          id: card.id,
          name: card.name,
          suit: card.suit,
          rank: card.rank,
          position: card.position,
        })),
      });
      const next: IthaReading = {
        id: result.id,
        createdAt: result.createdAt,
        category: category.titolo,
        question: question.trim(),
        cards: drawn,
        decode: result.decode,
        language,
      };
      setReading(next);
      setPane("reading");
      await refreshItha();
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : itha.errori.decodifica;
      setError(message);
      if (message === itha.errori.sessione) {
        setPane("auth");
        openAuth();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <WidgetDialog title={itha.titoloWidget} onClose={onClose} xl>
        {pane === "intro" ? (
          <Intro onContinue={() => setPane(canEnterHub() ? "hub" : "auth")} />
        ) : null}
        {pane === "auth" ? (
          <div className="flex flex-col gap-8 text-left">
            <p className="text-sm leading-[1.9] text-ink/70">{itha.errori.sessione}</p>
            <AuthForm
              redirectTo={`${window.location.pathname}${window.location.search}`}
              onPrivacy={() => setLegal("privacy")}
              onVendita={() => setLegal("vendita")}
              onSuccess={() => {
                void refreshItha();
                setPane("hub");
              }}
            />
          </div>
        ) : null}
        {pane === "hub" ? (
          <Hub onStart={() => setPane("category")} onArchive={() => setPane("archive")} />
        ) : null}
        {pane === "category" ? (
          <Category
            selected={categoryId}
            onSelect={setCategoryId}
            onNext={() => categoryId && setPane("question")}
          />
        ) : null}
        {pane === "question" ? (
          <Question
            value={question}
            onChange={setQuestion}
            onNext={() => {
              if (!question.trim() || !question.includes("?")) {
                setError(itha.quesitoErrore);
                return;
              }
              if (isIthaQuestionBlocked(question)) {
                setError(itha.bloccoEtico);
                return;
              }
              setError(null);
              setPane("draw");
            }}
            error={error}
          />
        ) : null}
        {pane === "draw" ? (
          <Draw
            cards={cards}
            busy={busy}
            error={error}
            onConfirm={(picked) => {
              const positions: IthaPositionId[] = ["vincolo", "specchio", "soglia"];
              const drawn = picked.map((card, index) => ({ ...card, position: positions[index] }));
              setCards(drawn);
              void decode(drawn);
            }}
            onDecode={() => void decode()}
          />
        ) : null}
        {pane === "reading" && reading ? (
          <Reading
            reading={reading}
            onNew={() => {
              resetFlow();
              setPane("category");
            }}
            onHub={goHub}
          />
        ) : null}
        {pane === "archive" ? (
          <Archive
            readings={readings}
            onBack={() => setPane("hub")}
            onOpen={(item) => {
              setReading(item);
              setPane("reading");
            }}
          />
        ) : null}
      </WidgetDialog>
      <LegalNotice kind={legal} onClose={() => setLegal(null)} />
    </>
  );
}

function Intro({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{itha.kicker}</p>
      <h3 className="font-display text-3xl leading-tight text-ink">{itha.saluto}</h3>
      <p className="text-sm leading-[1.9] text-ink/75">{itha.intro}</p>
      <section>
        <Kicker>{itha.crocicchioTitolo}</Kicker>
        <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.crocicchioTesto}</p>
      </section>
      <section>
        <Kicker>{itha.steseTitolo}</Kicker>
        <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.steseTesto}</p>
      </section>
      <section>
        <Kicker>{itha.usoTitolo}</Kicker>
        <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.usoTesto}</p>
      </section>
      <aside className="border-l-2 border-ember-soft bg-mist px-5 py-5">
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ember-soft">{itha.presenteTitolo}</p>
        <p className="mt-3 font-display text-xl leading-snug text-ink">{itha.presenteTesto}</p>
      </aside>
      <Button className="w-full" onClick={onContinue}>
        {itha.entra}
      </Button>
    </div>
  );
}

function Hub({ onStart, onArchive }: { onStart: () => void; onArchive: () => void }) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <Button className="w-full" onClick={onStart}>
        {itha.entra}
      </Button>
      <button
        type="button"
        onClick={onArchive}
        className="text-center text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft hover:text-ink"
      >
        {itha.archivio}
      </button>
    </div>
  );
}

function Category({
  selected,
  onSelect,
  onNext,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <Kicker>{itha.campoTitolo}</Kicker>
        <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.campoLead}</p>
      </div>
      <div className="grid gap-3">
        {itha.campi.map((campo) => (
          <button
            key={campo.id}
            type="button"
            onClick={() => onSelect(campo.id)}
            className={`px-5 py-4 text-left text-sm leading-snug ${
              selected === campo.id ? "bg-ink text-on-ink" : "bg-mist text-ink hover:bg-paper"
            }`}
          >
            {campo.titolo}
          </button>
        ))}
      </div>
      <Button className="w-full" onClick={onNext} disabled={!selected}>
        {itha.prosegui}
      </Button>
    </div>
  );
}

function Question({
  value,
  onChange,
  onNext,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <Kicker>{itha.quesitoTitolo}</Kicker>
        <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.quesitoLead}</p>
      </div>
      <textarea
        required
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={itha.quesitoPlaceholder}
        className="w-full border-0 border-b border-ink/20 bg-transparent py-3 text-sm leading-[1.8] outline-none focus:border-ink"
      />
      {error ? <p className="text-sm text-ink">{error}</p> : null}
      <Button className="w-full" onClick={onNext}>
        {itha.prosegui}
      </Button>
    </div>
  );
}

function Draw({
  cards,
  busy,
  error,
  onConfirm,
  onDecode,
}: {
  cards: DrawnIthaCard[];
  busy: boolean;
  error: string | null;
  onConfirm: (picked: IthaCard[]) => void;
  onDecode: () => void;
}) {
  const [picked, setPicked] = useState<IthaCard[]>([]);
  const rows = useMemo(() => ithaDeckRows(), []);
  const choosing = cards.length === 0 && !busy;

  function toggle(card: IthaCard) {
    setPicked((current) => {
      const index = current.findIndex((item) => item.id === card.id);
      if (index >= 0) return current.filter((item) => item.id !== card.id);
      if (current.length >= 3) return current;
      return [...current, card];
    });
  }

  return (
    <div className="flex flex-col gap-8 text-left">
      {choosing ? (
        <>
          <div>
            <Kicker>{itha.pescaTitolo}</Kicker>
            <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.pescaLead}</p>
          </div>
          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
            {itha.pescaScelte} {picked.length}/3
          </p>
          <div className="flex flex-col gap-6">
            {rows.map((row) => {
              const titolo = itha.pescaFile.find((file) => file.id === row.suit)?.titolo ?? row.suit;
              return (
                <section key={row.suit}>
                  <p className="mb-3 text-[0.625rem] uppercase tracking-[0.14em] text-ember-soft">{titolo}</p>
                  <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {row.cards.map((card) => {
                      const order = picked.findIndex((item) => item.id === card.id);
                      const selected = order >= 0;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => toggle(card)}
                          aria-pressed={selected}
                          aria-label={itha.pescaDorso}
                          className={`relative w-[4.75rem] shrink-0 snap-start ${selected ? "ring-2 ring-ember-soft" : ""}`}
                        >
                          <IthaCardBack />
                          {selected ? (
                            <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center bg-ivory text-[0.625rem] text-ink">
                              {order + 1}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      ) : null}
      {busy ? <p className="font-display text-xl leading-snug text-ink">{itha.decodificaInCorso}</p> : null}
      {!choosing && !busy ? (
        <div className="grid grid-cols-1 gap-8">
          {cards.map((card) => {
            const pos = itha.posizioni.find((p) => p.id === card.position);
            return (
              <article key={card.id}>
                <p className="mb-3 text-[0.625rem] uppercase tracking-[0.14em] text-ember-soft">{pos?.titolo}</p>
                <div className="mx-auto w-36 sm:mx-0">
                  <IthaCardFace card={card} />
                </div>
                <p className="mt-3 font-display text-sm">{card.name}</p>
                <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink/55">{pos?.ruolo}</p>
              </article>
            );
          })}
        </div>
      ) : null}
      {error ? <p className="text-sm text-ink">{error}</p> : null}
      {choosing ? (
        <Button className="w-full" onClick={() => onConfirm(picked)} disabled={picked.length !== 3}>
          {itha.pescaAzione}
        </Button>
      ) : null}
      {!choosing && !busy && cards.length === 3 ? (
        <Button className="w-full" onClick={onDecode}>
          {itha.decodifica}
        </Button>
      ) : null}
    </div>
  );
}

function Reading({
  reading,
  onNew,
  onHub,
}: {
  reading: IthaReading;
  onNew: () => void;
  onHub: () => void;
}) {
  const { language } = useLanguage();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const cards = useMemo(() => ithaCardSections(reading), [reading]);
  return (
    <div className="flex flex-col gap-8 text-left">
      <p className="text-sm leading-[1.9] text-ink/70">{reading.question}</p>
      {cards.map((section) =>
        section.card ? (
          <article key={section.pos.id} className="border-t border-ink/10 pt-6">
            <p className="text-[0.625rem] uppercase tracking-[0.14em] text-ember-soft">{section.titolo}</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-[7.5rem_1fr] sm:items-start">
              <IthaCardFace card={section.card} />
              <div>
                <Kicker>{itha.pdfSignificato}</Kicker>
                <p className="mt-3 text-sm leading-[1.85] text-ink/70">{section.lama?.significato}</p>
              </div>
            </div>
            <div className="mt-6">
              <Kicker>{itha.pdfLettura}</Kicker>
              <p
                className="mt-3 whitespace-pre-line text-sm leading-[1.9] text-ink/70"
                translate={isSourceLanguage(reading.language ?? language) ? undefined : "no"}
              >
                {section.lettura}
              </p>
            </div>
          </article>
        ) : null,
      )}
      {pdfError ? <p className="text-sm text-ink">{pdfError}</p> : null}
      <Button
        className="w-full"
        disabled={pdfBusy}
        onClick={() => {
          setPdfBusy(true);
          setPdfError(null);
          void Promise.race([
            downloadIthaPdf(reading, language),
            new Promise<never>((_, reject) => {
              window.setTimeout(() => reject(new Error("pdf")), 20000);
            }),
          ])
            .catch(() => setPdfError(itha.groqManca))
            .finally(() => setPdfBusy(false));
        }}
      >
        {pdfBusy ? siteContent.lingua.genera : itha.pdf}
      </Button>
      <Button variant="ghost" className="w-full" onClick={onNew}>
        {itha.nuova}
      </Button>
      <button
        type="button"
        onClick={onHub}
        className="text-center text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft hover:text-ink"
      >
        {itha.prosegui}
      </button>
    </div>
  );
}

function Archive({
  readings,
  onBack,
  onOpen,
}: {
  readings: IthaReading[];
  onBack: () => void;
  onOpen: (reading: IthaReading) => void;
}) {
  return (
    <div className="flex flex-col gap-6 text-left">
      <Kicker>{itha.archivio}</Kicker>
      {readings.length === 0 ? (
        <p className="text-sm leading-[1.9] text-ink/65">{itha.archivioVuoto}</p>
      ) : (
        readings.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onOpen(item);
            }}
            className="bg-mist p-5 text-left"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.14em] text-ember-soft">{item.category}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.question}</p>
          </button>
        ))
      )}
      <Button variant="ghost" className="w-full" onClick={onBack}>
        {itha.prosegui}
      </Button>
    </div>
  );
}
