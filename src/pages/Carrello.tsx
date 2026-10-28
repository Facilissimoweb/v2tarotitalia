import { Link } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { STUDIO, TARIFFE } from "../data/catalogo";
import { useAuth } from "../context/AuthContext";
import { BookingConfirm } from "../components/BookingConfirm";
import { Button } from "../components/Button";
import { PageHero } from "../components/PageHero";
import {
  clearBookingDraft,
  draftMatchesSettled,
  isCartPurchase,
  readBookingDraft,
  sameBookingSlot,
  writeBookingDraft,
  type Purchase,
} from "../lib/storage";
import { sessionModeLabel } from "../lib/bookingRules";
import { cancelPendingCheckout } from "../lib/stripeCheckout";
import { formatBookingDay } from "../lib/whatsapp";
import { useMemo, useState } from "react";

const { auth, consulti, nav, pages } = siteContent;

export function Carrello() {
  const { session, purchases, refreshPurchases } = useAuth();
  const [tick, setTick] = useState(0);
  const draft = useMemo(() => {
    void tick;
    const saved = readBookingDraft();
    if (!saved || draftMatchesSettled(purchases)) return null;
    return saved;
  }, [purchases, tick]);
  const pending = purchases.filter(isCartPurchase);
  const pendingVisible = pending.filter((item) => !draft || !sameBookingSlot(item, draft));
  const empty = !draft && pendingVisible.length === 0;

  async function removePending(id: string) {
    await cancelPendingCheckout(id);
    await refreshPurchases();
  }

  function removeDraft() {
    clearBookingDraft();
    setTick((n) => n + 1);
  }

  return (
    <div>
      <PageHero
        kicker={pages.carrello.kicker}
        title={pages.carrello.titolo}
        lead={pages.carrello.lead}
        cta={{ to: "/consulti", label: siteContent.cta.consultoWhatsapp }}
        secondary={{ to: "/riservata", label: auth.storico }}
      />

      <section className="mx-auto max-w-3xl px-6 pb-24 md:px-10 md:pb-32">
        {empty ? (
          <div className="bg-mist px-8 py-16 text-center md:px-16">
            <p className="text-sm leading-[1.9] text-ink/70">{pages.carrello.vuoto}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button to="/consulti">{siteContent.cta.consultoWhatsapp}</Button>
              <Button to="/riservata" variant="ghost">
                {auth.storico}
              </Button>
            </div>
          </div>
        ) : null}

        {draft ? (
          session ? (
            <div>
              <BookingConfirm />
              <button
                type="button"
                onClick={removeDraft}
                className="mb-16 text-[0.625rem] uppercase tracking-[0.16em] text-sage hover:text-ink"
              >
                {pages.carrello.rimuovi}
              </button>
            </div>
          ) : (
            <article className="mb-10 bg-paper p-8">
              <DraftSummary />
              <p className="mt-6 text-sm leading-[1.9] text-ink/70">{auth.sogliaLead}</p>
              <Link
                to="/login"
                state={{ from: "/carrello" }}
                className="mt-8 inline-flex bg-ink px-6 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-on-ink"
              >
                {nav.accedi}
              </Link>
              <button
                type="button"
                onClick={removeDraft}
                className="mt-6 block text-[0.625rem] uppercase tracking-[0.16em] text-sage hover:text-ink"
              >
                {pages.carrello.rimuovi}
              </button>
            </article>
          )
        ) : null}

        {pendingVisible.map((item) => (
          <PendingCard
            key={item.id}
            purchase={item}
            signedIn={Boolean(session)}
            onResume={() => {
              writeBookingDraft({
                type: item.type,
                minutes: item.minutes,
                consultPrice: item.consultPrice,
                pdf: item.pdf,
                pdfPrice: item.pdfPrice,
                total: item.total,
                mode: item.mode,
                dateIso: item.dateIso,
                slot: item.slot,
                name: item.name,
                phone: item.phone,
                birth: item.birth,
                query: item.query,
                consents: item.consents,
              });
              setTick((n) => n + 1);
            }}
            onRemove={() => void removePending(item.id)}
          />
        ))}
      </section>
    </div>
  );
}

function DraftSummary() {
  const draft = readBookingDraft();
  if (!draft) return null;
  const option = consulti.opzioni.find((o) => o.id === draft.type);
  return (
    <div>
      <p className="text-[0.625rem] uppercase tracking-[0.16em] text-sage">{nav.carrello}</p>
      <h2 className="mt-3 font-display text-xl">{option?.titolo ?? draft.type}</h2>
      <p className="mt-2 text-sm text-ink/65">
        {formatBookingDay(draft.dateIso)} · {draft.slot} · {sessionModeLabel(draft.mode, draft.slot, STUDIO.city)} · €
        {draft.total}
      </p>
    </div>
  );
}

function PendingCard({
  purchase,
  signedIn,
  onResume,
  onRemove,
}: {
  purchase: Purchase;
  signedIn: boolean;
  onResume: () => void;
  onRemove: () => void;
}) {
  const t = TARIFFE.find((x) => x.id === purchase.type);
  const option = consulti.opzioni.find((o) => o.id === purchase.type);
  const title = option?.titolo ?? t?.name ?? purchase.type;
  return (
    <article className="mb-8 bg-paper p-8">
      <div className="flex items-center justify-between">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-sage">
          {purchase.dateIso ? formatBookingDay(purchase.dateIso) : ""}
        </p>
        <span className="bg-mist px-2 py-0.5 text-xs">{auth.stati[purchase.status]}</span>
      </div>
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-1 text-xs text-ink/60">
        {purchase.minutes} minuti ·{" "}
        {sessionModeLabel(purchase.mode, purchase.slot, STUDIO.city)}
        {purchase.slot ? ` · Ore ${purchase.slot}` : ""}
      </p>
      <p className="mt-4 text-[0.625rem] uppercase tracking-[0.16em] text-ink/45">
        {auth.riferimento} {purchase.id}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {signedIn ? (
          <Button type="button" onClick={onResume}>
            {consulti.pagaStripe}
          </Button>
        ) : (
          <Link
            to="/login"
            state={{ from: "/carrello" }}
            className="inline-flex bg-ink px-6 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-on-ink"
          >
            {consulti.pagaStripe}
          </Link>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-[0.625rem] uppercase tracking-[0.16em] text-sage hover:text-ink"
        >
          {pages.carrello.rimuovi}
        </button>
      </div>
    </article>
  );
}
