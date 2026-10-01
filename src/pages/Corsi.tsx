import { Link } from "react-router-dom";
import { CORSI, MATERIALI } from "../data/catalogo";
import { Button, Kicker } from "../components/Button";
import { useAuth } from "../context/AuthContext";

export function Corsi() {
  const { session } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Kicker>Archivio iniziatico</Kicker>
      <h1 className="mt-3 font-display text-4xl font-light">Area Corsi</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink/70">
        Dispense scaricabili e lezioni audio. I file sono aperti: l’Area Riservata
        conserva anche lo storico dei consulti e i materiali alchemici.
      </p>
      {!session && (
        <p className="mt-4 text-xs text-sage">
          Hai già un accesso?{" "}
          <Link className="underline underline-offset-4" to="/login">
            Entra
          </Link>{" "}
          per
          vedere prenotazioni e archivio personale.
        </p>
      )}

      <div className="mt-12 flex flex-col gap-6">
        {CORSI.map((c) => (
          <article key={c.id} className="bg-paper p-6">
            <p className="text-[9px] uppercase tracking-[0.18em] text-sage">{c.kicker}</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <h2 className="font-display text-xl leading-snug">{c.title}</h2>
              <span className="shrink-0 bg-mist px-2 py-1 text-[10px] uppercase tracking-wider">
                {c.pages}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{c.blurb}</p>
            {c.kind === "audio" && c.audio && (
              <div className="mt-5 bg-mist p-3">
                <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-sage">
                  Anteprima — Lezione 01 · Il velo di Maya
                </p>
                <audio controls className="w-full" src={c.audio} preload="metadata">
                  Il browser non supporta l’audio.
                </audio>
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.14em] text-ink/45">{c.size}</span>
              <Button href={c.file} download={c.filename}>
                Scarica
              </Button>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-14">
        <Kicker>Materiali alchemici</Kicker>
        <h2 className="mt-2 font-display text-2xl">Strumenti complementari</h2>
        <div className="mt-6 flex flex-col gap-3">
          {MATERIALI.map((m) => (
            <article key={m.id} className="flex items-center justify-between gap-4 bg-paper p-4">
              <div>
                <h3 className="font-display text-sm">{m.title}</h3>
                <p className="text-[11px] text-ink/55">{m.blurb}</p>
              </div>
              <a
                href={m.file}
                download={m.filename}
                className="text-[10px] uppercase tracking-[0.16em] text-sage hover:text-ink"
              >
                Scarica
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
