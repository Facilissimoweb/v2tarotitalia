import { useState } from "react";
import { siteContent } from "../data/siteContent";
import { FormazioneOlisticaModal } from "../components/FormazioneOlistica";
import { PageBanner } from "../components/PageBanner";
import { ImageSlot } from "../components/ImageSlot";
import { Button, Kicker } from "../components/Button";
import { conPeso } from "../components/Prosa";
import { SectionBrandMark } from "../components/WidgetFrame";
import { Reveal } from "../components/Reveal";
import { SectionCopy, SectionCopyHead } from "../components/SectionCopy";
import { SectionRails } from "../components/SectionRails";
import { StackDeck, StackSheet } from "../components/StackSheet";

const { brand, chiSono, cta, nav } = siteContent;

export function ChiSono() {
  const [formazioneOpen, setFormazioneOpen] = useState(false);

  return (
    <div>
      <PageBanner
        title={chiSono.titolo}
        subtitle={chiSono.sottotitolo}
        background={chiSono.immagini.hero}
        className="mb-6 md:mb-8"
      />

      <StackDeck>
      <StackSheet className="bg-ivory px-6 pb-24 md:px-10 md:pb-32">
        <SectionRails className="page-shell items-start">
          <ImageSlot
            src={chiSono.immagini.teresa.src}
            alt={chiSono.immagini.teresa.alt}
            caption={chiSono.immagini.teresa.caption}
            ratio="landscape"
            fit="cover"
          />
          <div className="md:pt-6">
            <SectionCopy>
              <SectionCopyHead>
                <Reveal>
                  <Kicker>{chiSono.visione.kicker}</Kicker>
                </Reveal>
                <Reveal delay={100}>
                  <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                    {chiSono.visione.titolo}
                  </h2>
                </Reveal>
              </SectionCopyHead>
              <Reveal delay={200}>
                <p className="section-prose section-prose--lead">
                  {conPeso(chiSono.visione.testo)}
                </p>
              </Reveal>
            </SectionCopy>
            <Reveal delay={280}>
              <div className="edition-note mt-12 border-t border-ink/80 pt-6">
                <SectionBrandMark align="start" />
                <p className="edition-note__body mt-4">
                  {conPeso(`${brand.titolare} · ${brand.ruolo}`)}
                </p>
                <p className="edition-note__body">
                  {conPeso("Ricevo su appuntamento in Via Crispi 37, a Macerata, e online tramite chiamata vocale WhatsApp.")}
                </p>
                <p className="edition-note__sign">{brand.piva}</p>
              </div>
            </Reveal>
          </div>
        </SectionRails>
      </StackSheet>

      <StackSheet className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="page-shell">
          <SectionRails className="items-start">
            <SectionCopy>
              <SectionCopyHead>
                <Reveal>
                  <Kicker>{chiSono.metodo.kicker}</Kicker>
                </Reveal>
                <Reveal delay={100}>
                  <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                    {chiSono.metodo.titolo}
                  </h2>
                  <p className="section-prose section-prose--lead mt-4">
                    {conPeso(chiSono.metodo.sottotitolo)}
                  </p>
                </Reveal>
              </SectionCopyHead>
              <Reveal delay={200}>
                <p className="section-prose section-prose--lead">{conPeso(chiSono.metodo.testo)}</p>
                <p className="section-prose">{conPeso(chiSono.metodo.ponte)}</p>
              </Reveal>
            </SectionCopy>
            <ImageSlot
              src={chiSono.immagini.simboli.src}
              alt={chiSono.immagini.simboli.alt}
              caption={chiSono.immagini.simboli.caption}
              fit="contain"
              className="w-full"
            />
          </SectionRails>

          <ol className="edition-leaders mt-20">
            {chiSono.metodo.categorie.map((voce, i) => (
              <Reveal key={voce.titolo} delay={i * 80} as="li">
                <div className="edition-leaders__row">
                  <span className="edition-leaders__n">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="edition-leaders__title">{voce.titolo}</h3>
                  <p className="edition-note__body mt-3 w-full basis-full pl-[2.65rem] sm:pl-0">
                    {conPeso(voce.lettura)}
                  </p>
                  <p className="edition-note__body w-full basis-full pl-[2.65rem] sm:pl-0">
                    {conPeso(voce.serve)}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={200}>
            <div className="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
              <Button to="/consulti" className="ti-btn-plain">{nav.consulti}</Button>
              <Button to="/arcani" variant="ghost">
                {nav.arcaniMaggiori}
              </Button>
              <Button to="/arcani-minori" variant="ghost">
                {nav.arcaniMinori}
              </Button>
            </div>
          </Reveal>
        </div>
      </StackSheet>

      <StackSheet className="bg-ivory px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-3xl">
          <SectionCopy>
            <SectionCopyHead>
              <Reveal>
                <Kicker>{chiSono.etica.kicker}</Kicker>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                  {chiSono.etica.titolo}
                </h2>
              </Reveal>
            </SectionCopyHead>
            <Reveal delay={200}>
              <p className="section-prose section-prose--lead">{conPeso(chiSono.etica.testo)}</p>
            </Reveal>
          </SectionCopy>
        </div>
      </StackSheet>

      <StackSheet className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <SectionRails className="page-shell items-start">
          <SectionCopy>
            <SectionCopyHead>
              <Reveal>
                <Kicker>{chiSono.formazione.kicker}</Kicker>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                  {chiSono.formazione.titolo}
                </h2>
              </Reveal>
            </SectionCopyHead>
            <Reveal delay={200}>
              <p className="section-prose section-prose--lead">{conPeso(chiSono.formazione.lead)}</p>
              {chiSono.formazione.testi.map((paragrafo) => (
                <p key={paragrafo.slice(0, 48)} className="section-prose">
                  {conPeso(paragrafo)}
                </p>
              ))}
            </Reveal>
          </SectionCopy>
          <ImageSlot
            src={chiSono.immagini.studio.src}
            alt={chiSono.immagini.studio.alt}
            caption={chiSono.immagini.studio.caption}
            fit="contain"
            className="mx-auto w-full max-w-md md:max-w-lg"
          />
        </SectionRails>
      </StackSheet>

      <StackSheet className="bg-ivory px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Kicker>{chiSono.percorsoKicker}</Kicker>
          </Reveal>
          <ul className="mt-16 divide-y divide-ink/10">
            {chiSono.percorsoDisciplinare.map((item, i) => (
              <Reveal key={item.titolo} as="li" delay={i * 80} className="grid gap-3 py-10 md:grid-cols-[1fr_1fr] md:gap-16">
                <p className="font-display text-xl text-ink">{item.titolo}</p>
                <p className="section-prose section-prose--compact md:ml-auto md:text-right">{conPeso(item.dettaglio)}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={200}>
            <div className="mt-14 text-center">
              <Button variant="ghost" onClick={() => setFormazioneOpen(true)}>
                {chiSono.percorsoEsteso.kicker}
              </Button>
            </div>
          </Reveal>
        </div>
      </StackSheet>

      <StackSheet label={brand.wordmark} className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <div className="edition-shell page-prose !mx-auto border-t border-ink/80 pt-10 text-center">
            <SectionBrandMark />
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Button to="/consulti" className="ti-btn-plain">{chiSono.ctaConsulti}</Button>
              <Button to="/contatti" variant="ghost">
                {cta.scriviStudio}
              </Button>
            </div>
          </div>
        </Reveal>
      </StackSheet>
      </StackDeck>

      {formazioneOpen ? <FormazioneOlisticaModal onClose={() => setFormazioneOpen(false)} /> : null}
    </div>
  );
}
