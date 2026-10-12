import { siteContent } from "../data/siteContent";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";

const { brand, cta, comingSoon, pages } = siteContent;

export function Carrello() {
  return (
    <div>
      <PageHero
        kicker={pages.carrello.kicker}
        title={pages.carrello.titolo}
        lead={brand.slogan}
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        secondary={{ to: "/chi-siamo", label: cta.leggiChiSiamo }}
        meta={
          <p className="text-[11px] uppercase tracking-[0.2em] text-sage">{comingSoon}</p>
        }
      />
      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <Reveal>
          <div className="mx-auto max-w-2xl bg-mist px-8 py-20 text-center md:px-16 md:py-28">
            <p className="font-display text-2xl italic leading-relaxed text-ink">{comingSoon}</p>
            <p className="mt-8 text-sm leading-[1.9] text-ink/65">{brand.deontologia}</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
