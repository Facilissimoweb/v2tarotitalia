import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { STUDIO, TARIFFE } from "../data/catalogo";
import { useLocalizedCatalog } from "../lib/useLocalizedCatalog";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "../components/Button";
import { BookingConfirm } from "../components/BookingConfirm";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { siteDateTime } from "../lib/locale";
import {
  canRequestRefund,
  canRequestWithdrawal,
  discardSettledBookingDraft,
  draftMatchesSettled,
  type PurchaseStatus,
} from "../lib/storage";
import { cancelPendingCheckout, requestStripeRefund, syncPaidCheckout } from "../lib/stripeCheckout";
import { buildRecessoMessage, openWhatsApp, whatsappHref } from "../lib/whatsapp";

type Tab = "acquisti" | "corsi" | "alchemici";

const { auth, consulti, lingua, legal } = siteContent;

export function Riservata() {
  const { session, purchases, logout, requestWithdrawal, refreshPurchases } = useAuth();
  const [searchParams] = useSearchParams();
  const checkout = searchParams.get("checkout");
  const checkoutBooking = searchParams.get("booking");
  if (checkout === "ok" || checkout === "cancel") discardSettledBookingDraft();
  discardSettledBookingDraft(purchases);
  const showPayForm = checkout !== "ok" && checkout !== "cancel" && !draftMatchesSettled(purchases);
  const { corsi, materiali, busy, localized, error, download } = useLocalizedCatalog();
  const [tab, setTab] = useState<Tab>("acquisti");
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawn, setWithdrawn] = useState<string | null>(null);
  const confirmTries = useRef(0);
  const syncedPending = useRef(new Set<string>());

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
    if (!pending.length) return;
    void (async () => {
      for (const item of pending) {
        syncedPending.current.add(item.id);
        await syncPaidCheckout(item.id);
      }
      await refreshPurchases();
    })();
  }, [purchases, refreshPurchases]);

  useEffect(() => {
    if (checkout === "ok") {
      discardSettledBookingDraft();
      const paidId = checkoutBooking || sessionStorage.getItem("tarot-italia-checkout-booking");
      sessionStorage.removeItem("tarot-italia-checkout-booking");
      setTab("acquisti");
      confirmTries.current = 0;
      void (async () => {
        if (paidId) await syncPaidCheckout(paidId);
        await refreshPurchases();
      })();
      return;
    }
    if (checkout !== "cancel") return;
    const id = checkoutBooking || sessionStorage.getItem("tarot-italia-checkout-booking");
    if (id) void cancelPendingCheckout(id);
  }, [checkout, checkoutBooking, refreshPurchases]);

  useEffect(() => {
    if (checkout !== "ok") return;
    const ready = purchases.some(
      (item) =>
        (checkoutBooking ? item.id === checkoutBooking : true) &&
        (item.status === "confirmed" || item.status === "completed"),
    );
    if (ready || confirmTries.current >= 8) return;
    const timer = window.setTimeout(() => {
      confirmTries.current += 1;
      void refreshPurchases();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [checkout, checkoutBooking, purchases, refreshPurchases]);

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
            className="text-[0.625rem] uppercase tracking-[0.16em] text-sage hover:text-ink"
          >
            Esci
          </button>
        </div>
      </PageHero>

      <div className="sticky top-[80px] z-30 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto">
          {(
            [
              ["acquisti", `${auth.storico} (${purchases.length})`],
              ["corsi", `Corsi & dispense (${corsi.length})`],
              ["alchemici", "Materiali alchemici"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`whitespace-nowrap px-4 py-2 text-[0.6875rem] uppercase tracking-[0.14em] ${
                tab === id ? "bg-ink text-on-ink" : "bg-mist text-ink/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-20">
        {checkout === "ok" ? (
          <p className="mb-10 bg-mist p-5 text-sm leading-relaxed text-ink">{consulti.checkoutOk}</p>
        ) : null}
        {checkout === "cancel" ? (
          <p className="mb-10 bg-mist p-5 text-sm leading-relaxed text-ink">{consulti.checkoutCancel}</p>
        ) : null}
        {showPayForm ? <BookingConfirm /> : null}
        {error ? <p className="mb-10 text-sm text-ink">{error}</p> : null}
        {tab === "acquisti" && (
          <div className="flex flex-col gap-10">
            <Reveal>
              <div>
                <Kicker>{auth.storico}</Kicker>
                <h2 className="font-display text-xl italic">{auth.storico}</h2>
                {recessoConsulti ? (
                  <p className="mt-4 text-sm leading-[1.9] text-ink/70">{recessoConsulti}</p>
                ) : null}
                {recessoDigitali ? (
                  <p className="mt-2 text-sm leading-[1.9] text-ink/70">{recessoDigitali}</p>
                ) : null}
                <p className="mt-2 text-sm leading-[1.9] text-ink/70">{legal.vendita.assistenza.testo}</p>
              </div>
            </Reveal>
            {withdrawError ? <p className="text-sm text-ink">{withdrawError}</p> : null}
            {withdrawn ? <p className="text-sm text-ink/70">{withdrawn}</p> : null}
            {purchases.length === 0 && checkout !== "ok" && (
              <Reveal delay={100}>
                <p className="bg-mist p-5 text-sm text-ink/65">
                  Nessun acquisto registrato.{" "}
                  <Link to="/consulti" className="underline underline-offset-4">
                    {siteContent.cta.consultoWhatsapp}
                  </Link>
                  .
                </p>
              </Reveal>
            )}
            {purchases.map((b, i) => {
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
              const justPaid =
                checkout === "ok" &&
                (checkoutBooking ? b.id === checkoutBooking : recedi && i === 0);
              return (
                <Reveal key={b.id} delay={i * 80}>
                  <article className={`bg-paper p-8 ${justPaid ? "ring-1 ring-ink" : ""}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-sage">{date}</p>
                      <span className="bg-mist px-2 py-0.5 text-xs">{status}</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg">{title}</h3>
                    <p className="mt-1 text-xs text-ink/60">
                      {b.minutes} minuti · {b.mode === "remote" ? "Chiamata vocale WhatsApp" : `In studio a ${STUDIO.city}`}
                      {b.slot ? ` · Ore ${b.slot}` : ""}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-ink/65">
                      {b.name}
                      {b.phone ? ` · ${b.phone}` : ""}
                    </p>
                    {b.query ? <p className="mt-2 text-xs leading-relaxed text-ink/60">{b.query}</p> : null}
                    <p className="mt-2 text-[0.625rem] uppercase tracking-[0.14em] text-ink/45">
                      {auth.riferimento} {b.id}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="bg-mist px-2.5 py-1 text-[0.625rem] uppercase tracking-wider">
                        Sessione €{b.consultPrice}
                      </span>
                      {b.pdf && (
                        <span className="bg-mist px-2.5 py-1 text-[0.625rem] uppercase tracking-wider">
                          {consulti.pdf.etichetta} +€{b.pdfPrice || consulti.pdf.prezzo}
                        </span>
                      )}
                      <span className="bg-mist px-2.5 py-1 text-[0.625rem] uppercase tracking-wider">
                        Totale €{paidEuro}
                      </span>
                    </div>
                    {recedi || refundable || withdrawable ? (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {recedi ? (
                          <Button variant="ghost" href={whatsappHref(buildRecessoMessage(b, title))}>
                            {auth.recedi}
                          </Button>
                        ) : null}
                        {refundable ? (
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={withdrawId === b.id}
                            onClick={() => void onRimborso(b.id)}
                          >
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
                  </article>
                </Reveal>
              );
            })}
            <Reveal>
              <Button to="/consulti" variant="ghost">
                {siteContent.cta.consultoWhatsapp}
              </Button>
            </Reveal>
          </div>
        )}

        {tab === "corsi" && (
          <div className="flex flex-col gap-8">
            <Reveal>
              <Kicker>Percorsi & dispense digitali</Kicker>
            </Reveal>
            {corsi.map((c, i) => (
              <Reveal key={c.id} delay={i * 80}>
                <article className="bg-paper p-8" translate={localized ? "no" : undefined}>
                  <p className="text-[0.5625rem] uppercase tracking-[0.16em] text-sage">{c.kicker}</p>
                  <h3 className="mt-1 font-display">{c.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink/65">{c.blurb}</p>
                  <button
                    type="button"
                    onClick={() => {
                      void download(c.file, c.filename, c.title);
                    }}
                    className="mt-4 inline-flex bg-ink px-4 py-2 text-[0.6875rem] uppercase tracking-[0.16em] text-on-ink"
                  >
                    {busy ? lingua.genera : "Scarica"}
                  </button>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {tab === "alchemici" && (
          <div className="flex flex-col gap-6">
            <Reveal>
              <Kicker>Risorse complementari</Kicker>
            </Reveal>
            {materiali.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <article className="flex items-center justify-between bg-paper p-6" translate={localized ? "no" : undefined}>
                  <div>
                    <h3 className="font-display text-sm">{m.title}</h3>
                    <p className="text-[0.6875rem] text-ink/55">{m.blurb}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void download(m.file, m.filename, m.title);
                    }}
                    className="text-[0.625rem] uppercase tracking-[0.16em] text-sage"
                  >
                    {busy ? lingua.genera : "Scarica"}
                  </button>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
