import { useEffect, useState } from "react";
import { ARCANI } from "../data/arcani";
import { getCombinazione } from "../data/combinazioni";
import { siteContent } from "../data/siteContent";

type Props = {
  slug: string;
};

const copy = siteContent.pages.arcani;

export function ArcanoAbbinamenti({ slug }: Props) {
  const [partner, setPartner] = useState<string | null>(null);

  useEffect(() => {
    setPartner(null);
  }, [slug]);

  const combo = partner ? getCombinazione(slug, partner) : undefined;
  const partnerCard = partner ? ARCANI.find((item) => item.slug === partner) : undefined;

  return (
    <section className="mt-16 border-t border-ink/10 pt-14">
      <h2 className="font-display text-2xl text-ink md:text-3xl">{copy.abbinamenti}</h2>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {ARCANI.filter((item) => item.slug !== slug).map((item) => {
          const active = item.slug === partner;
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={active}
              onClick={() => setPartner(item.slug)}
              className={
                active
                  ? "bg-[#d7f713] px-4 py-4 text-left text-black"
                  : "bg-paper px-4 py-4 text-left text-ink transition-colors hover:bg-mist"
              }
            >
              <span
                className={`block text-[0.625rem] uppercase tracking-[0.16em] ${
                  active ? "text-black/55" : "text-ember-soft"
                }`}
              >
                {item.roman}
              </span>
              <span className="mt-1 block font-display text-sm">{item.name}</span>
            </button>
          );
        })}
      </div>

      {partnerCard ? (
        <article className="mt-8 bg-mist p-8">
          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
            {partnerCard.roman} · {partnerCard.name}
          </p>
          {combo ? (
            <>
              <p className="mt-5 font-display text-lg text-ink">{combo.titolo}</p>
              <p className="mt-4 text-sm leading-[1.75] text-ink/80">{combo.sintesi}</p>
            </>
          ) : (
            <p className="mt-5 font-display text-lg italic leading-relaxed text-ink">
              {copy.abbinamentoInStudio}
            </p>
          )}
        </article>
      ) : null}
    </section>
  );
}
