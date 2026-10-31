import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { STUDIO, TARIFFE, type DigitalProduct } from "../data/catalogo";
import { useLocalizedCatalog } from "../lib/useLocalizedCatalog";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { ProtectedAudio } from "../components/ProtectedAudio";
import { RiservataProfile } from "../components/RiservataProfile";
import { siteDateTime } from "../lib/locale";
import {
  canRequestRefund,
  canRequestWithdrawal,
  discardSettledBookingDraft,
  isPaidPurchase,
  type Purchase,
  type PurchaseStatus,
} from "../lib/storage";
import {
  discardSettledDigitalDraft,
  isCartDigital,
  isPaidDigital,
  type DigitalOrder,
} from "../lib/digitalOrders";
import { sessionModeLabel } from "../lib/bookingRules";
import {
  cancelPendingCheckout,
  cancelPendingDigitalCheckout,
  requestStripeRefund,
  syncPaidCheckout,
  syncPaidDigitalOrder,
} from "../lib/stripeCheckout";
import { buildRecessoMessage, openWhatsApp, whatsappHref } from "../lib/whatsapp";

const TABS = ["acquisti", "corsi", "alchemici", "profilo"] as const;
type Tab = (typeof TABS)[number];

const { auth, consulti, lingua, legal, nav, pages, cta } = siteContent;

function parseTab(value: string | null): Tab {
  if (value === "corsi" || value === "alchemici" || value === "profilo") return value;
  return "acquisti";
}

