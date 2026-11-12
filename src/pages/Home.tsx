import { useState } from "react";
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
import { SectionCopy, SectionCopyHead } from "../components/SectionCopy";
import { StackDeck, StackSheet } from "../components/StackSheet";
import { shopLive } from "../lib/launchFlags";
const { chiSono, cta, home, nav } = siteContent;

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
        <StackSheet label={nav.chiSono} className="bg-mist px-6 py-24 md:px-10 md:py-32">
          <div className="page-shell">
            <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16 xl:gap-20">
              <div className="min-w-0">
                <Reveal>
                  <BrandLogo
                    tone="hero"
                    className="logo-hero-ring h-[5.5rem] w-[5.5rem] md:h-24 md:w-24"
                  />
                </Reveal>
                <SectionCopy className="mt-8 md:mt-10">
                  <SectionCopyHead>
                    <Reveal>
                      <Kicker>{home.chiSono.kicker}</Kicker>
                    </Reveal>
                    <Reveal delay={100}>
                      <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                        {home.chiSono.titolo}
                      </h2>
                    </Reveal>
                  </SectionCopyHead>
                  <Reveal delay={200}>
                    {home.chiSono.blocchi.map((blocco, i) => (
                      <p key={i} className="section-prose section-prose--lead">
                        <BloccoMetodo parti={blocco} />
                      </p>
                    ))}
                  </Reveal>
                </SectionCopy>
                <Reveal delay={300}>
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

        <StackSheet label={nav.consulti} className="bg-paper px-6 py-24 md:px-10 md:py-32">
          <div className="page-shell">
            <Reveal>
              <SectionCopy className="page-prose !mx-0">
                <SectionCopyHead>
                  <Kicker>{nav.consulti}</Kicker>
                  <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                    {home.percorsi.titolo}
                  </h2>
                </SectionCopyHead>
              </SectionCopy>
            </Reveal>

            <div className="mt-12 grid gap-6 md:mt-14 md:grid-cols-2 md:gap-8">
              {home.percorsi.letture.map((lettura, i) => {
                const featured = lettura.id === "deep";
                return (
                  <Reveal key={lettura.id} delay={i * 80}>
                    <article
                      className={`depth-panel flex h-full flex-col p-8 md:p-10 ${
                        featured ? "depth-panel--dark bg-plate text-on-ink" : "bg-ivory"
                      }`}
                    >
                      <p
                        className={`text-[0.625rem] uppercase tracking-[0.16em] ${
                          featured ? "text-on-ink/55" : "text-ember-soft"
                        }`}
                      >
                        {lettura.meta}
                      </p>
                      <h3 className="mt-4 font-display text-xl leading-snug">{lettura.titolo}</h3>
                      <p
                        className={`mt-6 flex-1 text-sm leading-[1.85] ${
                          featured ? "text-on-ink/75" : "text-ink/70"
                        }`}
                      >
                        {conPeso(lettura.testo)}
                      </p>
                      <div className="mt-10">
                        <Button
                          to={`/consulti?tipo=${lettura.id}`}
                          variant={featured ? "paper" : "ghost"}
                          className="w-full"
                        >
                          {lettura.cta}
                        </Button>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={240}>
              <div className="mt-14 flex justify-center">
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
                <div className="pt-16 md:pt-20">
                  <Reveal>
                    <SectionCopy className="page-prose !mx-0">
                      <SectionCopyHead>
                        <Kicker>{home.visione.kicker}</Kicker>
                        <h2 className="font-display text-3xl font-normal text-ink md:text-4xl">
                          {home.visione.titolo}
                        </h2>
                      </SectionCopyHead>
                      <p className="section-prose section-prose--lead">
                        {conPeso(home.visione.lead)}
                      </p>
                    </SectionCopy>
                  </Reveal>

                  <div className="mt-12 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-8">
                    {home.visione.pilastri.map((pilastro, i) => (
                      <Reveal key={pilastro.titolo} delay={i * 80}>
                        <article className="depth-panel flex h-full flex-col bg-ivory p-8 md:p-9">
                          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                            {String(i + 1).padStart(2, "0")}
                          </p>
                          <h3 className="mt-4 font-display text-xl leading-snug text-ink">
                            {pilastro.titolo}
                          </h3>
                          <p className="mt-6 flex-1 text-sm leading-[1.85] text-ink/70">
                            {conPeso(pilastro.testo)}
                          </p>
                          <p className="mt-10 text-[0.625rem] uppercase tracking-[0.16em] text-ink">
                            {pilastro.etichetta}
                          </p>
                        </article>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StackSheet>

        <StackSheet
          label={home.citazione.autore}
          className="bg-mist px-6 pb-24 pt-32 text-center md:px-10 md:pb-32 md:pt-40"
        >
          <div className="page-prose">
            <Reveal>
              <SectionBrandMark />
            </Reveal>
            <Reveal delay={80}>
              <blockquote className="atmosphere-quote mx-auto mt-10 max-w-lg font-display text-xl italic leading-relaxed text-ink md:text-2xl">
                «{home.citazione.testo}»
              </blockquote>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-10 text-[0.625rem] uppercase tracking-[0.16em] text-ink">
                {home.citazione.autore}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-3 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                {home.citazione.fonte}
              </p>
            </Reveal>
          </div>
        </StackSheet>

        <StackSheet label={home.recensioni.titolo} className="bg-linen">
          <GoogleReviews />
        </StackSheet>

        {shopLive() ? (
          <StackSheet label={home.passaggi.titolo} className="bg-paper px-6 py-24 md:px-10 md:py-32">
            <div className="depth-panel page-prose bg-mist p-10 text-center md:p-14">
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
