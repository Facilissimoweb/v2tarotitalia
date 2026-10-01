import { siteContent } from "../data/siteContent";
import { PageHero } from "../components/PageHero";
import { Kicker } from "../components/Button";

const { brand, cta, pages } = siteContent;

export function Contatti() {
  return (
    <div>
      <PageHero
        kicker={pages.contatti.kicker}
        title={pages.contatti.titolo}
        lead={brand.studioDiTeresa}
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        secondary={{ href: `mailto:${brand.email}`, label: cta.scriviStudio }}
      />

      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2 md:gap-16">
          <article className="bg-paper px-8 py-12 md:px-10 md:py-16">
            <Kicker>{brand.name}</Kicker>
            <p className="mt-8 font-display text-2xl leading-snug text-ink">{brand.wordmark}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/65">{brand.slogan}</p>
            <p className="mt-10 text-sm leading-[1.9] text-ink/75">{brand.studioDiTeresa}</p>
            <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-sage">{brand.coords}</p>
          </article>
          <article className="bg-mist px-8 py-12 md:px-10 md:py-16">
            <Kicker>{pages.contatti.kicker}</Kicker>
            <a
              href={`mailto:${brand.email}`}
              className="mt-8 block font-display text-xl italic text-ink underline decoration-sage/40 underline-offset-4"
            >
              {brand.email}
            </a>
            <p className="mt-10 text-sm leading-[1.9] text-ink/70">{brand.deontologia}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
