import { useEffect, useId, useState, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { Button } from "./Button";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetFrame } from "./WidgetFrame";
import { WHATSAPP_ANCHOR, whatsappChatHref } from "../lib/whatsapp";

const { legal } = siteContent;

export type LegalKind = "privacy" | "disclaimer" | "tutela" | "vendita";

type Props = {
  kind: LegalKind | null;
  onClose: () => void;
};

export function LegalNotice({ kind, onClose }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!kind) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [kind]);

  if (!kind) return null;

  const meta = legalMeta(kind);
  const title = meta.titolo;
  const intestazione = meta.intestazione;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/35 p-5 backdrop-blur-md md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative w-full max-w-2xl bg-ivory shadow-[0_24px_60px_rgba(43,37,35,0.18)]">
        <WidgetCloseButton onClick={onClose} />
        <div className="max-h-[min(90vh,48rem)] overflow-y-auto px-7 py-10 md:px-12 md:py-14">
          <WidgetFrame title={title} titleId={titleId}>
            <p className="text-center text-[12px] tracking-[0.04em] text-ink/50">
              <LegalCopy>{intestazione}</LegalCopy>
            </p>
            <LegalBody kind={kind} onClose={onClose} />
          </WidgetFrame>
        </div>
      </div>
    </div>
  );
}

function legalMeta(kind: LegalKind) {
  switch (kind) {
    case "privacy":
      return legal.privacy;
    case "disclaimer":
      return legal.disclaimer;
    case "tutela":
      return legal.tutela;
    case "vendita":
      return legal.vendita;
  }
}

