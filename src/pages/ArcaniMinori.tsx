import { Link, useParams } from "react-router-dom";
import {
  ARCANI_MINORI,
  RANK_MARK,
  SEMI_MINORI,
  getArcanoMinoreBySlug,
  getSemeMinore,
  lameDelSeme,
} from "../data/arcaniMinori";
import { siteContent } from "../data/siteContent";
import { ArcanoMinoreArt } from "../components/ArcanoMinoreArt";
import { Button } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { NonTrovata } from "./NonTrovata";

const { comingSoon, nav, pages } = siteContent;

export function ArcaniMinori() {
  return (
    <div>
      <PageHero
        kicker={pages.arcaniMinori.kicker}
        title={pages.arcaniMinori.titolo}
        lead={pages.arcaniMinori.lead}
        cta={{ to: "/arcani", label: nav.arcaniMaggiori }}
        secondary={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
      />
      <div className="mx-auto max-w-6xl space-y-24 px-6 pb-24 md:space-y-32 md:px-10 md:pb-32">
        {SEMI_MINORI.map((seme) => {
          const lame = lameDelSeme(seme.id);
          return (
            <section key={seme.id} id={seme.id}>
              <Reveal>
                <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                  {seme.elemento} · {seme.francese}
                </p>
                <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{seme.nome}</h2>
                <p className="mt-2 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                  {seme.sottotitolo}
                </p>
                <p className="mt-5 max-w-2xl text-sm leading-[1.9] text-ink/75">{seme.essenza}</p>
              </Reveal>

              {lame.length > 0 ? (
                <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:grid-cols-4">
                  {lame.map((card, i) => (
                    <Reveal key={card.slug} delay={(i % 4) * 80} className={i % 2 === 1 ? "sm:mt-8" : ""}>
                      <Link
                        to={`/arcani-minori/${card.slug}`}
                        className="block bg-paper p-5 transition-colors hover:bg-mist"
                      >
                        <div className="aspect-[2/3] bg-mist">
                          <ArcanoMinoreArt arcano={card} />
                        </div>
                        <p className="mt-5 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                          {RANK_MARK[card.grado]}
                        </p>
                        <p className="mt-1 font-display text-base text-ink">{card.nome}</p>
                        <p className="mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                          {card.subtitle}
                        </p>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              ) : (
                <Reveal>
                  <div className="mt-10 bg-mist px-8 py-16 text-center md:px-16">
                    <p className="font-display text-xl italic leading-relaxed text-ink">{comingSoon}</p>
                  </div>
                </Reveal>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ArcanoMinoreDetail() {
  const { slug } = useParams();
  const arcano = slug ? getArcanoMinoreBySlug(slug) : undefined;
  if (!arcano) return <NonTrovata />;

  const seme = getSemeMinore(arcano.seme);
  const idx = ARCANI_MINORI.findIndex((card) => card.slug === arcano.slug);
  const prev = ARCANI_MINORI[(idx + ARCANI_MINORI.length - 1) % ARCANI_MINORI.length];
  const next = ARCANI_MINORI[(idx + 1) % ARCANI_MINORI.length];

  return (
    <div>
      <PageHero
        kicker={`${seme?.nome ?? ""} · ${arcano.francese}`}
        title={arcano.nome}
        lead={arcano.subtitle}
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ to: "/arcani-minori", label: nav.arcaniMinori }}
      />
      <div className="mx-auto grid max-w-5xl gap-14 px-6 pb-24 md:grid-cols-[minmax(0,280px)_1fr] md:px-10 md:pb-32">
        <Reveal>
          <div className="bg-paper p-6">
            <ArcanoMinoreArt arcano={arcano} />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="mb-10 font-display text-lg leading-relaxed text-ink/80">{arcano.essence}</p>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2">
            <Reveal>
              <article className="bg-mist p-8">
                <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">Dritto</p>
                <p className="mt-5 text-sm leading-[1.75] text-ink/80">{arcano.upright}</p>
              </article>
            </Reveal>
            <Reveal delay={100}>
              <article className="bg-mist p-8">
                <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">Rovescio</p>
                <p className="mt-5 text-sm leading-[1.75] text-ink/80">{arcano.reversed}</p>
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
              <Button to={`/arcani-minori/${prev.slug}`} variant="ghost">
                ← {prev.nome}
              </Button>
              <Button to={`/arcani-minori/${next.slug}`} variant="ghost">
                {next.nome} →
              </Button>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-8">
              <Link
                to="/arcani-minori"
                className="text-[0.6875rem] uppercase tracking-[0.16em] text-ember-soft"
              >
                Torna alla griglia
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
