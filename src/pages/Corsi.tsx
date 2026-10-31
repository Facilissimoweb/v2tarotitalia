import { Link, useNavigate } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { useLocalizedCatalog } from "../lib/useLocalizedCatalog";
import { Button } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { useAuth } from "../context/AuthContext";
import { draftFromProduct, writeDigitalDraft } from "../lib/digitalOrders";
import type { DigitalProduct } from "../data/catalogo";
import { ProtectedAudio } from "../components/ProtectedAudio";

const { cta, nav, pages } = siteContent;
const copy = pages.corsi;

export function Corsi() {
  const { session, ownsDigital } = useAuth();
  const { products, busy, localized, error, download } = useLocalizedCatalog();
  const navigate = useNavigate();

  function buy(product: DigitalProduct) {
    const draft = draftFromProduct(product.id, session?.name ?? "");
    if (!draft) return;
    writeDigitalDraft(draft);
    if (session) navigate("/carrello");
    else navigate("/login", { state: { from: "/carrello" } });
  }

  return (
    <div>
      <PageHero
        kicker={copy.kicker}
        title={copy.titolo}
        lead={copy.lead}
        cta={{ to: "/consulti", label: cta.consultoWhatsapp }}
        secondary={
          session
            ? { to: "/riservata?sezione=corsi", label: nav.riservata }
            : { to: "/login", label: nav.accedi }
        }
      />

      <div className="mx-auto max-w-3xl px-6 pb-40 md:px-10 md:pb-48">
        {!session ? (
          <Reveal>
            <p className="mb-16 text-sm text-ember-soft">
              {copy.accesso}{" "}
              <Link className="underline underline-offset-4" to="/login">
                {nav.accedi}
              </Link>
            </p>
          </Reveal>
        ) : null}

        {error ? <p className="mb-10 text-sm text-ink">{error}</p> : null}

        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {products.map((product, i) => {
            const owned = ownsDigital(product.id);
            return (
              <Reveal key={product.id} delay={i * 80}>
                <article
                  className="flex h-full flex-col bg-paper p-8 ring-1 ring-ink/10 md:p-10"
                  translate={localized ? "no" : undefined}
                >
                  <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{product.kicker}</p>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <h2 className="font-display text-xl leading-snug md:text-2xl">{product.title}</h2>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-xl">€{product.price}</p>
                      <p className="mt-1 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                        {product.format}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 flex-1 text-sm leading-[1.75] text-ink/70">{product.blurb}</p>
                  {owned && product.audio ? (
                    <div className="mt-8 bg-mist p-6">
                      <p className="mb-4 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
                        {product.title}
                      </p>
                      <ProtectedAudio productId={product.id} assetId={product.audio} label={product.title} />
                    </div>
                  ) : null}
                  {owned ? (
                    <div className="mt-8 flex flex-col gap-3">
                      {product.assets.map((asset) => (
                        <Button
                          key={asset.id}
                          className="w-full"
                          disabled={busy}
                          onClick={() => {
                            void download(product.id, asset.id, asset.filename, asset.title);
                          }}
                        >
                          {busy ? siteContent.lingua.genera : `${cta.scarica} · ${asset.title}`}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8">
                      <Button className="w-full" onClick={() => buy(product)}>
                        {cta.acquista} · €{product.price}
                      </Button>
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
