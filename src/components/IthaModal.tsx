import { useMemo, useState } from "react";
import { siteContent } from "../data/siteContent.ts";
import { useAuth } from "../context/AuthContext.tsx";
import { useItha } from "../context/IthaContext.tsx";
import { drawCrocicchio, type DrawnIthaCard } from "../data/ithaMazzo.ts";
import { requestIthaDecode } from "../lib/itha/client.ts";
import { downloadIthaPdf } from "../lib/itha/pdf.ts";
import { ithaCardSections } from "../lib/itha/prompt.ts";
import { ITHA_CREDITS_UNLOCKED, ithaDemoAccess, type IthaPlanId, type IthaReading } from "../lib/itha/types.ts";
import { isIthaDev } from "../lib/itha/dev.ts";
import { isIthaQuestionBlocked } from "../lib/itha/safety.ts";
import { AuthForm } from "./AuthForm";
import { Button, Kicker } from "./Button";
import { IthaCardBack, IthaCardFace } from "./IthaCardFace.tsx";
import { IthaDevGrant } from "./IthaDevGrant.tsx";
import { IthaPayPal } from "./IthaPayPal.tsx";
import { LegalNotice, type LegalKind } from "./LegalNotice";
import { WidgetDialog } from "./WidgetDialog";

const { itha } = siteContent;

type Pane =
  | "intro"
  | "auth"
  | "hub"
  | "category"
  | "question"
  | "draw"
  | "reading"
  | "archive"
  | "recharge";

