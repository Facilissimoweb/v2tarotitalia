import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "./Button";
import { conPeso } from "./Prosa";
import { Reveal } from "./Reveal";
import { SectionCopy } from "./SectionCopy";

const { home } = siteContent;
const { volumi } = home;

export function HomeVolumes() {
  return (
    <section className="bg-ivory px-6 py-24 md:px-10 md:py-32" aria-labelledby="volumi-titolo">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionCopy className="max-w-xl">
            <Kicker>{volumi.kicker}</Kicker>
            <h2
              id="volumi-titolo"
              className="max-w-xl font-display text-3xl font-normal text-ink md:text-4xl"
            >
              {volumi.titolo}
            </h2>
            <p className="section-prose section-prose--lead">{conPeso(volumi.lead)}</p>
          </SectionCopy>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 sm:gap-10 lg:max-w-4xl">
          {volumi.prodotti.map((prodotto, index) => (
            <Reveal key={prodotto.id} delay={index * 80} className="h-full">
              <article className="depth-card flex h-full flex-col">
                <div className="depth-card__well bg-paper">
                  <img
                    src={prodotto.copertina}
                    alt={prodotto.titolo}
                    width={prodotto.larghezza}
                    height={prodotto.altezza}
                    className="depth-card__art block h-auto w-full"
                    draggable={false}
                  />
                </div>
                <div className="flex flex-1 flex-col p-8 md:p-10">
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{prodotto.kicker}</p>
                  <h3 className="mt-4 font-display text-2xl font-normal leading-snug text-ink">{prodotto.titolo}</h3>
                  <p className="mt-5 flex-1 text-sm leading-[1.8] text-ink/70">{conPeso(prodotto.testo)}</p>
                  <div className="mt-8">
                    <Button
                      href={prodotto.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      {volumi.acquista}
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
