import { useState } from "react";
import { Link } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";
import { conPeso } from "../components/Prosa";
import { SectionBrandMark } from "../components/WidgetFrame";
import { FaqSchede } from "../components/FaqSchede";
import { FormazioneOlisticaModal } from "../components/FormazioneOlistica";
import { GoogleReviews } from "../components/GoogleReviews";
import { HomeHero } from "../components/HomeHero";
import { HomeVolumes } from "../components/HomeVolumes";
import { ImageSlot } from "../components/ImageSlot";
import { GoogleReviewsHeroLink } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { StackDeck, StackSheet } from "../components/StackSheet";
import { shopLive } from "../lib/launchFlags";
const { brand, chiSono, cta, home, nav } = siteContent;

function BloccoMetodo({ parti }: { parti: readonly (string | { chiave: string })[] }) {
  return parti.map((parte, i) =>
    typeof parte === "string" ? (
      <span key={i}>{parte}</span>
    ) : (
      <strong key={i} className="font-bold not-italic">
        {parte.chiave}
      </strong>
    ),
  );
}

export function Home() {
  const [formazioneOpen, setFormazioneOpen] = useState(false);
  const [visioneOpen, setVisioneOpen] = useState(false);

  return (
    <div className="w-full min-w-0">
      <HomeHero />

      <StackDeck>
        <StackSheet label={nav.chiSono} className="edition-sheet edition-sheet--mist px-6 py-16 md:px-10 md:py-24">
          <div className="edition-shell page-shell">
            <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16 xl:gap-20">
              <div className="min-w-0">
                <Reveal>
                  <BrandLogo
                    tone="hero"
                    className="logo-hero-ring h-[5.5rem] w-[5.5rem] md:h-24 md:w-24"
                  />
                </Reveal>

                <section className="edition-section !pt-8 md:!pt-10" aria-labelledby="edition-editor">
                  <Reveal>
                    <h2 id="edition-editor" className="edition-section__title">
                      {home.edition.dallaFondatrice}
                    </h2>
                  </Reveal>
                  <Reveal delay={80}>
                    <div className="edition-note">
                      <h2 className="edition-note__headline">{home.chiSono.titolo}</h2>
                      {home.chiSono.blocchi.map((blocco, i) => (
                        <p key={i} className="edition-note__body">
                          <BloccoMetodo parti={blocco} />
                        </p>
                      ))}
                      <p className="edition-note__sign">{brand.titolare}</p>
                    </div>
                  </Reveal>
                </section>

                <Reveal delay={200}>
                  <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button to="/chi-sono" variant="ghost">
                      {cta.leggiChiSono} →
                    </Button>
                    <Button variant="ghost" onClick={() => setFormazioneOpen(true)}>
                      {cta.formazioneOlistica}
                    </Button>
                    <GoogleReviewsHeroLink
                      href="#recensioni-google"
                      label={home.recensioni.heroCta}
                      onMedia={false}
                    />
                  </div>
                </Reveal>
              </div>
              <ImageSlot
                src={chiSono.immagini.pamela.src}
                alt={chiSono.immagini.pamela.alt}
                caption={chiSono.immagini.pamela.caption}
                note={chiSono.immagini.pamela.nota}
                ratio="portrait"
                fit="contain"
              />
            </div>

            <div className="page-prose mt-16 md:mt-20">
              <FaqSchede
                titolo={home.chiSono.faq.titolo}
                precedente={home.chiSono.faq.precedente}
                successiva={home.chiSono.faq.successiva}
                voci={home.chiSono.faq.voci}
              />
            </div>
          </div>
        </StackSheet>

        <StackSheet label={nav.consulti} className="edition-sheet edition-sheet--paper px-6 py-16 md:px-10 md:py-24">
          <div className="edition-shell page-shell">
            <Reveal>
              <section className="edition-section !pt-0" aria-labelledby="edition-letture">
                <h2 id="edition-letture" className="edition-section__title">
                  {home.percorsi.titolo}{" "}
                  <span className="tabular">({home.percorsi.letture.length})</span>
                </h2>
                <ol className="edition-leaders">
                  {home.percorsi.letture.map((lettura, i) => (
                    <li key={lettura.id}>
                      <Link
                        to={`/consulti?tipo=${lettura.id}`}
                        className="edition-leaders__link"
                      >
                        <span className="edition-leaders__n">{String(i + 1).padStart(2, "0")}</span>
                        <span className="edition-leaders__title">{lettura.titolo}</span>
                        <span className="edition-leaders__fill" aria-hidden />
                        <span className="edition-leaders__trail">{lettura.meta}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <div className="mt-8 space-y-4 page-prose !mx-0 max-w-none">
                  {home.percorsi.letture.map((lettura) => (
                    <p key={`copy-${lettura.id}`} className="text-sm leading-[1.85] text-ink/70">
                      <strong className="font-display text-ink">{lettura.titolo}.</strong>{" "}
                      {conPeso(lettura.testo)}{" "}
                      <Link
                        to={`/consulti?tipo=${lettura.id}`}
                        className="underline decoration-ink/30 underline-offset-4 hover:decoration-ember"
                      >
                        {lettura.cta} →
                      </Link>
                    </p>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-12 flex justify-start">
                <Button
                  type="button"
                  variant="ghost"
                  aria-expanded={visioneOpen}
                  aria-controls="home-visione"
                  onClick={() => setVisioneOpen((open) => !open)}
                >
                  {visioneOpen ? home.visione.riduci : home.visione.espandi}
                  <span aria-hidden className="text-[0.75rem] leading-none">
                    {visioneOpen ? "↑" : "↓"}
                  </span>
                </Button>
              </div>
            </Reveal>

            <div
              id="home-visione"
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                visioneOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <section className="edition-section" aria-labelledby="edition-visione">
                  <Reveal>
                    <Kicker>{home.visione.kicker}</Kicker>
                    <h2
                      id="edition-visione"
                      className="mt-2 font-display text-3xl font-normal text-ink md:text-4xl"
                    >
                      {home.visione.titolo}
                    </h2>
                    <p className="edition-note mt-6 !border-t-0 !pt-0 text-base leading-[1.75] text-ink/80">
                      {conPeso(home.visione.lead)}
                    </p>
                  </Reveal>
                  <ol className="edition-leaders mt-10">
                    {home.visione.pilastri.map((pilastro, i) => (
                      <li key={pilastro.titolo}>
                        <div className="edition-leaders__row">
                          <span className="edition-leaders__n">{String(i + 1).padStart(2, "0")}</span>
                          <span className="edition-leaders__title">{pilastro.titolo}</span>
                          <span className="edition-leaders__fill" aria-hidden />
                          <span className="edition-leaders__trail">{pilastro.etichetta}</span>
                          <p className="mt-2 w-full basis-full pl-[2.65rem] text-sm leading-[1.8] text-ink/70 sm:pl-0">
                            {conPeso(pilastro.testo)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </div>
          </div>
        </StackSheet>

        <StackSheet
          label={home.citazione.autore}
          className="edition-sheet edition-sheet--mist px-6 pb-20 pt-24 text-left md:px-10 md:pb-28 md:pt-32"
        >
          <div className="edition-shell page-prose !mx-auto">
            <Reveal>
              <SectionBrandMark />
            </Reveal>
            <Reveal delay={80}>
              <blockquote className="edition-note mt-8 border-t border-ink/80 pt-5 font-display text-xl italic leading-relaxed text-ink md:text-2xl">
                «{home.citazione.testo}»
              </blockquote>
            </Reveal>
            <Reveal delay={160}>
              <p className="edition-note__sign mt-6 uppercase tracking-[0.14em]">
                {home.citazione.autore}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-2 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                {home.citazione.fonte}
              </p>
            </Reveal>
          </div>
        </StackSheet>

        <StackSheet label={home.recensioni.titolo} className="bg-linen">
          <GoogleReviews />
        </StackSheet>

        {shopLive() ? (
          <StackSheet label={home.passaggi.titolo} className="edition-sheet edition-sheet--paper px-6 py-24 md:px-10 md:py-32">
            <div className="edition-shell page-prose !mx-auto text-center">
              <Reveal>
                <SectionBrandMark />
              </Reveal>
              <Reveal delay={100}>
                <h2 className="mt-5 font-display text-2xl font-normal leading-snug text-ink md:text-3xl">
                  {home.passaggi.titolo}
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-5 text-base leading-[1.75] text-ink/70">
                  {conPeso(home.passaggi.testo)}
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-10">
                  <Button to="/shop">{home.passaggi.cta}</Button>
                </div>
              </Reveal>
            </div>
          </StackSheet>
        ) : null}
      </StackDeck>

      <HomeVolumes />

      {formazioneOpen ? <FormazioneOlisticaModal onClose={() => setFormazioneOpen(false)} /> : null}
    </div>
  );
}
