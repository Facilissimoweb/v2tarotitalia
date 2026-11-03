import { useState } from "react";
import { siteContent } from "../data/siteContent";
import { FormazioneOlisticaModal } from "../components/FormazioneOlistica";
import { PageBanner } from "../components/PageBanner";
import { ImageSlot } from "../components/ImageSlot";
import { Button, Kicker } from "../components/Button";
import { SectionBrandMark } from "../components/WidgetFrame";
import { Reveal } from "../components/Reveal";
import { usePageSeo } from "../lib/pageSeo";

const { brand, chiSiamo, cta, nav } = siteContent;

export function ChiSiamo() {
  const [formazioneOpen, setFormazioneOpen] = useState(false);
  usePageSeo(chiSiamo.seo.titolo, chiSiamo.seo.descrizione);

  return (
    <div>
      <PageBanner
        title={chiSiamo.titolo}
        background={chiSiamo.immagini.hero}
        className="mb-10 md:mb-14"
      />

      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-[minmax(0,0.9fr)_1.1fr] md:gap-24">
          <ImageSlot
            src={chiSiamo.immagini.teresa.src}
            alt={chiSiamo.immagini.teresa.alt}
            caption={chiSiamo.immagini.teresa.caption}
            ratio="portrait"
          />
          <div className="md:pt-10">
            <Reveal>
              <Kicker>{chiSiamo.visione.kicker}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {chiSiamo.visione.titolo}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">
                {chiSiamo.visione.testo}
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-12 bg-paper p-8">
                <SectionBrandMark align="start" />
                <p className="mt-4 text-sm leading-relaxed text-ink/70">
                  {brand.titolare}, {brand.ruolo.toLowerCase()}.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2 md:gap-24">
          <div>
            <Reveal>
              <Kicker>{chiSiamo.metodo.kicker}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {chiSiamo.metodo.titolo}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-10 max-w-lg text-base leading-[1.9] text-ink/75">{chiSiamo.metodo.testo}</p>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
                <Button to="/arcani" variant="ghost">
                  {nav.arcaniMaggiori}
                </Button>
                <Button to="/arcani-minori" variant="ghost">
                  {nav.arcaniMinori}
                </Button>
              </div>
            </Reveal>
          </div>
          <ImageSlot
            src={chiSiamo.immagini.simboli.src}
            alt={chiSiamo.immagini.simboli.alt}
            caption={chiSiamo.immagini.simboli.caption}
            ratio="portrait"
            className="md:justify-self-end md:w-[min(100%,380px)]"
          />
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Kicker>{chiSiamo.etica.kicker}</Kicker>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {chiSiamo.etica.titolo}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-10 text-base leading-[1.9] text-ink/75">{chiSiamo.etica.testo}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2 md:gap-24">
          <div>
            <Reveal>
              <Kicker>{chiSiamo.formazioneKicker}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-10 max-w-lg text-base leading-[1.9] text-ink/75">
                {chiSiamo.formazioneAccademica}
              </p>
            </Reveal>
          </div>
          <ImageSlot
            src={chiSiamo.immagini.studio.src}
            alt={chiSiamo.immagini.studio.alt}
            caption={chiSiamo.immagini.studio.caption}
            fit="contain"
            className="mx-auto w-full max-w-md md:max-w-lg"
          />
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <Kicker>{chiSiamo.percorsoKicker}</Kicker>
          </Reveal>
          <ul className="mt-16 divide-y divide-ink/10">
            {chiSiamo.percorsoDisciplinare.map((item, i) => (
              <Reveal key={item.titolo} as="li" delay={i * 80} className="grid gap-3 py-10 md:grid-cols-[1fr_1fr] md:gap-16">
                <p className="font-display text-xl text-ink">{item.titolo}</p>
                <p className="text-sm leading-relaxed text-ink/65 md:text-right">{item.dettaglio}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={200}>
            <div className="mt-14 text-center">
              <Button variant="ghost" onClick={() => setFormazioneOpen(true)}>
                {chiSiamo.percorsoEsteso.kicker}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {formazioneOpen ? <FormazioneOlisticaModal onClose={() => setFormazioneOpen(false)} /> : null}

      <section className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <div className="mx-auto max-w-2xl bg-mist px-8 py-16 text-center md:px-16 md:py-20">
            <SectionBrandMark />
            <p className="mt-8 text-sm leading-[1.9] text-ink/70">{brand.deontologia}</p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Button to="/consulti">{chiSiamo.ctaConsulti}</Button>
              <Button to="/contatti" variant="ghost">
                {cta.scriviStudio}
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
