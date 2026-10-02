import { useEffect, useId, useState } from "react";
import { siteContent } from "../data/siteContent";
import { useConsent } from "../context/ConsentContext";
import { Button } from "./Button";
import { WidgetFrame } from "./WidgetFrame";

const { cookies } = siteContent;

export function CookieBanner() {
  const { open, ready, record, acceptAll, rejectOptional, saveChoices } = useConsent();
  const titleId = useId();
  const [stats, setStats] = useState(false);
  const [prefs, setPrefs] = useState(false);

  useEffect(() => {
    if (!record) return;
    setStats(record.stats);
    setPrefs(record.prefs);
  }, [record, open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!ready || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/35 p-5 backdrop-blur-md md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="max-h-[min(90vh,44rem)] w-full max-w-lg overflow-y-auto bg-ivory px-7 py-10 shadow-[0_24px_60px_rgba(43,37,35,0.18)] md:px-12 md:py-14">
          <WidgetFrame title={cookies.titolo} titleId={titleId}>
            <p className="text-sm leading-[1.8] text-ink/70">{cookies.descrizione}</p>

            <ul className="mt-10 divide-y divide-ink/10">
              <li className="py-6">
                <CookieRow
                  title={cookies.necessari.titolo}
                  text={cookies.necessari.testo}
                  on
                  locked
                  lockedLabel={cookies.necessari.stato}
                />
              </li>
              <li className="py-6">
                <CookieRow
                  title={cookies.statistici.titolo}
                  text={cookies.statistici.testo}
                  on={stats}
                  onChange={setStats}
                />
              </li>
              <li className="py-6">
                <CookieRow
                  title={cookies.preferenze.titolo}
                  text={cookies.preferenze.testo}
                  on={prefs}
                  onChange={setPrefs}
                />
              </li>
            </ul>

            <div className="mt-10 flex flex-col gap-3">
              <Button variant="primary" className="w-full" onClick={acceptAll}>
                {cookies.accetta}
              </Button>
              <Button variant="paper" className="w-full" onClick={() => saveChoices(stats, prefs)}>
                {cookies.salva}
              </Button>
              <Button variant="ghost" className="w-full" onClick={rejectOptional}>
                {cookies.rifiuta}
              </Button>
            </div>
          </WidgetFrame>
      </div>
    </div>
  );
}

function CookieRow({
  title,
  text,
  on,
  onChange,
  locked = false,
  lockedLabel,
}: {
  title: string;
  text: string;
  on: boolean;
  onChange?: (value: boolean) => void;
  locked?: boolean;
  lockedLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="font-display text-lg leading-snug text-ink">{title}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">{text}</p>
      </div>
      {locked ? (
        <span className="shrink-0 pt-1 text-[9px] uppercase tracking-[0.16em] text-sage">{lockedLabel}</span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={title}
          onClick={() => onChange?.(!on)}
          className={`relative mt-1 h-7 w-12 shrink-0 ${on ? "bg-sage" : "bg-ink/20"}`}
        >
          <span
            className="absolute top-0.5 h-6 w-6 bg-ivory transition-transform duration-300 ease-in-out motion-reduce:transition-none"
            style={{ transform: on ? "translate3d(1.35rem, 0, 0)" : "translate3d(0.15rem, 0, 0)" }}
          />
        </button>
      )}
    </div>
  );
}