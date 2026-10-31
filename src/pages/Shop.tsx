import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import {
  composeShopCatalog,
  filterShopItems,
  overlayDigitalCopy,
  shopCategoriesInUse,
  sortShopItems,
  type ShopFilter,
  type ShopSort,
} from "../data/productRegistry";
import type { DigitalProductId } from "../data/catalogo";
import { useLocalizedCatalog } from "../lib/useLocalizedCatalog";
import { loginPath } from "../lib/authReturn";
import { draftFromProduct, writeDigitalDraft } from "../lib/digitalOrders";
import { useAuth } from "../context/AuthContext";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { ShopCard } from "../components/ShopCard";

const { nav, pages } = siteContent;
const copy = pages.shop;

const FILTER_LABEL: Record<ShopFilter, string> = {
  all: copy.filtri.tutti,
  dispense: copy.filtri.dispense,
  masterclass: copy.filtri.masterclass,
  materiali: copy.filtri.materiali,
  consulto: copy.filtri.consulto,
};

export function Shop() {
  const { session, ownsDigital } = useAuth();
  const { products, busy, localized, error, download } = useLocalizedCatalog();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ShopFilter>("all");
  const [sort, setSort] = useState<ShopSort>("newest");

  const catalog = useMemo(
    () => overlayDigitalCopy(composeShopCatalog(), products),
    [products],
  );
  const categories = useMemo(() => shopCategoriesInUse(catalog), [catalog]);
  const visible = useMemo(
    () => sortShopItems(filterShopItems(catalog, filter), sort),
    [catalog, filter, sort],
  );

  function buy(productId: DigitalProductId) {
    const draft = draftFromProduct(productId, session?.name ?? "");
    if (!draft) return;
    writeDigitalDraft(draft);
    if (session) navigate("/carrello");
    else navigate(loginPath("/carrello"), { state: { from: "/carrello" } });
  }

  return (
    <div>
      <PageHero kicker={copy.kicker} title={copy.titolo} lead={copy.lead} />

      <div className="mx-auto max-w-5xl px-6 pb-40 md:px-10 md:pb-48">
        {!session ? (
          <Reveal>
            <p className="mb-12 text-sm text-ember-soft">
              {copy.accesso}{" "}
              <Link className="underline underline-offset-4" to="/login">
                {nav.accedi}
              </Link>
            </p>
          </Reveal>
        ) : null}

        {error ? <p className="mb-10 text-sm text-ink">{error}</p> : null}

        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
              {copy.filtri.etichetta}
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={copy.filtri.etichetta}>
              {(["all", ...categories] as ShopFilter[]).map((id) => {
                const active = filter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`px-4 py-2.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] transition-colors ${
                      active ? "bg-ink text-on-ink" : "text-ink ring-1 ring-ink/15 hover:ring-ink/40"
                    }`}
                    aria-pressed={active}
                  >
                    {FILTER_LABEL[id]}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex flex-col gap-2 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
            {copy.ordine.etichetta}
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as ShopSort)}
              className="min-h-11 bg-paper px-3 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-ink outline-none ring-1 ring-ink/15 focus:ring-ink/40"
            >
              <option value="newest">{copy.ordine.newest}</option>
              <option value="price-desc">{copy.ordine.priceDesc}</option>
              <option value="price-asc">{copy.ordine.priceAsc}</option>
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="bg-mist p-6 text-sm leading-relaxed text-ink/70">{copy.vuoto}</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 md:gap-10 xl:grid-cols-3">
            {visible.map((item, index) => (
              <ShopCard
                key={`${item.kind}-${item.id}`}
                item={item}
                owned={item.kind === "digital" && item.digital ? ownsDigital(item.digital.id) : false}
                busy={busy}
                localized={localized && item.kind === "digital"}
                delay={index * 60}
                onBuy={buy}
                onDownload={(productId, assetId, filename, title) => {
                  void download(productId, assetId, filename, title);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
