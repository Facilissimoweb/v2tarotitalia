import { Link } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { useLocalizedCatalog } from "../lib/useLocalizedCatalog";
import { Button, Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { useAuth } from "../context/AuthContext";

export function Corsi() {
  const { session } = useAuth();
  const { corsi, materiali, busy, localized, error, download } = useLocalizedCatalog();
  const { lingua } = siteContent;

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
          <Reveal>
            <p className="mb-16 text-sm text-sage">
              Hai già un accesso?{" "}
              <Link className="underline underline-offset-4" to="/login">
                Entra
              </Link>{" "}
              per vedere prenotazioni e archivio personale.
            </p>
          </Reveal>
        )}

        {error ? <p className="mb-10 text-sm text-ink">{error}</p> : null}

        <div className="flex flex-col gap-12">
          {corsi.map((c, i) => (
            <Reveal key={c.id} delay={i * 100}>
            <article className="bg-paper p-8 md:p-10" translate={localized ? "no" : undefined}>
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
                <Button
                  onClick={() => {
                    void download(c.file, c.filename, c.title);
                  }}
                >
                  {busy ? lingua.genera : "Scarica"}
                </Button>
              </div>
            </article>
            </Reveal>
          ))}
        </div>

        <section className="mt-24 md:mt-32">
          <Reveal>
            <Kicker>Materiali alchemici</Kicker>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-4 font-display text-2xl md:text-3xl">Strumenti complementari</h2>
          </Reveal>
          <div className="mt-10 flex flex-col gap-6">
            {materiali.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
              <article className="flex items-center justify-between gap-6 bg-paper p-6 md:p-8" translate={localized ? "no" : undefined}>
                <div>
                  <h3 className="font-display text-sm md:text-base">{m.title}</h3>
                  <p className="mt-2 text-[12px] text-ink/55">{m.blurb}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void download(m.file, m.filename, m.title);
                  }}
                  className="text-[10px] uppercase tracking-[0.16em] text-sage hover:text-ink"
                >
                  {busy ? lingua.genera : "Scarica"}
                </button>
              </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