function LegalBody({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
  switch (kind) {
    case "privacy":
      return <PrivacyBody />;
    case "disclaimer":
      return <DisclaimerBody onClose={onClose} />;
    case "tutela":
      return <TutelaBody />;
    case "vendita":
      return <VenditaBody />;
  }
}

function PrivacyBody() {
  const { privacy } = legal;
  return (
    <div className="mt-8 space-y-8 text-left">
      {privacy.intro.map((paragrafo) => (
        <p key={paragrafo} className="text-sm leading-[1.9] text-ink/70">
          <LegalCopy>{paragrafo}</LegalCopy>
        </p>
      ))}
      {privacy.sezioni.map((sezione) => (
        <section key={sezione.titolo} className="border-t border-ink/10 pt-8">
          <h3 className="flex items-start gap-3 font-display text-lg leading-snug text-ink">
            <span className="mt-1 shrink-0 text-sage">
              <LegalIcon name={sezione.icon} />
            </span>
            <span>{sezione.titolo}</span>
          </h3>
          <p className="mt-4 text-sm leading-[1.9] text-ink/70">
            <LegalCopy>{sezione.testo}</LegalCopy>
          </p>
        </section>
      ))}
    </div>
  );
}

function DisclaimerBody({ onClose }: { onClose: () => void }) {
  const { disclaimer } = legal;
  return (
    <div className="mt-8 space-y-8 text-left">
      <h3 className="text-center font-display text-base font-medium uppercase leading-relaxed tracking-[0.08em] text-ink">
        {disclaimer.heading}
      </h3>
      {disclaimer.paragrafi.map((paragrafo) => (
        <p key={paragrafo.slice(0, 48)} className="text-sm leading-[1.9] text-ink/70">
          <LegalCopy>{paragrafo}</LegalCopy>
        </p>
      ))}
      <div className="pt-4">
        <Button variant="primary" className="w-full" onClick={onClose}>
          {disclaimer.conferma}
        </Button>
      </div>
    </div>
  );
}

function TutelaBody() {
  const { tutela } = legal;
  return (
    <div className="mt-8 space-y-8 text-left">
      <p className="text-sm leading-[1.9] text-ink/70">
        <LegalCopy>{tutela.intro}</LegalCopy>
      </p>
      {tutela.punti.map((punto) => (
        <section key={punto.titolo} className="border-t border-ink/10 pt-8">
          <h3 className="font-display text-lg leading-snug text-ink">{punto.titolo}</h3>
          <p className="mt-4 text-sm leading-[1.9] text-ink/70">
            <LegalCopy>{punto.testo}</LegalCopy>
          </p>
        </section>
      ))}
    </div>
  );
}

function VenditaBody() {
  const { vendita } = legal;
  const [open, setOpen] = useState<string>(vendita.sezioni[0].id);

  return (
    <div className="mt-8 text-left">
      {vendita.sezioni.map((sezione) => {
        const expanded = open === sezione.id;
        return (
          <section key={sezione.id} className="border-t border-ink/10">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 py-5 text-left"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? "" : sezione.id)}
            >
              <h3 className="font-display text-lg leading-snug text-ink">{sezione.titolo}</h3>
              <span className="mt-1 shrink-0 text-sage" aria-hidden>
                {expanded ? "–" : "+"}
              </span>
            </button>
            {expanded ? (
              <div className="space-y-4 pb-6">
                {sezione.testi.map((paragrafo) => (
                  <p key={paragrafo} className="text-sm leading-[1.9] text-ink/70">
                    <LegalCopy>{paragrafo}</LegalCopy>
                  </p>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
      <section className="border-t border-ink/10 pt-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-sage">{vendita.assistenza.titolo}</p>
        <p className="mt-4 text-sm leading-[1.9] text-ink/70">
          <LegalCopy>{vendita.assistenza.testo}</LegalCopy>
        </p>
      </section>
    </div>
  );
}

const TOKEN = /(www\.tarotitalia\.com|info@tarotitalia\.com|tarotitalia\.com|\+39 379 103 82 53)/g;

export function LegalCopy({ children }: { children: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(TOKEN.source, "g");
  while ((match = re.exec(children))) {
    if (match.index > last) nodes.push(children.slice(last, match.index));
    const token = match[0];
    if (token.includes("@")) {
      nodes.push(
        <a
          key={`${token}-${match.index}`}
          href={`mailto:${token}`}
          className="underline decoration-sage/40 underline-offset-4 hover:text-ink"
        >
          {token}
        </a>,
      );
    } else if (token.startsWith("+39")) {
      nodes.push(
        <a
          key={`${token}-${match.index}`}
          href={whatsappChatHref()}
          {...WHATSAPP_ANCHOR}
          className="underline decoration-sage/40 underline-offset-4 hover:text-ink"
        >
          {token}
        </a>,
      );
    } else {
      nodes.push(
        <a
          key={`${token}-${match.index}`}
          href={legal.sitoUrl}
          className="underline decoration-sage/40 underline-offset-4 hover:text-ink"
        >
          {token}
        </a>,
      );
    }
    last = match.index + token.length;
  }
  if (last < children.length) nodes.push(children.slice(last));
  return <>{nodes}</>;
}

function LegalIcon({ name }: { name: (typeof legal.privacy.sezioni)[number]["icon"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3.5 19 6.5v5.2c0 4.4-3 6.9-7 8.8-4-1.9-7-4.4-7-8.8V6.5Z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2.2M12 18.3v2.2M4.8 7.2l1.9 1.1M17.3 15.7l1.9 1.1M4.8 16.8l1.9-1.1M17.3 8.3l1.9-1.1" />
        </svg>
      );
    case "gavel":
      return (
        <svg {...common}>
          <path d="M4 19.5h9M13.2 6.2l4.6 4.6M8.4 11l4.6-4.6 2.2 2.2-4.6 4.6Z" />
          <path d="M7.2 14.4 5 16.6l2.2 2.2 2.2-2.2" />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path d="M9.2 14.8a4 4 0 0 1 0-5.6l2.2-2.2a4 4 0 0 1 5.6 5.6l-1.1 1.1" />
          <path d="M14.8 9.2a4 4 0 0 1 0 5.6l-2.2 2.2a4 4 0 1 1-5.6-5.6l1.1-1.1" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="6.5" y="11" width="11" height="8.5" />
          <path d="M9 11V8.4A3 3 0 0 1 15 8.4V11" />
        </svg>
      );
    case "policy":
      return (
        <svg {...common}>
          <path d="M7 4.5h7.5L17.5 8v11.5H7Z" />
          <path d="M14.5 4.5V8H17.5M9.5 12h5M9.5 15h5" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="4" y="6.5" width="16" height="11" />
          <path d="M4.5 7.2 12 13l7.5-5.8" />
        </svg>
      );
  }
}
