import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "./Button";
import { conPeso } from "./Prosa";
import { Reveal } from "./Reveal";
import { SectionCopy, SectionCopyHead } from "./SectionCopy";

const { home } = siteContent;
const { volumi } = home;

export function HomeVolumes() {
  return (
    <section className="bg-ivory px-6 py-24 md:px-10 md:py-32" aria-labelledby="volumi-titolo">
      <div className="page-shell">
        <Reveal>
          <SectionCopy className="page-prose !mx-0">
            <SectionCopyHead>
              <Kicker>{volumi.kicker}</Kicker>
              <h2
                id="volumi-titolo"
                className="font-display text-3xl font-normal text-ink md:text-4xl"
              >
                {volumi.titolo}
              </h2>
            </SectionCopyHead>
            <p className="section-prose section-prose--lead">{conPeso(volumi.lead)}</p>
          </SectionCopy>
        </Reveal>

        <ol className="edition-leaders mt-12 md:mt-14">
          {volumi.prodotti.map((prodotto, index) => (
            <Reveal key={prodotto.id} delay={index * 80} as="li">
              <div className="edition-leaders__row items-start gap-y-4 py-6 md:gap-x-8">
                <span className="edition-leaders__n">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1 basis-[min(100%,18rem)] sm:basis-auto">
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                    {prodotto.kicker}
                  </p>
                  <h3 className="edition-leaders__title mt-2 block">{prodotto.titolo}</h3>
                  <p className="edition-note__body mt-4">{conPeso(prodotto.testo)}</p>
                  <div className="mt-6">
                    <Button
                      href={prodotto.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="ghost"
                    >
                      {volumi.acquista}
                    </Button>
                  </div>
                </div>
                <div className="w-full max-w-[11rem] shrink-0 border border-ink/15 bg-paper sm:ms-auto">
                  <img
                    src={prodotto.copertina}
                    alt={prodotto.titolo}
                    width={prodotto.larghezza}
                    height={prodotto.altezza}
                    className="block h-auto w-full"
                    draggable={false}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
