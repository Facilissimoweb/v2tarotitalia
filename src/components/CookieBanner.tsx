import { useEffect, useId, useState } from "react";
import { siteContent } from "../data/siteContent";
import { useConsent } from "../context/ConsentContext";
import { Button } from "./Button";
import { conPeso } from "./Prosa";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetFrame } from "./WidgetFrame";

const { cookies } = siteContent;

export function CookieBanner() {
  const { open, ready, record, dismiss, acceptAll, rejectOptional, saveChoices } = useConsent();
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
      className="overlay-scrim z-[80] bg-black/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="overlay-panel md:max-w-lg">
        <WidgetCloseButton onClick={dismiss} />
        <div className="overlay-body px-7 py-10 md:px-12 md:py-14">
          <WidgetFrame title={cookies.titolo} titleId={titleId}>
            <p className="text-sm leading-[1.8] text-ink/70">{conPeso(cookies.descrizione)}</p>

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
        <p className="mt-3 text-sm leading-relaxed text-ink/65">{conPeso(text)}</p>
      </div>
      {locked ? (
        <span className="shrink-0 bg-graphite px-2 py-1 text-[0.625rem] uppercase tracking-[0.16em] text-ember-pale">
          {lockedLabel}
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={title}
          onClick={() => onChange?.(!on)}
          className="cookie-switch mt-1"
        >
          <span className="cookie-switch__knob" />
        </button>
      )}
    </div>
  );
}