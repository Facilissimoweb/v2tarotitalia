import { siteContent } from "../data/siteContent";
import { ImageSlot } from "../components/ImageSlot";
import { Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const { brand, cta, collaboratori, pages } = siteContent;
const { maura } = collaboratori;

export function Rituali() {
  return (
    <div>
      <PageHero
        kicker={pages.rituali.kicker}
        title={pages.rituali.titolo}
        lead={maura.descrizione}
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        secondary={{ to: "/chi-siamo", label: cta.leggiChiSiamo }}
        meta={
          <p className="font-display text-xl text-ink">{maura.nome}</p>
        }
      />

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-start gap-16 md:grid-cols-[minmax(0,0.85fr)_1.15fr] md:gap-24">
          <ImageSlot
            src={maura.immagine.src}
            alt={maura.immagine.alt}
            caption={maura.immagine.caption}
            ratio="portrait"
          />
          <div className="md:pt-8">
            <Reveal>
              <Kicker>{maura.sezione}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {maura.nome}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-10 max-w-xl text-base leading-[1.9] text-ink/75">{maura.descrizione}</p>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-14 text-[10px] uppercase tracking-[0.2em] text-sage">{maura.ritualiKicker}</p>
            </Reveal>
            <ul className="mt-6 space-y-5">
              {maura.rituali.map((rito, i) => (
                <Reveal key={rito} as="li" delay={350 + i * 80} className="font-display text-xl text-ink">
                  {rito}
                </Reveal>
              ))}
            </ul>
            <Reveal delay={400}>
              <blockquote className="mt-16 max-w-lg border-l border-sage pl-8">
                <p className="font-display text-xl italic leading-relaxed text-ink">«{maura.citazione}»</p>
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
