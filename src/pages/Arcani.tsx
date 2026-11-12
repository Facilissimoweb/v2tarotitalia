import { Link, useParams } from "react-router-dom";
import { ARCANI, getArcanoBySlug } from "../data/arcani";
import { siteContent } from "../data/siteContent";
import { ArcanoAbbinamenti } from "../components/ArcanoAbbinamenti";
import { ArcanoArt } from "../components/ArcanoArt";
import { Button } from "../components/Button";
import { apertura, conPeso } from "../components/Prosa";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { StackSheet } from "../components/StackSheet";
import { NonTrovata } from "./NonTrovata";

export function Arcani() {
  return (
    <div>
      <PageHero
        kicker={siteContent.pages.arcani.kicker}
        title={siteContent.pages.arcani.titolo}
        lead={siteContent.pages.arcani.lead}
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ to: "/arcani-minori", label: siteContent.nav.arcaniMinori }}
      />
      <StackSheet label={siteContent.pages.arcani.titolo} className="bg-ivory">
      <div className="page-shell px-6 pb-24 md:px-10 md:pb-32">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:grid-cols-4">
          {ARCANI.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 4) * 80} className={i % 2 === 1 ? "sm:mt-8" : ""}>
              <Link
                to={`/arcani/${a.slug}`}
                className="depth-card block p-5"
              >
                <div className="depth-card__well aspect-[2/3] bg-mist">
                  <ArcanoArt arcano={a} className="depth-card__art" />
                </div>
                <p className="mt-5 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{a.roman}</p>
                <p className="mt-1 font-display text-base text-ink">{a.name}</p>
                <p className="mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{a.subtitle}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
      </StackSheet>
    </div>
  );
}

export function ArcanoDetail() {
  const { slug } = useParams();
  const arcano = slug ? getArcanoBySlug(slug) : undefined;
  if (!arcano) return <NonTrovata />;

  const idx = ARCANI.findIndex((a) => a.slug === arcano.slug);
  const prev = ARCANI[(idx + ARCANI.length - 1) % ARCANI.length];
  const next = ARCANI[(idx + 1) % ARCANI.length];

  return (
    <div>
      <PageHero
        kicker={`Arcano ${arcano.roman} · ${arcano.french}`}
        title={arcano.name}
        lead={arcano.subtitle}
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ to: "/arcani", label: siteContent.pages.arcani.tutti }}
      />
      <StackSheet label={arcano.name} className="bg-ivory">
      <div className="mx-auto grid max-w-5xl gap-14 px-6 pb-4 md:grid-cols-[minmax(0,280px)_1fr] md:px-10 md:pb-8">
        <Reveal>
          <div className="depth-frame depth-frame--cast">
            <div className="depth-frame__plate bg-paper p-6">
              <ArcanoArt arcano={arcano} />
            </div>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="mb-10 font-display text-lg leading-relaxed text-ink/80">{conPeso(arcano.essence)}</p>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2">
            <Reveal>
              <article className="depth-panel bg-mist p-8">
                <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">Dritto</p>
                <p className="mt-5 text-sm leading-[1.75] text-ink/80">{apertura(arcano.upright)}</p>
              </article>
            </Reveal>
            <Reveal delay={100}>
              <article className="depth-panel bg-mist p-8">
                <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">Rovescio</p>
                <p className="mt-5 text-sm leading-[1.75] text-ink/80">{apertura(arcano.reversed)}</p>
              </article>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <ul className="mt-12 flex flex-wrap gap-3">
              {arcano.keywords.map((k) => (
                <li
                  key={k}
                  className="bg-paper px-4 py-2 text-[0.625rem] uppercase tracking-[0.16em] text-ink"
                >
                  {k}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-14 flex flex-wrap gap-4">
              <Button to={`/arcani/${prev.slug}`} variant="ghost">
                ← {prev.name}
              </Button>
              <Button to={`/arcani/${next.slug}`} variant="ghost">
                {next.name} →
              </Button>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-8">
              <Link to="/arcani" className="text-[0.6875rem] uppercase tracking-[0.16em] text-ember-soft">
                Torna alla griglia
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
      </StackSheet>
      <StackSheet className="bg-mist">
      <div className="mx-auto max-w-5xl px-6 pb-24 md:px-10 md:pb-32">
        <ArcanoAbbinamenti slug={arcano.slug} />
      </div>
      </StackSheet>
    </div>
  );
}
