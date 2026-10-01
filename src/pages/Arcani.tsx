import { Link, useParams, Navigate } from "react-router-dom";
import { ARCANI, getArcanoBySlug } from "../data/arcani";
import { siteContent } from "../data/siteContent";
import { ArcanoArt } from "../components/ArcanoArt";
import { Button } from "../components/Button";
import { PageHero } from "../components/PageHero";

export function Arcani() {
  return (
    <div>
      <PageHero
        kicker="I ventidue passaggi"
        title="Gli Arcani Maggiori"
        lead="Galleria completa del mazzo marsigliese. Ogni scheda apre essenza, dritto e rovescio — per studio, non per oracolo automatico."
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ to: "/estrazione", label: "Pesca 3 carte" }}
      />
      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-10 md:pb-32">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:grid-cols-4">
          {ARCANI.map((a, i) => (
            <Link
              key={a.slug}
              to={`/arcani/${a.slug}`}
              className={`bg-paper p-5 transition-colors hover:bg-mist ${i % 2 === 1 ? "sm:mt-8" : ""}`}
            >
              <div className="aspect-[2/3] bg-mist">
                <ArcanoArt arcano={a} />
              </div>
              <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-sage">{a.roman}</p>
              <p className="mt-1 font-display text-base text-ink">{a.name}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-ink/50">{a.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArcanoDetail() {
  const { slug } = useParams();
  const arcano = slug ? getArcanoBySlug(slug) : undefined;
  if (!arcano) return <Navigate to="/arcani" replace />;

  const idx = ARCANI.findIndex((a) => a.slug === arcano.slug);
  const prev = ARCANI[(idx + ARCANI.length - 1) % ARCANI.length];
  const next = ARCANI[(idx + 1) % ARCANI.length];

  return (
    <div>
      <PageHero
        kicker={`Arcano ${arcano.roman} · ${arcano.french}`}
        title={arcano.name}
        lead={
          <>
            <span className="mb-4 block font-display text-lg italic text-sage">{arcano.subtitle}</span>
            {arcano.essence}
          </>
        }
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ to: "/arcani", label: "Tutti i 22 Arcani" }}
      />
      <div className="mx-auto grid max-w-5xl gap-14 px-6 pb-24 md:grid-cols-[minmax(0,280px)_1fr] md:px-10 md:pb-32">
        <div className="bg-paper p-6">
          <ArcanoArt arcano={arcano} />
        </div>
        <div>
          <div className="grid gap-8 md:grid-cols-2">
            <article className="bg-mist p-8">
              <p className="text-[10px] uppercase tracking-[0.18em] text-sage">Dritto</p>
              <p className="mt-5 text-sm leading-[1.75] text-ink/80">{arcano.upright}</p>
            </article>
            <article className="bg-mist p-8">
              <p className="text-[10px] uppercase tracking-[0.18em] text-sage">Rovescio</p>
              <p className="mt-5 text-sm leading-[1.75] text-ink/80">{arcano.reversed}</p>
            </article>
          </div>

          <ul className="mt-12 flex flex-wrap gap-3">
            {arcano.keywords.map((k) => (
              <li
                key={k}
                className="bg-paper px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-ink"
              >
                {k}
              </li>
            ))}
          </ul>

          <div className="mt-14 flex flex-wrap gap-4">
            <Button to={`/arcani/${prev.slug}`} variant="ghost">
              ← {prev.name}
            </Button>
            <Button to={`/arcani/${next.slug}`} variant="ghost">
              {next.name} →
            </Button>
          </div>
          <div className="mt-8">
            <Link to="/arcani" className="text-[11px] uppercase tracking-[0.16em] text-sage">
              Torna alla griglia
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
