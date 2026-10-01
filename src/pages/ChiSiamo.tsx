import { siteContent } from "../data/siteContent";
import { ImageSlot } from "../components/ImageSlot";
import { Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";

const { brand, chiSiamo, collaboratori, cta } = siteContent;
const { maura } = collaboratori;

export function ChiSiamo() {
  return (
    <div>
      <PageHero
        kicker={chiSiamo.kicker}
        title={chiSiamo.titolo}
        lead={brand.slogan}
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        secondary={{ to: "/arcani", label: cta.esploraArcani }}
        meta={
          <p className="max-w-md text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ink/40">
            {brand.studioDiTeresa}
          </p>
        }
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
            <Kicker>{brand.name}</Kicker>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {chiSiamo.titolo}
            </h2>
            <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">
              {chiSiamo.presentazione}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p className="font-display text-2xl font-light italic leading-relaxed text-ink md:text-3xl">
            «{chiSiamo.citazione}»
          </p>
        </blockquote>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <ImageSlot
            src={chiSiamo.immagini.studio.src}
            alt={chiSiamo.immagini.studio.alt}
            caption={chiSiamo.immagini.studio.caption}
            ratio="landscape"
          />
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <Kicker>{brand.name}</Kicker>
            <p className="mt-6 font-display text-xl leading-relaxed text-ink md:text-2xl">
              {brand.studioDiTeresa}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2 md:gap-24">
          <div>
            <Kicker>{chiSiamo.formazioneKicker}</Kicker>
            <p className="mt-10 max-w-lg text-base leading-[1.9] text-ink/75">
              {chiSiamo.formazioneAccademica}
            </p>
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
        <div className="mx-auto max-w-4xl">
          <Kicker>{chiSiamo.percorsoKicker}</Kicker>
          <ul className="mt-16 divide-y divide-ink/10">
            {chiSiamo.percorsoDisciplinare.map((item) => (
              <li key={item.titolo} className="grid gap-3 py-10 md:grid-cols-[1fr_1fr] md:gap-16">
                <p className="font-display text-xl text-ink">{item.titolo}</p>
                <p className="text-sm leading-relaxed text-ink/65 md:text-right">{item.dettaglio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-[minmax(0,0.85fr)_1.15fr] md:gap-24">
          <ImageSlot
            src={maura.immagine.src}
            alt={maura.immagine.alt}
            caption={maura.immagine.caption}
            ratio="portrait"
          />
          <div className="md:pt-8">
            <Kicker>{maura.sezione}</Kicker>
            <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {maura.nome}
            </h2>
            <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">{maura.descrizione}</p>
            <p className="mt-14 text-[10px] uppercase tracking-[0.2em] text-sage">{maura.ritualiKicker}</p>
            <ul className="mt-6 space-y-4">
              {maura.rituali.map((rito) => (
                <li key={rito} className="font-display text-lg text-ink">
                  {rito}
                </li>
              ))}
            </ul>
            <blockquote className="mt-16 max-w-lg border-l border-sage pl-8">
              <p className="font-display text-xl italic leading-relaxed text-ink">«{maura.citazione}»</p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-2xl bg-paper px-8 py-16 text-center md:px-16 md:py-20">
          <Kicker>{brand.name}</Kicker>
          <p className="mt-8 text-sm leading-[1.9] text-ink/70">{brand.deontologia}</p>
        </div>
      </section>
    </div>
  );
}
