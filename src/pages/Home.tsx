import { Link } from "react-router-dom";
import { ARCANI } from "../data/arcani";
import { TARIFFE } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { ArcanoArt } from "../components/ArcanoArt";
import { Button, Kicker } from "../components/Button";
import { ImageSlot } from "../components/ImageSlot";
import { PageHero } from "../components/PageHero";

const { brand, chiSiamo, cta, nav } = siteContent;

export function Home() {
  return (
    <div>
      <PageHero
        kicker="Vol. IV — Radici & Simboli"
        title={
          <>
            La Geometria
            <br />
            <span className="italic">dell’Invisibile</span>
          </>
        }
        lead={
          <>
            {brand.name} · {brand.city}. {brand.slogan}
          </>
        }
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        secondary={{ to: "/estrazione", label: "Pesca 3 carte · Gratis" }}
        meta={
          <div className="flex justify-between text-[9px] uppercase tracking-[0.2em] text-ink/40">
            <span>{brand.coords}</span>
            <span>{brand.region}</span>
          </div>
        }
      />

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <Kicker>{nav.chiSiamo}</Kicker>
            <h2 className="mt-5 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {chiSiamo.titolo}
            </h2>
            <p className="mt-8 text-base leading-[1.75] text-ink/75">{chiSiamo.presentazione}</p>
            <div className="mt-10 bg-paper p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
                {brand.name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{brand.deontologia}</p>
            </div>
            <div className="mt-10">
              <Button to="/chi-siamo" variant="ghost">
                {cta.leggiChiSiamo} →
              </Button>
            </div>
          </div>
          <ImageSlot
            src={chiSiamo.immagini.teresa.src}
            alt={chiSiamo.immagini.teresa.alt}
            caption={chiSiamo.immagini.teresa.caption}
            ratio="square"
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14">
          <Kicker>Trasparenza</Kicker>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">Tariffe sessioni</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {TARIFFE.map((t) => (
            <article
              key={t.id}
              className={t.id === "deep" ? "bg-ink p-8 text-on-ink md:p-10" : "bg-paper p-8 md:p-10"}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-[9px] uppercase tracking-[0.2em] ${t.id === "deep" ? "text-on-ink/55" : "text-sage"}`}
                  >
                    {t.kicker}
                  </p>
                  <h3 className="mt-2 font-display text-xl">{t.name}</h3>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-light">{t.price}€</p>
                  <p
                    className={`mt-1 text-[9px] uppercase tracking-[0.16em] ${t.id === "deep" ? "text-on-ink/55" : "text-sage"}`}
                  >
                    {t.minutes} minuti
                  </p>
                </div>
              </div>
              <p
                className={`mt-8 text-sm leading-relaxed ${t.id === "deep" ? "text-on-ink/75" : "text-ink/65"}`}
              >
                {t.summary}
              </p>
              <p
                className={`mt-10 text-[10px] uppercase tracking-[0.16em] ${t.id === "deep" ? "text-on-ink/70" : "text-ink"}`}
              >
                In studio o chiamata vocale WhatsApp
              </p>
            </article>
          ))}
        </div>
        <div className="mt-12">
          <Button to="/consulti" variant="ghost">
            {cta.consultoWhatsapp} →
          </Button>
        </div>
      </section>

      <section className="bg-mist px-8 py-24 text-center md:py-32">
        <blockquote className="mx-auto max-w-lg font-display text-xl italic leading-relaxed text-ink md:text-2xl">
          «Ciò che è in basso è come ciò che è in alto, e ciò che è in alto è come ciò che è in
          basso, per compiere le meraviglie dell’uno.»
        </blockquote>
        <p className="mt-10 text-[10px] uppercase tracking-[0.22em] text-ink">Ermete Trismegisto</p>
        <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-sage">Tavola di Smeraldo</p>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto mb-14 flex max-w-6xl items-end justify-between px-6 md:px-10">
          <div>
            <Kicker>Antologia visiva</Kicker>
            <h2 className="mt-4 font-display text-3xl md:text-4xl">Gli archetipi primari</h2>
          </div>
          <Link
            to="/arcani"
            className="text-[10px] uppercase tracking-[0.18em] text-ink hover:text-sage"
          >
            Tutti i 22 →
          </Link>
        </div>
        <div className="flex gap-8 overflow-x-auto px-6 pb-4 md:px-10">
          {ARCANI.slice(0, 6).map((a) => (
            <Link
              key={a.slug}
              to={`/arcani/${a.slug}`}
              className="w-48 shrink-0 bg-paper p-5 transition-colors hover:bg-mist"
            >
              <div className="aspect-[2/3] bg-mist">
                <ArcanoArt arcano={a} />
              </div>
              <p className="mt-5 font-display text-sm text-ink">{a.name}</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-sage">{a.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-3xl bg-mist p-10 md:p-14">
          <Kicker>{brand.name}</Kicker>
          <h3 className="mt-5 font-display text-2xl md:text-3xl">I 22 Passaggi dell’Eroe</h3>
          <p className="mt-5 text-base leading-[1.75] text-ink/70">
            Dispensa didattica: simboli, schemi di tiraggio e corrispondenze. Scaricala dall’area
            corsi — l’archivio completo è in Area Riservata.
          </p>
          <div className="mt-10">
            <Button to="/corsi">Vai ai corsi e alle dispense</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
