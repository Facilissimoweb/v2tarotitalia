import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siteContent } from "../data/siteContent";
import {
  SITE_LANGUAGES,
  applyLanguage,
  resetLanguage,
  restoreLanguage,
  storedLanguage,
} from "../lib/translate";
import { WidgetFrame } from "./WidgetFrame";

const { lingua, nav } = siteContent;

type Props = {
  placement: "nav" | "footer";
};

export function LanguageWidget({ placement }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCurrent(storedLanguage());
    restoreLanguage();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const compact = placement === "nav";
  const active = current ? SITE_LANGUAGES.find((lang) => lang.code === current) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={
          compact
            ? "flex h-10 w-10 shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
            : "uppercase tracking-[0.16em] hover:text-ink"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={nav.lingua}
        translate="no"
        onClick={() => setOpen(true)}
      >
        {compact ? <GlobeIcon /> : nav.lingua}
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/35 p-5 backdrop-blur-md md:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label={nav.chiudi}
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              />
              <div className="relative max-h-[min(90vh,40rem)] w-full max-w-md overflow-y-auto bg-ivory px-7 py-10 shadow-[0_24px_60px_rgba(43,37,35,0.18)] md:px-12 md:py-14">
                <button
                  type="button"
                  className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center text-ink"
                  aria-label={nav.chiudi}
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                >
                  <CloseIcon />
                </button>
                <WidgetFrame title={lingua.titolo} titleId={titleId}>
                  <p className="text-sm leading-[1.8] text-ink/70">{lingua.lead}</p>
                  <ul className="mt-8 divide-y divide-ink/10">
                    <li>
                      <button
                        type="button"
                        className={`flex w-full items-center justify-between py-3.5 text-left text-sm ${
                          !current ? "text-ink" : "text-ink/55 hover:text-ink"
                        }`}
                        onClick={() => {
                          resetLanguage();
                          setCurrent(null);
                          setOpen(false);
                        }}
                      >
                        <span>{lingua.originale}</span>
                        {!current ? <span className="text-[10px] uppercase tracking-[0.16em] text-sage">IT</span> : null}
                      </button>
                    </li>
                    {SITE_LANGUAGES.map((lang) => {
                      const selected = current === lang.code;
                      return (
                        <li key={lang.code}>
                          <button
                            type="button"
                            className={`flex w-full items-center justify-between py-3.5 text-left text-sm ${
                              selected ? "text-ink" : "text-ink/55 hover:text-ink"
                            }`}
                            onClick={() => {
                              void applyLanguage(lang.code);
                              setCurrent(lang.code);
                              setOpen(false);
                            }}
                          >
                            <span>{lang.label}</span>
                            {selected ? (
                              <span className="text-[10px] uppercase tracking-[0.16em] text-sage">
                                {lang.code}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {active ? (
                    <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-sage">{active.label}</p>
                  ) : null}
                </WidgetFrame>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.8 12 H20.2 M12 3.8 C9.4 6.4 8.2 9.2 8.2 12 C8.2 14.8 9.4 17.6 12 20.2 M12 3.8 C14.6 6.4 15.8 9.2 15.8 12 C15.8 14.8 14.6 17.6 12 20.2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}
