import { siteContent } from "../data/siteContent";
import { PageHero } from "../components/PageHero";

const { brand, cta, comingSoon, nav, pages } = siteContent;

export function ArcaniMinori() {
  return (
    <div>
      <PageHero
        kicker={pages.arcaniMinori.kicker}
        title={pages.arcaniMinori.titolo}
        lead={brand.slogan}
        cta={{ to: "/arcani", label: nav.arcaniMaggiori }}
        secondary={{ to: "/consulti", label: cta.consultoWhatsapp }}
        meta={
          <p className="text-[11px] uppercase tracking-[0.2em] text-sage">{comingSoon}</p>
        }
      />
      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-2xl bg-mist px-8 py-20 text-center md:px-16 md:py-28">
          <p className="font-display text-2xl italic leading-relaxed text-ink">{comingSoon}</p>
          <p className="mt-8 text-sm leading-[1.9] text-ink/65">{brand.deontologia}</p>
        </div>
      </section>
    </div>
  );
}
