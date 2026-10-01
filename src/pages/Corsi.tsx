import { Link } from "react-router-dom";
import { CORSI, MATERIALI } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { useAuth } from "../context/AuthContext";

export function Corsi() {
  const { session } = useAuth();

  return (
    <div>
      <PageHero
        kicker="Archivio iniziatico"
        title="Area Corsi"
        lead="Dispense scaricabili e lezioni audio. I file sono aperti: l’Area Riservata conserva anche lo storico dei consulti e i materiali alchemici."
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={session ? { to: "/riservata", label: "Area riservata" } : { to: "/login", label: "Accedi" }}
      />

      <div className="mx-auto max-w-3xl px-6 pb-24 md:px-10 md:pb-32">
        {!session && (
          <p className="mb-16 text-sm text-sage">
            Hai già un accesso?{" "}
            <Link className="underline underline-offset-4" to="/login">
              Entra
            </Link>{" "}
            per vedere prenotazioni e archivio personale.
          </p>
        )}

        <div className="flex flex-col gap-12">
          {CORSI.map((c) => (
            <article key={c.id} className="bg-paper p-8 md:p-10">
              <p className="text-[9px] uppercase tracking-[0.18em] text-sage">{c.kicker}</p>
              <div className="mt-4 flex items-start justify-between gap-4">
                <h2 className="font-display text-xl leading-snug md:text-2xl">{c.title}</h2>
                <span className="shrink-0 bg-mist px-3 py-1.5 text-[10px] uppercase tracking-wider">
                  {c.pages}
                </span>
              </div>
              <p className="mt-5 text-sm leading-[1.75] text-ink/70">{c.blurb}</p>
              {c.kind === "audio" && c.audio && (
                <div className="mt-8 bg-mist p-6">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-sage">
                    Anteprima — Lezione 01 · Il velo di Maya
                  </p>
                  <audio controls className="w-full" src={c.audio} preload="metadata">
                    Il browser non supporta l’audio.
                  </audio>
                </div>
              )}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-[0.14em] text-ink/45">{c.size}</span>
                <Button href={c.file} download={c.filename}>
                  Scarica
                </Button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-24 md:mt-32">
          <Kicker>Materiali alchemici</Kicker>
          <h2 className="mt-4 font-display text-2xl md:text-3xl">Strumenti complementari</h2>
          <div className="mt-10 flex flex-col gap-6">
            {MATERIALI.map((m) => (
              <article key={m.id} className="flex items-center justify-between gap-6 bg-paper p-6 md:p-8">
                <div>
                  <h3 className="font-display text-sm md:text-base">{m.title}</h3>
                  <p className="mt-2 text-[12px] text-ink/55">{m.blurb}</p>
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
    </div>
  );
}
