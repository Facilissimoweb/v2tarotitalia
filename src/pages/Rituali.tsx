import { siteContent } from "../data/siteContent";
import { useRitualistica } from "../context/RitualisticaContext";
import { Button, Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const { brand, cta, collaboratori, pages, ritualistica } = siteContent;
const { maura } = collaboratori;

export function Rituali() {
  const { openRitualistica } = useRitualistica();

  return (
    <div>
      <PageHero
        kicker={pages.rituali.kicker}
        title={pages.rituali.titolo}
        lead={ritualistica.intro}
        cta={{ label: cta.ritualistica, onClick: () => openRitualistica(), variant: "sage" }}
        media={{
          src: maura.immagine.src,
          type: "image",
          alt: maura.immagine.alt,
        }}
      />

      <section className="px-6 pb-20 md:px-10 md:pb-28">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Kicker>{maura.sezione}</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {maura.nome}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-base leading-[1.9] text-ink/75">{ritualistica.mediazione}</p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 text-base leading-[1.9] text-ink/70">{maura.descrizione}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker>{maura.ritualiKicker}</Kicker>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">{pages.rituali.kicker}</h2>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {ritualistica.tipologie.map((tipo, i) => (
              <Reveal key={tipo.id} delay={i * 80}>
                <article className="flex h-full flex-col bg-paper p-8 md:p-10">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-sage">
                    {maura.ritualiKicker}
                  </p>
                  <h3 className="mt-4 font-display text-xl leading-snug text-ink">{tipo.titolo}</h3>
                  <p className="mt-6 flex-1 text-sm leading-[1.85] text-ink/70">{tipo.testo}</p>
                  <div className="mt-10">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => openRitualistica(tipo.id)}
                    >
                      {cta.prenotaRitualistica}
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <blockquote className="mx-auto max-w-lg border-l border-sage pl-8">
            <p className="font-display text-xl italic leading-relaxed text-ink">«{maura.citazione}»</p>
          </blockquote>
        </Reveal>
        <Reveal delay={120}>
          <div className="mx-auto mt-20 max-w-2xl bg-paper px-8 py-16 text-center md:px-16 md:py-20">
            <Kicker>{brand.name}</Kicker>
            <p className="mt-8 text-sm leading-[1.9] text-ink/70">{brand.deontologia}</p>
            <p className="mt-6 text-sm leading-[1.9] text-ink/65">{ritualistica.chiacchierata}</p>
            <div className="mt-10">
              <Button onClick={() => openRitualistica()}>{cta.prenotaRitualistica}</Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
