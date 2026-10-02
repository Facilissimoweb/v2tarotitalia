import { siteContent } from "../data/siteContent";
import { BrandSafetyNote } from "../components/BrandSafetyNote";
import { PageHero } from "../components/PageHero";
import { Kicker } from "../components/Button";
import { Reveal } from "../components/Reveal";

const { brand, cta, pages } = siteContent;

export function Contatti() {
  return (
    <div>
      <PageHero
        kicker={pages.contatti.kicker}
        title={pages.contatti.titolo}
        lead={brand.studioDiTeresa}
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        media={{
          src: siteContent.chiSiamo.immagini.studio.src,
          type: "image",
          alt: siteContent.chiSiamo.immagini.studio.alt,
        }}
      />

      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <article className="bg-paper px-8 py-12 md:px-10 md:py-16">
              <Kicker>{brand.name}</Kicker>
              <p className="mt-8 font-display text-2xl leading-snug text-ink">{brand.wordmark}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/65">{brand.slogan}</p>
              <p className="mt-6 text-sm leading-relaxed text-ink/70">
                {brand.titolare}, {brand.ruolo.toLowerCase()}.
              </p>
              <p className="mt-10 text-sm leading-[1.9] text-ink/75">{brand.studioDiTeresa}</p>
              <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-sage">{brand.coords}</p>
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="bg-mist px-8 py-12 md:px-10 md:py-16">
              <Kicker>{pages.contatti.kicker}</Kicker>
              <a
                href={`mailto:${brand.email}`}
                className="mt-8 block font-display text-xl italic text-ink underline decoration-sage/40 underline-offset-4"
              >
                {brand.email}
              </a>
              <a
                href={`mailto:${brand.adminEmail}`}
                className="mt-4 block font-display text-xl italic text-ink underline decoration-sage/40 underline-offset-4"
              >
                {brand.adminEmail}
              </a>
              <p className="mt-10 text-sm leading-[1.9] text-ink/70">{brand.deontologia}</p>
            </article>
          </Reveal>
        </div>
      </section>

      <BrandSafetyNote />
    </div>
  );
}
