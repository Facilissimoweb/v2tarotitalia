import { Link, useParams, Navigate } from "react-router-dom";
import { ARCANI, getArcanoBySlug } from "../data/arcani";
import { ArcanoArt } from "../components/ArcanoArt";
import { Button, Kicker } from "../components/Button";

export function Arcani() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Kicker>I ventidue passaggi</Kicker>
      <h1 className="mt-3 font-display text-4xl font-light leading-tight md:text-5xl">
        Gli Arcani Maggiori
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
        Galleria completa del mazzo marsigliese. Ogni scheda apre essenza, dritto e
        rovescio — per studio, non per oracolo automatico.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ARCANI.map((a, i) => (
          <Link
            key={a.slug}
            to={`/arcani/${a.slug}`}
            className={`bg-paper p-3 transition-colors hover:bg-mist ${i % 2 === 1 ? "sm:mt-6" : ""}`}
          >
            <div className="aspect-[2/3] bg-mist">
              <ArcanoArt arcano={a} />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-sage">{a.roman}</p>
            <p className="font-display text-base text-ink">{a.name}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink/50">{a.subtitle}</p>
          </Link>
        ))}
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
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 md:grid-cols-[minmax(0,280px)_1fr]">
      <div className="bg-paper p-4">
        <ArcanoArt arcano={arcano} />
      </div>
      <div>
        <Kicker>
          Arcano {arcano.roman} · {arcano.french}
        </Kicker>
        <h1 className="mt-3 font-display text-4xl font-light">{arcano.name}</h1>
        <p className="mt-2 font-display text-lg italic text-sage">{arcano.subtitle}</p>
        <p className="mt-6 text-sm leading-relaxed text-ink/80">{arcano.essence}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="bg-mist p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sage">Dritto</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{arcano.upright}</p>
          </article>
          <article className="bg-mist p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-sage">Rovescio</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">{arcano.reversed}</p>
          </article>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2">
          {arcano.keywords.map((k) => (
            <li key={k} className="bg-paper px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ink">
              {k}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button to={`/arcani/${prev.slug}`} variant="ghost">
            ← {prev.name}
          </Button>
          <Button to={`/arcani/${next.slug}`} variant="ghost">
            {next.name} →
          </Button>
        </div>
        <div className="mt-4">
          <Link to="/arcani" className="text-[11px] uppercase tracking-[0.16em] text-sage">
            Torna alla griglia
          </Link>
        </div>
      </div>
    </div>
  );
}
