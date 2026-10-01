import { useMemo, useState } from "react";
import { ARCANI, type Arcano } from "../data/arcani";
import { TARIFFE } from "../data/catalogo";
import { ArcanoArt } from "../components/ArcanoArt";
import { Button, Kicker } from "../components/Button";

type Draw = {
  past: Arcano;
  present: Arcano;
  future: Arcano;
  sigil: string;
};

const POS = [
  { key: "past" as const, label: "I. Il passato" },
  { key: "present" as const, label: "II. Il presente" },
  { key: "future" as const, label: "III. L'evoluzione" },
];

function shuffleDraw(): Draw {
  const pool = [...ARCANI];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const n = Math.floor(100 + Math.random() * 899);
  return {
    past: pool[0],
    present: pool[1],
    future: pool[2],
    sigil: `#${n}-MC`,
  };
}

export function Estrazione() {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [busy, setBusy] = useState(false);
  const [tier, setTier] = useState<"focus" | "deep">("focus");

  function extract() {
    setBusy(true);
    window.setTimeout(() => {
      setDraw(shuffleDraw());
      setBusy(false);
    }, 420);
  }

  const cards = useMemo(() => {
    if (!draw) return [];
    return POS.map((p) => ({ ...p, card: draw[p.key] }));
  }, [draw]);

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <Kicker>Oracolo temporale</Kicker>
      <h1 className="mt-3 font-display text-4xl font-light leading-tight">
        Oracolo archetipico:
        <br />
        <span className="italic">La Triade</span>
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/70">
        Focalizza l’intento e tocca il mazzo. Tre carte — passato, presente, evoluzione —
        estratte dai 22 Arcani Maggiori.
      </p>

      <button
        type="button"
        onClick={extract}
        className="mx-auto mt-12 block w-40 origin-center transition-transform active:scale-95"
        aria-label="Tocca per estrarre"
      >
        <div className="relative h-60">
          <div className="absolute inset-0 translate-x-1 -translate-y-1 bg-linen" />
          <div className="absolute inset-0 -translate-x-1 translate-y-1 bg-mist" />
          <div className="relative flex h-full flex-col justify-between bg-ink p-4 text-on-ink">
            <p className="text-center text-[8px] uppercase tracking-[0.28em] text-on-ink/60">Arcana</p>
            <svg viewBox="0 0 100 100" className="mx-auto h-28 w-28 stroke-on-ink/80" fill="none">
              <circle cx="50" cy="50" r="42" strokeDasharray="2 3" />
              <polygon points="50,14 81,68 19,68" />
              <polygon points="50,86 19,32 81,32" />
              <circle cx="50" cy="50" r="16" />
            </svg>
            <p className="text-center text-[9px] uppercase tracking-[0.22em]">
              {busy ? "Armonizzazione…" : "Tocca per estrarre"}
            </p>
          </div>
        </div>
      </button>
      <p className="mt-4 text-center text-[11px] text-ink/45">
        {draw ? `Triade allineata · Sigillo ${draw.sigil}` : "Mazzo pronto alla canalizzazione"}
      </p>

      {cards.length > 0 && (
        <section className="mt-12 space-y-5">
          <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-ink/45">
            <span>La disposizione</span>
            <span>{draw?.sigil}</span>
          </div>
          {cards.map((item) => (
            <article key={item.key} className="bg-paper p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-sage">{item.label}</p>
                  <h2 className="font-display text-xl">{item.card.name}</h2>
                </div>
                <span className="font-display italic text-ink/50">{item.card.roman}</span>
              </div>
              <div className="mb-4 aspect-[4/3] bg-mist">
                <ArcanoArt arcano={item.card} />
              </div>
              <p className="text-sm text-ink">{item.card.essence}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink/65">{item.card.upright}</p>
            </article>
          ))}
          <Button variant="ghost" className="w-full" onClick={extract}>
            Estrai nuova triade
          </Button>
        </section>
      )}

      <section className="mt-12 bg-mist p-6">
        <Kicker>Integrazione & analisi</Kicker>
        <h2 className="mt-3 font-display text-2xl leading-snug">
          Comprendere il filo invisibile tra le tre energie
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Sblocca il consulto telefonico dedicato da 30 min (40€) o 1 ora (70€), con report
          WhatsApp PDF personalizzato.
        </p>
        <div className="mt-5 space-y-3">
          {TARIFFE.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center justify-between p-3.5 ${
                tier === t.id ? "bg-ink text-on-ink" : "bg-paper text-ink"
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="tier"
                  className="accent-ink"
                  checked={tier === t.id}
                  onChange={() => setTier(t.id)}
                />
                <span>
                  <span className="block text-[11px] uppercase tracking-wider">
                    {t.minutes} min · {t.name}
                  </span>
                  <span className="block text-[10px] opacity-70">{t.details}</span>
                </span>
              </span>
              <span className="font-display">{t.price}€</span>
            </label>
          ))}
        </div>
        <Button to={`/consulti`} className="mt-5 w-full">
          Prenota approfondimento →
        </Button>
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.14em] text-ink/45">
          Report WhatsApp entro 24h dal consulto
        </p>
      </section>
    </div>
  );
}
