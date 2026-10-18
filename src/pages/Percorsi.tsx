import { siteContent } from "../data/siteContent";
import { usePercorsi } from "../context/PercorsiContext";
import { Button, Kicker } from "../components/Button";
import { PageBanner } from "../components/PageBanner";
import { Reveal } from "../components/Reveal";

const { brand, cta, nav, pages, percorsi } = siteContent;

export function Percorsi() {
  const { openPercorso } = usePercorsi();

  return (
    <div>
      <PageBanner title={nav.percorsi} className="mb-10 md:mb-14" />

      <section className="px-6 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Kicker>{percorsi.sezione}</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {percorsi.titoloSezione}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-base leading-[1.9] text-ink/75">{percorsi.descrizione}</p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 text-base leading-[1.9] text-ink/70">{percorsi.intro}</p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Kicker>{percorsi.percorsiKicker}</Kicker>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">{pages.percorsi.titolo}</h2>
          </Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
            {percorsi.tipologie.map((tipo, i) => (
              <Reveal key={tipo.id} delay={i * 90}>
                <article className="flex h-full flex-col border border-ink/10 bg-paper px-8 py-10 md:px-9 md:py-12">
                  <p className="text-[0.625rem] uppercase tracking-[0.18em] text-sage">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-5 font-display text-xl leading-snug text-ink md:text-[1.35rem]">
                    {tipo.titolo}
                  </h3>
                  <p className="mt-6 flex-1 text-sm leading-[1.9] text-ink/70">{tipo.testo}</p>
                  <div className="mt-10">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => openPercorso(tipo.id)}
                    >
                      {cta.prenotaPercorso}
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <blockquote className="mx-auto max-w-lg border-l border-sage pl-8">
            <p className="font-display text-xl italic leading-relaxed text-ink">«{percorsi.citazione}»</p>
          </blockquote>
        </Reveal>
        <Reveal delay={120}>
          <div className="mx-auto mt-20 max-w-2xl bg-paper px-8 py-16 text-center md:px-16 md:py-20">
            <Kicker>{brand.name}</Kicker>
            <p className="mt-8 text-sm leading-[1.9] text-ink/70">{brand.deontologia}</p>
            <p className="mt-6 text-sm leading-[1.9] text-ink/65">{percorsi.chiacchierata}</p>
            <div className="mt-10">
              <Button onClick={() => openPercorso()}>{cta.prenotaPercorso}</Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
