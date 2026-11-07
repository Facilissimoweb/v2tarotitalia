import { useState } from "react";
import { siteContent } from "../data/siteContent";
import { FormazioneOlisticaModal } from "../components/FormazioneOlistica";
import { PageBanner } from "../components/PageBanner";
import { ImageSlot } from "../components/ImageSlot";
import { Button, Kicker } from "../components/Button";
import { SectionBrandMark } from "../components/WidgetFrame";
import { Reveal } from "../components/Reveal";
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
        <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-[minmax(0,0.9fr)_1.1fr] md:gap-24">
          <ImageSlot
            src={chiSono.immagini.teresa.src}
            alt={chiSono.immagini.teresa.alt}
            caption={chiSono.immagini.teresa.caption}
            fit="contain"
          />
          <div className="md:pt-10">
            <Reveal>
              <Kicker>{chiSono.visione.kicker}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {chiSono.visione.titolo}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">
                {chiSono.visione.testo}
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-12 bg-paper p-8">
                <SectionBrandMark align="start" />
                <p className="mt-4 text-sm leading-relaxed text-ink/70">
                  Ricevo su appuntamento in Via Crispi 37, a Macerata, e online tramite chiamata vocale WhatsApp.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{brand.piva}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </StackSheet>

      <StackSheet className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-start gap-16 md:grid-cols-2 md:gap-24">
            <div>
              <Reveal>
                <Kicker>{chiSono.metodo.kicker}</Kicker>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                  {chiSono.metodo.titolo}
                </h2>
                <p className="mt-5 font-display text-xl font-normal leading-snug text-ink/80 md:text-2xl">
                  {chiSono.metodo.sottotitolo}
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">{chiSono.metodo.testo}</p>
                <p className="mt-8 max-w-xl text-base leading-[1.9] text-ink/75">{chiSono.metodo.ponte}</p>
              </Reveal>
            </div>
            <ImageSlot
              src={chiSono.immagini.simboli.src}
              alt={chiSono.immagini.simboli.alt}
              caption={chiSono.immagini.simboli.caption}
              note={chiSono.immagini.simboli.nota}
              fit="contain"
              className="w-full"
            />
          </div>

          <div className="mt-20 grid gap-12 md:grid-cols-2 md:gap-16">
            {chiSono.metodo.categorie.map((voce, i) => (
              <Reveal key={voce.titolo} delay={i * 80}>
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-ember-soft">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-display text-2xl font-normal leading-snug text-ink">{voce.titolo}</h3>
                <p className="mt-8 text-base leading-[1.9] text-ink/75">{voce.lettura}</p>
                <p className="mt-5 text-base leading-[1.9] text-ink/75">{voce.serve}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-14 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
              <Button to="/consulti">{nav.consulti}</Button>
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
          <Reveal>
            <Kicker>{chiSono.etica.kicker}</Kicker>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {chiSono.etica.titolo}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-10 text-base leading-[1.9] text-ink/75">{chiSono.etica.testo}</p>
          </Reveal>
        </div>
      </StackSheet>

      <StackSheet className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-2 md:gap-24">
          <div>
            <Reveal>
              <Kicker>{chiSono.formazione.kicker}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {chiSono.formazione.titolo}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">{chiSono.formazione.lead}</p>
              {chiSono.formazione.testi.map((paragrafo) => (
                <p key={paragrafo.slice(0, 48)} className="mt-8 max-w-xl text-base leading-[1.9] text-ink/75">
                  {paragrafo}
                </p>
              ))}
            </Reveal>
          </div>
          <ImageSlot
            src={chiSono.immagini.studio.src}
            alt={chiSono.immagini.studio.alt}
            caption={chiSono.immagini.studio.caption}
            fit="contain"
            className="mx-auto w-full max-w-md md:max-w-lg"
          />
        </div>
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
                <p className="text-sm leading-relaxed text-ink/65 md:text-right">{item.dettaglio}</p>
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
          <div className="mx-auto max-w-2xl bg-mist px-8 py-16 text-center md:px-16 md:py-20">
            <SectionBrandMark />
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Button to="/consulti">{chiSono.ctaConsulti}</Button>
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