export function Riservata() {
  const { session, purchases, digitalOrders, ownsDigital, logout, requestWithdrawal, refreshPurchases } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const checkout = searchParams.get("checkout");
  const checkoutBooking = searchParams.get("booking");
  const checkoutOrder = searchParams.get("order");
  const tab = parseTab(searchParams.get("sezione"));
  const { products, corsi, busy, localized, error, download } = useLocalizedCatalog();
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawn, setWithdrawn] = useState<string | null>(null);
  const confirmTries = useRef(0);
  const syncedPending = useRef(new Set<string>());
  const landedCheckout = useRef(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const skipScroll = useRef(true);

  const paid = purchases.filter(isPaidPurchase);
  const paidDigital = digitalOrders.filter(isPaidDigital);

  useEffect(() => {
    discardSettledBookingDraft(purchases);
    discardSettledDigitalDraft(digitalOrders);
  }, [purchases, digitalOrders, checkout]);

  useEffect(() => {
    void refreshPurchases();
  }, [refreshPurchases]);

  useEffect(() => {
    const pending = purchases.filter(
      (item) =>
        item.status === "pending_payment" &&
        item.stripeCheckoutSessionId &&
        !syncedPending.current.has(item.id),
    );
    const pendingDigital = digitalOrders.filter(
      (item) =>
        (isCartDigital(item) || isPaidDigital(item)) && !syncedPending.current.has(item.id),
    );
    if (!pending.length && !pendingDigital.length) return;
    void (async () => {
      for (const item of pending) {
        syncedPending.current.add(item.id);
        await syncPaidCheckout(item.id);
      }
      for (const item of pendingDigital) {
        syncedPending.current.add(item.id);
        await syncPaidDigitalOrder(item.id);
      }
      await refreshPurchases();
    })();
  }, [purchases, digitalOrders, refreshPurchases]);

  useEffect(() => {
    if (checkout === "ok") {
      if (!landedCheckout.current) {
        landedCheckout.current = true;
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          if (checkoutOrder) params.set("sezione", "corsi");
          else params.delete("sezione");
          return params;
        }, { replace: true });
      }
      const paidId = checkoutBooking || sessionStorage.getItem("tarot-italia-checkout-booking");
      const orderId = checkoutOrder || sessionStorage.getItem("tarot-italia-checkout-order");
      sessionStorage.removeItem("tarot-italia-checkout-booking");
      sessionStorage.removeItem("tarot-italia-checkout-order");
      confirmTries.current = 0;
      void (async () => {
        if (paidId) await syncPaidCheckout(paidId);
        if (orderId) await syncPaidDigitalOrder(orderId);
        await refreshPurchases();
      })();
      return;
    }
    if (checkout !== "cancel") return;
    const id = checkoutBooking || sessionStorage.getItem("tarot-italia-checkout-booking");
    const orderId = checkoutOrder || sessionStorage.getItem("tarot-italia-checkout-order");
    if (id) void cancelPendingCheckout(id);
    if (orderId) void cancelPendingDigitalCheckout(orderId);
  }, [checkout, checkoutBooking, checkoutOrder, refreshPurchases, setSearchParams]);

  useEffect(() => {
    if (checkout !== "ok") return;
    const ready =
      purchases.some(
        (item) =>
          (checkoutBooking ? item.id === checkoutBooking : true) && isPaidPurchase(item),
      ) ||
      digitalOrders.some(
        (item) => (checkoutOrder ? item.id === checkoutOrder : true) && isPaidDigital(item),
      );
    if (ready || confirmTries.current >= 8) return;
    const timer = window.setTimeout(() => {
      confirmTries.current += 1;
      void refreshPurchases();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [checkout, checkoutBooking, checkoutOrder, purchases, digitalOrders, refreshPurchases]);

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    panelRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [tab]);

  function openTab(next: Tab) {
    if (next === tab) return;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (next === "acquisti") params.delete("sezione");
      else params.set("sezione", next);
      return params;
    }, { replace: true });
  }

  const recessoConsulti = legal.vendita.sezioni.find((sezione) => sezione.id === "consulti")?.testi[1];
  const recessoDigitali = legal.vendita.sezioni.find((sezione) => sezione.id === "digitali")?.testi[1];

  async function onRecesso(id: string, optionTitle: string) {
    if (withdrawId) return;
    setWithdrawError(null);
    setWithdrawn(null);
    setWithdrawId(id);
    const err = await requestWithdrawal(id);
    setWithdrawId(null);
    if (err) {
      setWithdrawError(err);
      return;
    }
    const purchase = purchases.find((item) => item.id === id);
    if (purchase) openWhatsApp(buildRecessoMessage({ ...purchase, status: "cancelled" }, optionTitle));
    setWithdrawn(auth.recessoInviato);
  }

  async function onRimborso(id: string) {
    if (withdrawId) return;
    setWithdrawError(null);
    setWithdrawn(null);
    setWithdrawId(id);
    const result = await requestStripeRefund(id);
    setWithdrawId(null);
    if (result.error) {
      setWithdrawError(result.detail || auth.rimborsoManca);
      return;
    }
    await refreshPurchases();
    setWithdrawn(auth.rimborsoInviato);
  }

  return (
    <div>
      <PageHero
        kicker={`${STUDIO.name} · ${STUDIO.city}`}
        title={
          <>
            Benvenuto, <span className="italic">{session?.name}</span>
          </>
        }
        lead={`Iniziato · ${session?.email}. Qui trovi lo storico degli acquisti, le dispense e i materiali alchemici.`}
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
      >
        <div className="mt-8 flex items-center gap-4">
          <span className="bg-paper px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.16em]">Attivo</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft hover:text-ink"
          >
            Esci
          </button>
        </div>
      </PageHero>

      <div className="sticky top-[80px] z-30 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto" role="tablist" aria-label={nav.riservata}>
          {(
            [
              ["acquisti", `${auth.storico} (${paid.length})`],
              ["corsi", auth.corsiDispense],
              ["alchemici", auth.materialiAlchemici],
              ["profilo", auth.profilo],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`pannello-${id}`}
              onClick={() => openTab(id)}
              className={`whitespace-nowrap px-4 py-2 text-[0.6875rem] uppercase tracking-[0.16em] ${
                tab === id ? "bg-ink text-on-ink" : "bg-mist text-ink/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section
        ref={panelRef}
        id={`pannello-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mx-auto max-w-3xl scroll-mt-36 px-6 py-16 md:px-10 md:py-20"
      >
        {error ? <p className="mb-10 text-sm text-ink">{error}</p> : null}

        {tab === "acquisti" ? (
          <div className="flex flex-col gap-10">
            {checkout === "ok" ? (
              <p className="bg-mist p-5 text-sm leading-relaxed text-ink">
                {checkoutOrder ? pages.corsi.checkoutOk : consulti.checkoutOk}
              </p>
            ) : null}
            {checkout === "cancel" ? (
              <p className="bg-mist p-5 text-sm leading-relaxed text-ink">
                {checkoutOrder ? pages.corsi.checkoutCancel : consulti.checkoutCancel}
              </p>
            ) : null}
            <div>
              <Kicker>{auth.storico}</Kicker>
              <h2 className="font-display text-xl italic">{auth.storico}</h2>
              <p className="mt-4 text-sm leading-[1.9] text-ink/70">{auth.archivioAperto}</p>
              {recessoConsulti ? (
                <p className="mt-4 text-sm leading-[1.9] text-ink/70">{recessoConsulti}</p>
              ) : null}
              {recessoDigitali ? (
                <p className="mt-2 text-sm leading-[1.9] text-ink/70">{recessoDigitali}</p>
              ) : null}
              <p className="mt-2 text-sm leading-[1.9] text-ink/70">{legal.vendita.assistenza.testo}</p>
            </div>
            {withdrawError ? <p className="text-sm text-ink">{withdrawError}</p> : null}
            {withdrawn ? <p className="text-sm text-ink/70">{withdrawn}</p> : null}
            {paid.length === 0 && paidDigital.length === 0 && checkout !== "ok" ? (
              <p className="bg-mist p-5 text-sm text-ink/65">
                Nessun acquisto registrato.{" "}
                <Link to="/consulti" className="underline underline-offset-4">
                  {cta.consultoWhatsapp}
                </Link>
                {" · "}
                <Link to="/shop" className="underline underline-offset-4">
                  {pages.corsi.titolo}
                </Link>
                .
              </p>
            ) : null}
            {paidDigital.map((order) => (
              <PaidDigitalCard key={order.id} order={order} highlighted={checkout === "ok" && checkoutOrder === order.id} />
            ))}
            {paid.map((b, i) => (
              <PaidCard
                key={b.id}
                purchase={b}
                index={i}
                checkout={checkout}
                checkoutBooking={checkoutBooking}
                withdrawId={withdrawId}
                recessoConsulti={recessoConsulti}
                onRecesso={onRecesso}
                onRimborso={onRimborso}
              />
            ))}
            <div className="flex flex-wrap gap-3">
              <Button to="/consulti" variant="ghost">
                {cta.consultoWhatsapp}
              </Button>
              <Button to="/shop" variant="ghost">
                {cta.acquista}
              </Button>
            </div>
          </div>
        ) : null}

        {tab === "corsi" ? (
          <div className="flex flex-col gap-8">
            {checkout === "ok" && checkoutOrder ? (
              <p className="bg-mist p-5 text-sm leading-relaxed text-ink">{pages.corsi.checkoutOk}</p>
            ) : null}
            <Kicker>{auth.corsiDispense}</Kicker>
            <p className="text-sm leading-[1.9] text-ink/70">{auth.archivioAperto}</p>
            {(() => {
              const ownedCorsi = corsi.filter((product) => ownsDigital(product.id));
              if (ownedCorsi.length === 0) {
                return (
                  <p className="bg-mist p-5 text-sm leading-relaxed text-ink/70">
                    {auth.archivioChiuso}{" "}
                    <Link className="underline underline-offset-4" to="/shop">
                      {pages.corsi.titolo}
                    </Link>
                  </p>
                );
              }
              return ownedCorsi.map((product) => (
                <DigitalArchiveCard
                  key={product.id}
                  product={product}
                  owned={ownsDigital(product.id)}
                  busy={busy}
                  localized={localized}
                  onDownload={download}
                />
              ));
            })()}
          </div>
        ) : null}

        {tab === "alchemici" ? (
          <div className="flex flex-col gap-6">
            <Kicker>{auth.materialiAlchemici}</Kicker>
            {(() => {
              const bundle = products.find((item) => item.id === "alchemici");
              if (!bundle || !ownsDigital("alchemici")) {
                return (
                  <p className="bg-mist p-5 text-sm leading-relaxed text-ink/70">
                    {auth.archivioChiuso}{" "}
                    <Link className="underline underline-offset-4" to="/shop">
                      {pages.corsi.titolo}
                    </Link>
                  </p>
                );
              }
              return (
                <DigitalArchiveCard
                  product={bundle}
                  owned={ownsDigital("alchemici")}
                  busy={busy}
                  localized={localized}
                  onDownload={download}
                />
              );
            })()}
          </div>
        ) : null}

        {tab === "profilo" ? <RiservataProfile /> : null}
      </section>
    </div>
  );
}

function PaidCard({
  purchase: b,
  index: i,
  checkout,
  checkoutBooking,
  withdrawId,
  recessoConsulti,
  onRecesso,
  onRimborso,
}: {
  purchase: Purchase;
  index: number;
  checkout: string | null;
  checkoutBooking: string | null;
  withdrawId: string | null;
  recessoConsulti?: string;
  onRecesso: (id: string, title: string) => void;
  onRimborso: (id: string) => void;
}) {
  const t = TARIFFE.find((x) => x.id === b.type);
  const option = consulti.opzioni.find((o) => o.id === b.type);
  const title = option?.titolo ?? t?.name ?? b.type;
  const date = b.dateIso
    ? siteDateTime({
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(b.dateIso + "T12:00:00"))
    : siteDateTime({
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(b.createdAt));
  const status = auth.stati[b.status as PurchaseStatus];
  const refundable = canRequestRefund(b);
  const recedi = b.status === "confirmed";
  const withdrawable = !recedi && canRequestWithdrawal(b.status);
  const paidEuro =
    b.stripeAmountTotal != null && b.stripeAmountTotal > 0
      ? Math.round(b.stripeAmountTotal / 100)
      : b.total;
  const justPaid = checkout === "ok" && (checkoutBooking ? b.id === checkoutBooking : recedi && i === 0);

  return (
    <article className={`bg-paper p-8 ${justPaid ? "ring-1 ring-ink" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ember-soft">{date}</p>
        <span className="bg-mist px-2 py-0.5 text-xs">{status}</span>
      </div>
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-1 text-xs text-ink/60">
        {b.minutes} minuti · {sessionModeLabel(b.mode, b.slot, STUDIO.city)}
        {b.slot ? ` · Ore ${b.slot}` : ""}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-ink/65">
        {b.name}
        {b.phone ? ` · ${b.phone}` : ""}
      </p>
      {b.query ? <p className="mt-2 text-xs leading-relaxed text-ink/60">{b.query}</p> : null}
      <p className="mt-2 text-[0.625rem] uppercase tracking-[0.16em] text-ink/45">
        {auth.riferimento} {b.id}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="bg-mist px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em]">Sessione €{b.consultPrice}</span>
        {b.pdf ? (
          <span className="bg-mist px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em]">
            {consulti.pdf.etichetta} +€{b.pdfPrice || consulti.pdf.prezzo}
          </span>
        ) : null}
        <span className="bg-mist px-2.5 py-1 text-[0.625rem] uppercase tracking-[0.16em]">Totale €{paidEuro}</span>
      </div>
      {recedi || refundable || withdrawable ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {recedi ? (
            <Button variant="ghost" href={whatsappHref(buildRecessoMessage(b, title))}>
              {auth.recedi}
            </Button>
          ) : null}
          {refundable ? (
            <Button type="button" variant="ghost" disabled={withdrawId === b.id} onClick={() => void onRimborso(b.id)}>
              {auth.rimborso}
            </Button>
          ) : null}
          {withdrawable ? (
            <Button
              type="button"
              variant="ghost"
              disabled={withdrawId === b.id}
              onClick={() => void onRecesso(b.id, title)}
            >
              {auth.recesso}
            </Button>
          ) : null}
        </div>
      ) : b.status === "completed" && recessoConsulti ? (
        <p className="mt-6 text-[0.75rem] leading-relaxed text-ink/55">{recessoConsulti}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/riservata?sezione=corsi"
          className="inline-flex bg-transparent px-6 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink ring-1 ring-ink/15 hover:bg-mist"
        >
          {auth.corsiDispense}
        </Link>
        <Link
          to="/riservata?sezione=alchemici"
          className="inline-flex bg-transparent px-6 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink ring-1 ring-ink/15 hover:bg-mist"
        >
          {auth.materialiAlchemici}
        </Link>
      </div>
    </article>
  );
}

function PaidDigitalCard({ order, highlighted }: { order: DigitalOrder; highlighted: boolean }) {
  const date = siteDateTime({
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(order.paidAt || order.createdAt));
  return (
    <article className={`bg-paper p-8 ${highlighted ? "ring-1 ring-ink" : ""}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-ember-soft">{pages.corsi.kicker}</p>
        <span className="bg-mist px-2 py-0.5 text-xs">{auth.stati[order.status]}</span>
      </div>
      <h3 className="mt-3 font-display text-lg">{order.title}</h3>
      <p className="mt-1 text-xs text-ink/60">
        {date} · {order.format} · €{order.price}
      </p>
      <p className="mt-4 text-[0.625rem] uppercase tracking-[0.16em] text-ink/45">
        {auth.riferimento} {order.id}
      </p>
      <div className="mt-6">
        <Button to={order.productId === "alchemici" ? "/riservata?sezione=alchemici" : "/riservata?sezione=corsi"}>
          {cta.scarica}
        </Button>
      </div>
    </article>
  );
}

function DigitalArchiveCard({
  product,
  owned,
  busy,
  localized,
  onDownload,
}: {
  product: DigitalProduct;
  owned: boolean;
  busy: boolean;
  localized: boolean;
  onDownload: (productId: DigitalProduct["id"], assetId: string, filename: string, title?: string) => Promise<void>;
}) {
  return (
    <article className="bg-paper p-8" translate={localized ? "no" : undefined}>
      <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{product.kicker}</p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <h3 className="font-display">{product.title}</h3>
        <span className="shrink-0 text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
          {owned ? pages.corsi.posseduto : `€${product.price}`}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink/65">{product.blurb}</p>
      {owned && product.audio ? (
        <div className="mt-6">
          <ProtectedAudio productId={product.id} assetId={product.audio} label={product.title} />
        </div>
      ) : null}
      {owned ? (
        <div className="mt-4 flex flex-col gap-3">
          {product.assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => {
                void onDownload(product.id, asset.id, asset.filename, asset.title);
              }}
              className="inline-flex bg-ink px-4 py-2 text-[0.6875rem] uppercase tracking-[0.2em] text-on-ink"
            >
              {busy ? lingua.genera : `${cta.scarica} · ${asset.title}`}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-4 text-sm leading-relaxed text-ink/70">{pages.corsi.sbloccaDopo}</p>
          <Button to="/shop">{cta.acquista}</Button>
        </div>
      )}
    </article>
  );
}