export function IthaModal() {
  const { session, openAuth } = useAuth();
  const { open, closeItha, credits, readings, refreshItha, setCredits } = useItha();
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
    return Boolean(session) || isIthaDev() || ithaDemoAccess();
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

  async function decode() {
    if (!category || !question.trim() || cards.length !== 3) return;
    setBusy(true);
    setError(null);
    try {
      const result = await requestIthaDecode({
        category: category.titolo,
        categoryId: category.id,
        question: question.trim(),
        cards: cards.map((card) => ({
          id: card.id,
          name: card.name,
          suit: card.suit,
          rank: card.rank,
          position: card.position,
        })),
      });
      setCredits(result.credits);
      const next: IthaReading = {
        id: result.id,
        createdAt: result.createdAt,
        category: category.titolo,
        question: question.trim(),
        cards,
        decode: result.decode,
      };
      setReading(next);
      setPane("reading");
      await refreshItha();
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : itha.errori.decodifica;
      setError(message);
      if (message === itha.errori.sessione && !ithaDemoAccess()) {
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
          <Intro
            onContinue={() => setPane(canEnterHub() ? "hub" : "auth")}
            onDevGranted={() => setPane("hub")}
          />
        ) : null}
        {pane === "auth" ? (
          <div className="flex flex-col gap-8 text-left">
            <p className="text-sm leading-[1.9] text-ink/70">{itha.errori.sessione}</p>
            <AuthForm
              onPrivacy={() => setLegal("privacy")}
              onVendita={() => setLegal("vendita")}
              onSuccess={() => {
                void refreshItha();
                setPane("hub");
              }}
            />
            {ithaDemoAccess() ? (
              <Button variant="ghost" className="w-full" onClick={() => setPane("hub")}>
                {itha.prosegui}
              </Button>
            ) : null}
            <IthaDevGrant onGranted={() => setPane("hub")} />
          </div>
        ) : null}
        {pane === "hub" ? (
          <Hub
            credits={credits}
            onStart={() => (ITHA_CREDITS_UNLOCKED || isIthaDev() || credits > 0 ? setPane("category") : setPane("recharge"))}
            onRecharge={() => setPane("recharge")}
            onArchive={() => setPane("archive")}
          />
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
            onDraw={() => setCards(drawCrocicchio())}
            onDecode={() => void decode()}
          />
        ) : null}
        {pane === "reading" && reading ? (
          <Reading
            reading={reading}
            onNew={() => {
              resetFlow();
              setPane(ITHA_CREDITS_UNLOCKED || isIthaDev() || credits > 0 ? "category" : "recharge");
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
        {pane === "recharge" ? (
          <Recharge
            onPaid={(next) => {
              setCredits(next);
              void refreshItha();
              setPane("hub");
            }}
            onBack={() => setPane("hub")}
            onDevGranted={() => setPane("hub")}
          />
        ) : null}
      </WidgetDialog>
      <LegalNotice kind={legal} onClose={() => setLegal(null)} />
    </>
  );
}

function Intro({ onContinue, onDevGranted }: { onContinue: () => void; onDevGranted: () => void }) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <p className="text-[10px] uppercase tracking-[0.16em] text-sage">{itha.kicker}</p>
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
      <aside className="border-l-2 border-sage bg-mist px-5 py-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-sage">{itha.presenteTitolo}</p>
        <p className="mt-3 font-display text-xl leading-snug text-ink">{itha.presenteTesto}</p>
      </aside>
      <p className="text-sm leading-[1.85] text-ink/70">{itha.zeroGratuita}</p>
      <Button className="w-full" onClick={onContinue}>
        {itha.entra}
      </Button>
      <IthaDevGrant onGranted={onDevGranted} />
    </div>
  );
}

function Hub({
  credits,
  onStart,
  onRecharge,
  onArchive,
}: {
  credits: number;
  onStart: () => void;
  onRecharge: () => void;
  onArchive: () => void;
}) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="flex items-center justify-between bg-mist px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-sage">{itha.credito}</p>
        <p className="font-display text-2xl">{credits}</p>
      </div>
      {credits < 1 && !isIthaDev() && !ITHA_CREDITS_UNLOCKED ? <p className="text-sm leading-[1.9] text-ink/70">{itha.creditoEsaurito}</p> : null}
      <Button className="w-full" onClick={onStart} disabled={!ITHA_CREDITS_UNLOCKED && !isIthaDev() && credits < 1}>
        {itha.entra}
      </Button>
      <Button variant="ghost" className="w-full" onClick={onRecharge}>
        {itha.ricarica}
      </Button>
      <button
        type="button"
        onClick={onArchive}
        className="text-center text-[10px] uppercase tracking-[0.16em] text-sage hover:text-ink"
      >
        {itha.archivio}
      </button>
      <IthaDevGrant />
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
  onDraw,
  onDecode,
}: {
  cards: DrawnIthaCard[];
  busy: boolean;
  error: string | null;
  onDraw: () => void;
  onDecode: () => void;
}) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <Kicker>{itha.pescaTitolo}</Kicker>
        <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.pescaLead}</p>
      </div>
      {cards.length === 0 ? (
        <button type="button" onClick={onDraw} className="mx-auto w-36" aria-label={itha.pescaAzione}>
          <IthaCardBack />
        </button>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map((card) => {
            const pos = itha.posizioni.find((p) => p.id === card.position);
            return (
              <article key={card.id}>
                <p className="mb-3 text-[10px] uppercase tracking-[0.14em] text-sage">{pos?.titolo}</p>
                <IthaCardFace card={card} />
                <p className="mt-3 font-display text-sm">{card.name}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink/55">{pos?.ruolo}</p>
              </article>
            );
          })}
        </div>
      )}
      {error ? <p className="text-sm text-ink">{error}</p> : null}
      {cards.length === 0 ? (
        <Button className="w-full" onClick={onDraw}>
          {itha.pescaAzione}
        </Button>
      ) : (
        <Button className="w-full" onClick={onDecode} disabled={busy}>
          {busy ? itha.decodificaInCorso : itha.decodifica}
        </Button>
      )}
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
  const cards = useMemo(() => ithaCardSections(reading), [reading]);
  return (
    <div className="flex flex-col gap-8 text-left">
      <p className="text-sm leading-[1.9] text-ink/70">{reading.question}</p>
      {cards.map((section) =>
        section.card ? (
          <article key={section.pos.id} className="border-t border-ink/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.14em] text-sage">{section.titolo}</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-[7.5rem_1fr] sm:items-start">
              <IthaCardFace card={section.card} />
              <div>
                <Kicker>{itha.pdfSignificato}</Kicker>
                <p className="mt-3 text-sm leading-[1.85] text-ink/70">{section.lama?.significato}</p>
              </div>
            </div>
            <div className="mt-6">
              <Kicker>{itha.pdfLettura}</Kicker>
              <p className="mt-3 whitespace-pre-line text-sm leading-[1.9] text-ink/70">{section.lettura}</p>
            </div>
          </article>
        ) : null,
      )}
      <Button className="w-full" onClick={() => void downloadIthaPdf(reading)}>
        {itha.pdf}
      </Button>
      <Button variant="ghost" className="w-full" onClick={onNew}>
        {itha.nuova}
      </Button>
      <button
        type="button"
        onClick={onHub}
        className="text-center text-[10px] uppercase tracking-[0.16em] text-sage hover:text-ink"
      >
        {itha.credito}
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
            <p className="text-[10px] uppercase tracking-[0.14em] text-sage">{item.category}</p>
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

function Recharge({
  onPaid,
  onBack,
  onDevGranted,
}: {
  onPaid: (credits: number) => void;
  onBack: () => void;
  onDevGranted: () => void;
}) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <div>
        <Kicker>{itha.pianiTitolo}</Kicker>
        <p className="mt-3 text-sm leading-[1.9] text-ink/70">{itha.pianiLead}</p>
      </div>
      {itha.piani.map((piano) => (
        <article key={piano.id} className="bg-mist p-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-sage">
            {piano.crediti} · €{piano.prezzo}
          </p>
          <h3 className="mt-3 font-display text-xl">{piano.titolo}</h3>
          <p className="mt-3 text-sm leading-[1.85] text-ink/70">{piano.testo}</p>
          <p className="mt-3 text-[11px] text-ink/55">{piano.paypal}</p>
          {piano.rate ? <p className="mt-1 text-[11px] text-ink/55">{piano.rate}</p> : null}
          <div className="mt-5">
            <IthaPayPal planId={piano.id as IthaPlanId} onPaid={onPaid} />
          </div>
        </article>
      ))}
      <Button variant="ghost" className="w-full" onClick={onBack}>
        {itha.prosegui}
      </Button>
      <IthaDevGrant onGranted={onDevGranted} />
    </div>
  );
}
