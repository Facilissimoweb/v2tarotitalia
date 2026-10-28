import { useState } from "react";
import { siteContent } from "../data/siteContent";
import { FormazioneOlisticaModal } from "../components/FormazioneOlistica";
import { PageBanner } from "../components/PageBanner";
import { ImageSlot } from "../components/ImageSlot";
import { Button, Kicker } from "../components/Button";
import { Reveal } from "../components/Reveal";

const { brand, chiSiamo, nav, percorsi } = siteContent;

export function ChiSiamo() {
  const [formazioneOpen, setFormazioneOpen] = useState(false);

  return (
    <div>
      <PageBanner
        title={nav.chiSiamo}
        subtitle={chiSiamo.titolo}
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
              <Kicker>{brand.name}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {chiSiamo.titolo}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">
                {chiSiamo.presentazione}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="font-display text-2xl italic leading-relaxed text-ink md:text-3xl">
              «{chiSiamo.citazione}»
            </p>
          </blockquote>
        </Reveal>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <ImageSlot
            src={chiSiamo.immagini.studio.src}
            alt={chiSiamo.immagini.studio.alt}
            caption={chiSiamo.immagini.studio.caption}
            fit="contain"
            className="mx-auto w-full max-w-md md:max-w-lg"
          />
          <Reveal>
            <div className="mx-auto mt-16 max-w-2xl text-center">
              <Kicker>{brand.name}</Kicker>
              <p className="mt-6 font-display text-xl leading-relaxed text-ink md:text-2xl">
                {brand.titolare}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{brand.ruolo}</p>
              <p className="mt-6 font-display text-xl leading-relaxed text-ink md:text-2xl">
                {brand.studioDiTeresa}
              </p>
              <p className="mt-4 text-sm uppercase leading-relaxed tracking-[0.16em] text-ink/70">
                {brand.identitaFiscale}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper px-6 py-24 md:px-10 md:py-32">
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
            src={chiSiamo.immagini.simboli.src}
            alt={chiSiamo.immagini.simboli.alt}
            caption={chiSiamo.immagini.simboli.caption}
            ratio="portrait"
            className="md:justify-self-end md:w-[min(100%,380px)]"
          />
        </div>
      </section>

      <section className="px-6 py-24 pb-40 md:px-10 md:py-32 md:pb-48">
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

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-[minmax(0,0.85fr)_1.15fr] md:gap-24">
          <ImageSlot
            src={percorsi.immagine.src}
            alt={percorsi.immagine.alt}
            caption={percorsi.immagine.caption}
            ratio="portrait"
          />
          <div className="md:pt-8">
            <Reveal>
              <Kicker>{percorsi.sezione}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {percorsi.titoloSezione}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">{percorsi.descrizione}</p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-14 text-[0.625rem] uppercase tracking-[0.16em] text-sage">{percorsi.percorsiKicker}</p>
            </Reveal>
            <ul className="mt-6 space-y-4">
              {percorsi.elenco.map((voce, i) => (
                <Reveal key={voce} as="li" delay={350 + i * 80} className="font-display text-lg text-ink">
                  {voce}
                </Reveal>
              ))}
            </ul>
            <Reveal delay={400}>
              <blockquote className="mt-16 max-w-lg border-l border-sage pl-8">
                <p className="font-display text-xl italic leading-relaxed text-ink">«{percorsi.citazione}»</p>
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <Reveal>
          <div className="mx-auto max-w-2xl bg-paper px-8 py-16 text-center md:px-16 md:py-20">
            <Kicker>{brand.name}</Kicker>
            <p className="mt-8 text-sm leading-[1.9] text-ink/70">{brand.deontologia}</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
