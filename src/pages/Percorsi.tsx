import { siteContent } from "../data/siteContent";
import { usePercorsi } from "../context/PercorsiContext";
import { Button, Kicker } from "../components/Button";
import { PageBanner } from "../components/PageBanner";
import { PageFaq } from "../components/PageFaq";
import { Reveal } from "../components/Reveal";
import { StackDeck, StackSheet } from "../components/StackSheet";
import { conPeso } from "../components/Prosa";
import { SectionBrandMark } from "../components/WidgetFrame";

const { brand, chiSono, cta, nav, pages, percorsi } = siteContent;

export function Percorsi() {
  const { openPercorso } = usePercorsi();

  return (
    <div>
      <PageBanner
        title={nav.percorsi}
        subtitle={pages.percorsi.titolo}
        background={percorsi.immagini.hero}
        className="mb-6 md:mb-8"
      />

      <StackDeck>
      <StackSheet className="bg-ivory px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Kicker>{percorsi.introKicker}</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {percorsi.titoloSezione}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-8 text-base leading-[1.9] text-ink/75">{conPeso(percorsi.descrizione)}</p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-6 text-base leading-[1.9] text-ink/70">{conPeso(percorsi.intro)}</p>
          </Reveal>
          <Reveal delay={250}>
            <p className="mt-6 text-base leading-[1.9] text-ink/75">{conPeso(percorsi.mediazione)}</p>
          </Reveal>
        </div>
      </StackSheet>

      <StackSheet className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Kicker>{percorsi.percorsiKicker}</Kicker>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">{percorsi.titoloElenco}</h2>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 items-stretch gap-10 lg:grid-cols-3 lg:gap-12">
            {percorsi.tipologie.map((tipo, i) => (
              <Reveal key={tipo.id} delay={i * 90} className="h-full min-w-0 lg:row-span-4 lg:grid lg:grid-rows-subgrid">
                <article className="depth-panel flex h-full min-w-0 flex-col bg-paper p-10 lg:row-span-4 lg:grid lg:w-full lg:grid-rows-subgrid lg:p-12">
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-5 min-h-[2lh] font-display text-xl leading-snug text-ink lg:min-h-0 lg:text-[1.35rem]">
                    {tipo.titolo}
                  </h3>
                  <p className="mt-6 min-h-[7lh] flex-1 text-sm leading-[1.9] text-ink/70 lg:min-h-0">{conPeso(tipo.testo)}</p>
                  <div className="mt-10">
                    <Button
                      variant="ghost"
                      className="ti-btn-plain w-full"
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
      </StackSheet>

      <PageFaq kicker={percorsi.faq.kicker} titolo={percorsi.faq.titolo} voci={percorsi.faq.voci} />

      <StackSheet label={nav.percorsi} className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <blockquote className="mx-auto max-w-lg border-l-2 border-ember pl-8">
            <p className="font-display text-xl italic leading-relaxed text-ink">«{conPeso(percorsi.citazione)}»</p>
          </blockquote>
        </Reveal>
        <Reveal delay={120}>
          <div className="depth-panel mx-auto mt-20 max-w-2xl bg-paper px-8 py-16 text-center md:px-16 md:py-20">
            <SectionBrandMark />
            <p className="mt-8 text-sm leading-[1.9] text-ink/70">{conPeso(brand.deontologia)}</p>
            <p className="mt-6 text-sm leading-[1.9] text-ink/65">{conPeso(percorsi.chiacchierata)}</p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Button className="ti-btn-plain" onClick={() => openPercorso()}>{cta.prenotaPercorso}</Button>
              <Button to="/consulti" variant="ghost" className="ti-btn-plain">
                {chiSono.ctaConsulti}
              </Button>
            </div>
          </div>
        </Reveal>
      </StackSheet>
      </StackDeck>
    </div>
  );
}
