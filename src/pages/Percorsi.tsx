import { siteContent } from "../data/siteContent";
import { usePercorsi } from "../context/PercorsiContext";
import { Button, Kicker } from "../components/Button";
import { PageBanner } from "../components/PageBanner";
import { PageFaq } from "../components/PageFaq";
import { Reveal } from "../components/Reveal";
import { SectionCopy, SectionCopyHead } from "../components/SectionCopy";
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
          <SectionCopy>
            <SectionCopyHead>
              <Reveal>
                <Kicker>{percorsi.introKicker}</Kicker>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                  {percorsi.titoloSezione}
                </h2>
              </Reveal>
            </SectionCopyHead>
            <Reveal delay={160}>
              <p className="section-prose section-prose--lead">{conPeso(percorsi.descrizione)}</p>
            </Reveal>
            <Reveal delay={220}>
              <p className="section-prose">{conPeso(percorsi.intro)}</p>
            </Reveal>
            <Reveal delay={250}>
              <p className="section-prose">{conPeso(percorsi.mediazione)}</p>
            </Reveal>
          </SectionCopy>
        </div>
      </StackSheet>

      <StackSheet className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="page-shell">
          <Reveal>
            <SectionCopy className="page-prose !mx-0">
              <SectionCopyHead>
                <Kicker>{percorsi.percorsiKicker}</Kicker>
                <h2 className="font-display text-3xl md:text-4xl">{percorsi.titoloElenco}</h2>
              </SectionCopyHead>
            </SectionCopy>
          </Reveal>
          <ol className="edition-leaders mt-12 md:mt-14">
            {percorsi.tipologie.map((tipo, i) => (
              <Reveal key={tipo.id} delay={i * 90} as="li">
                <div className="edition-leaders__row">
                  <span className="edition-leaders__n">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="edition-leaders__title">{tipo.titolo}</h3>
                  <p className="edition-note__body mt-3 w-full basis-full pl-[2.65rem] sm:pl-0">
                    {conPeso(tipo.testo)}
                  </p>
                  <div className="mt-5 w-full basis-full pl-[2.65rem] sm:pl-0">
                    <Button
                      variant="ghost"
                      className="ti-btn-plain"
                      onClick={() => openPercorso(tipo.id)}
                    >
                      {cta.prenotaPercorso}
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </StackSheet>

      <PageFaq kicker={percorsi.faq.kicker} titolo={percorsi.faq.titolo} voci={percorsi.faq.voci} />

      <StackSheet label={nav.percorsi} className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <blockquote className="edition-note mx-auto max-w-lg border-t border-ink/80 pt-5">
            <p className="font-display text-xl italic leading-relaxed text-ink">«{conPeso(percorsi.citazione)}»</p>
          </blockquote>
        </Reveal>
        <Reveal delay={120}>
          <div className="edition-shell page-prose !mx-auto mt-20 border-t border-ink/80 pt-10 text-center">
            <SectionBrandMark />
            <p className="edition-note__body mx-auto mt-8">{conPeso(brand.deontologia)}</p>
            <p className="edition-note__body mx-auto">{conPeso(percorsi.chiacchierata)}</p>
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
