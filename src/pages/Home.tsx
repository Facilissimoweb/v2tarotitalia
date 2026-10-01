import { Link } from "react-router-dom";
import { ARCANI } from "../data/arcani";
import { TARIFFE, STUDIO } from "../data/catalogo";
import { ArcanoArt } from "../components/ArcanoArt";
import { Button, Kicker } from "../components/Button";

export function Home() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-10 md:pt-16">
        <div className="mb-5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-ink" />
          <Kicker>Vol. IV — Radici & Simboli</Kicker>
        </div>
        <h1 className="font-display text-4xl font-light leading-[1.12] tracking-tight text-ink sm:text-5xl md:text-6xl">
          La Geometria
          <br />
          <span className="italic">dell’Invisibile</span>
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/70">
          Santuario olistico a {STUDIO.city}. Decodifichiamo i moti interiori attraverso
          la lente archetipica del mazzo marsigliese. Senza fatalismi: solo evoluzione
          della coscienza.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to="/consulti" className="w-full sm:w-auto">
            Prenota un consulto
            <span aria-hidden>→</span>
          </Button>
          <Button to="/estrazione" variant="paper" className="w-full justify-between sm:w-auto sm:min-w-64">
            <span>Pesca 3 carte online</span>
            <span className="text-[10px] tracking-[0.18em] text-sage">Gratis</span>
          </Button>
        </div>
        <div className="mt-12 flex justify-between text-[9px] uppercase tracking-[0.2em] text-ink/40">
          <span>{STUDIO.coords}</span>
          <span>{STUDIO.region}</span>
        </div>
      </section>

      <section className="bg-mist px-6 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <div>
            <Kicker>Genius Loci</Kicker>
            <h2 className="mt-3 font-display text-3xl font-normal leading-snug text-ink">
              Nel cuore silente
              <br />
              delle Marche.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink/75">
              Tarot Italia nasce tra i colli marchigiani. Rifiutiamo la cartomanzia
              predittiva d’ansia: il consulto è un{" "}
              <strong className="font-medium text-ink">atto dialogico e fenomenologico</strong>,
              dove ogni arcano agisce da specchio e mappa delle decisioni.
            </p>
            <div className="mt-6 bg-paper p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
                Patto etico trasparente
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink/65">
                Nessun consulto su salute o eventi fatali. L’essere umano resta sempre
                l’unico scultore del proprio destino.
              </p>
            </div>
          </div>
          <StudioPanel />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Kicker>Trasparenza</Kicker>
            <h2 className="mt-2 font-display text-3xl">Tariffe sessioni</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {TARIFFE.map((t) => (
            <article
              key={t.id}
              className={t.id === "deep" ? "bg-ink p-6 text-on-ink" : "bg-paper p-6"}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-[9px] uppercase tracking-[0.2em] ${t.id === "deep" ? "text-on-ink/55" : "text-sage"}`}>
                    {t.kicker}
                  </p>
                  <h3 className="mt-1 font-display text-xl">{t.name}</h3>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-light">{t.price}€</p>
                  <p className={`text-[9px] uppercase tracking-[0.16em] ${t.id === "deep" ? "text-on-ink/55" : "text-sage"}`}>
                    {t.minutes} minuti
                  </p>
                </div>
              </div>
              <p className={`mt-4 text-xs leading-relaxed ${t.id === "deep" ? "text-on-ink/75" : "text-ink/65"}`}>
                {t.summary}
              </p>
              <p className={`mt-6 text-[10px] uppercase tracking-[0.16em] ${t.id === "deep" ? "text-on-ink/70" : "text-ink"}`}>
                In studio o chiamata vocale WhatsApp
              </p>
            </article>
          ))}
        </div>
        <div className="mt-6">
          <Button to="/consulti" variant="ghost">
            Prenota dalla pagina consulti →
          </Button>
        </div>
      </section>

      <section className="bg-mist px-8 py-16 text-center">
        <blockquote className="mx-auto max-w-lg font-display text-xl italic leading-relaxed text-ink md:text-2xl">
          «Ciò che è in basso è come ciò che è in alto, e ciò che è in alto è come
          ciò che è in basso, per compiere le meraviglie dell’uno.»
        </blockquote>
        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-ink">Ermete Trismegisto</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-sage">Tavola di Smeraldo</p>
      </section>

      <section className="py-16">
        <div className="mx-auto mb-6 flex max-w-6xl items-end justify-between px-6">
          <div>
            <Kicker>Antologia visiva</Kicker>
            <h2 className="mt-2 font-display text-3xl">Gli archetipi primari</h2>
          </div>
          <Link to="/arcani" className="text-[10px] uppercase tracking-[0.18em] text-ink hover:text-sage">
            Tutti i 22 →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-2">
          {ARCANI.slice(0, 6).map((a) => (
            <Link
              key={a.slug}
              to={`/arcani/${a.slug}`}
              className="w-44 shrink-0 bg-paper p-3 transition-colors hover:bg-mist"
            >
              <div className="aspect-[2/3] bg-mist">
                <ArcanoArt arcano={a} />
              </div>
              <p className="mt-3 font-display text-sm text-ink">{a.name}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-sage">{a.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-paper px-6 py-14">
        <div className="mx-auto max-w-3xl bg-mist p-6 md:p-8">
          <Kicker>Pubblicazioni del Santuario</Kicker>
          <h3 className="mt-3 font-display text-2xl">I 22 Passaggi dell’Eroe</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Dispensa didattica: simboli, schemi di tiraggio e corrispondenze. Scaricala
            dall’area corsi — l’archivio completo è in Area Riservata.
          </p>
          <div className="mt-6">
            <Button to="/corsi">Vai ai corsi e alle dispense</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StudioPanel() {
  return (
    <div className="relative aspect-square overflow-hidden bg-ink">
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
        <rect width="400" height="400" fill="#2B2523" />
        <rect x="70" y="40" width="180" height="240" fill="none" stroke="#7A8B78" strokeWidth="1.2" />
        <rect x="90" y="60" width="140" height="180" fill="#F9F8F6" opacity="0.08" />
        <path d="M70 160 Q160 120 250 160" fill="none" stroke="#7A8B78" strokeWidth="0.8" />
        <rect x="200" y="250" width="140" height="10" fill="#7A8B78" opacity="0.7" />
        <rect x="230" y="220" width="70" height="30" fill="none" stroke="#F9F8F6" strokeWidth="0.8" />
        <circle cx="300" cy="200" r="8" fill="none" stroke="#F9F8F6" strokeWidth="0.6" />
      </svg>
      <div className="absolute bottom-0 left-0 bg-ink/80 px-3 py-2">
        <p className="text-[9px] uppercase tracking-[0.18em] text-on-ink">
          Studio privato — Borgo {STUDIO.city}
        </p>
      </div>
    </div>
  );
}
