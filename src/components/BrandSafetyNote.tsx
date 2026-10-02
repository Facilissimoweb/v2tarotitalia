import { siteContent } from "../data/siteContent";
import { Kicker } from "./Button";
import { LegalCopy } from "./LegalNotice";
import { Reveal } from "./Reveal";

const { brand, legal } = siteContent;
const { tutela } = legal;

export function BrandSafetyNote() {
  return (
    <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Kicker>{tutela.kicker}</Kicker>
          <h2 className="mt-4 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
            {tutela.titolo}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-8 max-w-3xl text-base leading-[1.9] text-ink/75">
            <LegalCopy>{tutela.intro}</LegalCopy>
          </p>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {tutela.punti.map((punto, i) => (
            <Reveal key={punto.titolo} delay={i * 80}>
              <article className="flex h-full flex-col bg-paper p-8 md:p-10">
                <p className="text-[10px] uppercase tracking-[0.16em] text-sage">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-xl leading-snug text-ink">{punto.titolo}</h3>
                <p className="mt-6 text-sm leading-[1.85] text-ink/70">
                  <LegalCopy>{punto.testo}</LegalCopy>
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={320}>
          <p className="mt-12 text-center text-sm leading-[1.9] text-ink/65">
            <a
              href={`mailto:${brand.adminEmail}`}
              className="font-display text-lg italic text-ink underline decoration-sage/40 underline-offset-4"
            >
              {brand.adminEmail}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
