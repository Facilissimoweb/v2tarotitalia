import { useState } from "react";
import { siteContent } from "../data/siteContent";
import { BrandLogo } from "../components/BrandLogo";
import { Button, Kicker } from "../components/Button";
import { FormazioneOlisticaModal } from "../components/FormazioneOlistica";
import { GoogleReviews } from "../components/GoogleReviews";
import { HomeHero } from "../components/HomeHero";
import { ImageSlot } from "../components/ImageSlot";
import { GoogleReviewsHeroLink } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
const { brand, chiSiamo, cta, home, nav } = siteContent;

export function Home() {
  const [formazioneOpen, setFormazioneOpen] = useState(false);
  const [visioneOpen, setVisioneOpen] = useState(false);

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <HomeHero />

      <section className="bg-mist px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <Reveal>
              <Kicker>{nav.chiSiamo}</Kicker>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mt-5 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                {home.chiSiamo.titolo}
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-8 text-base leading-[1.75] text-ink/75">{home.chiSiamo.presentazione}</p>
              <p className="mt-5 text-base leading-[1.75] text-ink/75">{home.chiSiamo.percorsi}</p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-10 bg-paper p-8">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink">
                  {brand.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {brand.titolare}, {brand.ruolo.toLowerCase()}.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{brand.deontologia}</p>
              </div>
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button to="/chi-sono" variant="ghost">
                  {cta.leggiChiSiamo} →
                </Button>
                <Button variant="ghost" onClick={() => setFormazioneOpen(true)}>
                  {cta.formazioneOlistica}
                </Button>
                <GoogleReviewsHeroLink href="#recensioni-google" label={home.recensioni.heroCta} onMedia={false} />
              </div>
            </Reveal>
          </div>
          <ImageSlot
            src={chiSiamo.immagini.teresaHome.src}
            alt={chiSiamo.immagini.teresaHome.alt}
            caption={chiSiamo.immagini.teresaHome.caption}
            ratio="portrait"
            fit="contain"
            framed
          />
        </div>
      </section>

      <section className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <Kicker>{nav.consulti}</Kicker>
            <h2 className="mt-4 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
              {home.percorsi.titolo}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {home.percorsi.letture.map((lettura, i) => {
              const featured = lettura.id === "deep";
              return (
                <Reveal key={lettura.id} delay={i * 80}>
                  <article
                    className={`flex h-full flex-col p-8 md:p-10 ${
                      featured ? "bg-ink text-on-ink" : "bg-ivory"
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
                      {lettura.testo}
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
        </div>
      </section>

      <div
        id="home-visione"
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          visioneOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <section className="px-6 py-24 md:px-10 md:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-end gap-10 md:grid-cols-2 md:gap-16">
                <Reveal>
                  <Kicker>{home.visione.kicker}</Kicker>
                  <h2 className="mt-5 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
                    {home.visione.titolo}
                  </h2>
                </Reveal>
                <Reveal delay={80}>
                  <p className="text-base leading-[1.75] text-ink/75">{home.visione.lead}</p>
                </Reveal>
              </div>
              <div className="mt-14 grid gap-8 lg:grid-cols-3">
                {home.visione.pilastri.map((pilastro, i) => (
                  <Reveal key={pilastro.titolo} delay={i * 80}>
                    <article className="flex h-full flex-col bg-paper p-8 md:p-10">
                      <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-4 font-display text-xl leading-snug text-ink">{pilastro.titolo}</h3>
                      <p className="mt-6 flex-1 text-sm leading-[1.85] text-ink/70">{pilastro.testo}</p>
                      <p className="mt-10 text-[0.625rem] uppercase tracking-[0.16em] text-ink">
                        {pilastro.etichetta}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="bg-mist px-6 pb-24 pt-32 text-center md:px-10 md:pb-32 md:pt-40">
        <div className="mx-auto w-full max-w-6xl">
          <Reveal>
            <BrandLogo className="mx-auto h-16 w-16" />
            <p className="mt-5 font-display text-[0.6875rem] uppercase leading-none tracking-[0.16em] text-ink">
              {brand.wordmark}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <blockquote className="mx-auto mt-10 max-w-lg font-display text-xl italic leading-relaxed text-ink md:text-2xl">
              «{home.citazione.testo}»
            </blockquote>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-10 text-[0.625rem] uppercase tracking-[0.16em] text-ink">{home.citazione.autore}</p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-3 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{home.citazione.fonte}</p>
          </Reveal>
        </div>
      </section>

      <GoogleReviews />

      <section className="bg-paper px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-3xl bg-mist p-10 text-center md:p-14">
          <Reveal>
            <Kicker>{brand.name}</Kicker>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mt-5 font-display text-2xl font-normal leading-snug text-ink md:text-3xl">
              {home.passaggi.titolo}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 text-base leading-[1.75] text-ink/70">{home.passaggi.testo}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10">
              <Button to="/corsi">{home.passaggi.cta}</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {formazioneOpen ? <FormazioneOlisticaModal onClose={() => setFormazioneOpen(false)} /> : null}
    </div>
  );
}
