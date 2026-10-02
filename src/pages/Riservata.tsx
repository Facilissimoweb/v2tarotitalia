import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CORSI, MATERIALI, STUDIO, TARIFFE } from "../data/catalogo";
import { siteContent } from "../data/siteContent";
import { Button, Kicker } from "../components/Button";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import type { PurchaseStatus } from "../lib/storage";

type Tab = "acquisti" | "corsi" | "alchemici";

const { auth, consulti } = siteContent;

export function Riservata() {
  const { session, purchases, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("acquisti");

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
          <span className="bg-paper px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]">Attivo</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-[10px] uppercase tracking-[0.16em] text-sage hover:text-ink"
          >
            Esci
          </button>
        </div>
      </PageHero>

      <div className="sticky top-20 z-30 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto">
          {(
            [
              ["acquisti", `${auth.storico} (${purchases.length})`],
              ["corsi", `Corsi & dispense (${CORSI.length})`],
              ["alchemici", "Materiali alchemici"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`whitespace-nowrap px-4 py-2 text-[11px] uppercase tracking-[0.14em] ${
                tab === id ? "bg-ink text-on-ink" : "bg-mist text-ink/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 md:py-20">
        {tab === "acquisti" && (
          <div className="flex flex-col gap-10">
            <Reveal>
              <div>
                <Kicker>{auth.storico}</Kicker>
                <h2 className="font-display text-xl italic">I tuoi acquisti</h2>
              </div>
            </Reveal>
            {purchases.length === 0 && (
              <Reveal delay={100}>
                <p className="bg-mist p-5 text-sm text-ink/65">
                  Nessun acquisto registrato.{" "}
                  <Link to="/consulti" className="underline underline-offset-4">
                    Prenota una sessione
                  </Link>
                  .
                </p>
              </Reveal>
            )}
            {purchases.map((b, i) => {
              const t = TARIFFE.find((x) => x.id === b.type);
              const option = consulti.opzioni.find((o) => o.id === b.type);
              const date = b.dateIso
                ? new Intl.DateTimeFormat("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(b.dateIso + "T12:00:00"))
                : new Intl.DateTimeFormat("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(b.createdAt));
              const status = auth.stati[b.status as PurchaseStatus];
              return (
                <Reveal key={b.id} delay={i * 80}>
                  <article className="bg-paper p-8">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-sage">{date}</p>
                      <span className="bg-mist px-2 py-0.5 text-xs">{status}</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg">{option?.titolo ?? t?.name}</h3>
                    <p className="mt-1 text-xs text-ink/60">
                      {b.minutes} minuti · {b.mode === "remote" ? "Chiamata vocale WhatsApp" : `In studio a ${STUDIO.city}`}
                      {b.slot ? ` · Ore ${b.slot}` : ""}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="bg-mist px-2.5 py-1 text-[10px] uppercase tracking-wider">
                        Sessione €{b.consultPrice}
                      </span>
                      {b.pdf && (
                        <span className="bg-mist px-2.5 py-1 text-[10px] uppercase tracking-wider">
                          {consulti.pdf.etichetta} +€{b.pdfPrice || consulti.pdf.prezzo}
                        </span>
                      )}
                      <span className="bg-mist px-2.5 py-1 text-[10px] uppercase tracking-wider">
                        Totale €{b.total}
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
            <Reveal>
              <Button to="/consulti" variant="ghost">
                Prenota un nuovo consulto
              </Button>
            </Reveal>
          </div>
        )}

        {tab === "corsi" && (
          <div className="flex flex-col gap-8">
            <Reveal>
              <Kicker>Percorsi & dispense digitali</Kicker>
            </Reveal>
            {CORSI.map((c, i) => (
              <Reveal key={c.id} delay={i * 80}>
                <article className="bg-paper p-8">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-sage">{c.kicker}</p>
                  <h3 className="mt-1 font-display">{c.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink/65">{c.blurb}</p>
                  <a
                    href={c.file}
                    download={c.filename}
                    className="mt-4 inline-flex bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-on-ink"
                  >
                    Scarica
                  </a>
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
            {MATERIALI.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <article className="flex items-center justify-between bg-paper p-6">
                  <div>
                    <h3 className="font-display text-sm">{m.title}</h3>
                    <p className="text-[11px] text-ink/55">{m.blurb}</p>
                  </div>
                  <a
                    href={m.file}
                    download={m.filename}
                    className="text-[10px] uppercase tracking-[0.16em] text-sage"
                  >
                    Scarica
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
