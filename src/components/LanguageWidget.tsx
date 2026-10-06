import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siteContent } from "../data/siteContent";
import { useLanguage } from "../context/LanguageContext";
import { languageLabel, SITE_LANGUAGES, SITE_SOURCE_LANG } from "../lib/language";
import { LanguageFlag } from "./LanguageFlag";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetFrame } from "./WidgetFrame";

const { lingua, nav } = siteContent;

type Props = {
  placement: "nav" | "footer" | "drawer";
};

export function LanguageWidget({ placement }: Props) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = language === SITE_SOURCE_LANG ? null : language;
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

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
  const drawer = placement === "drawer";
  const active = current ? SITE_LANGUAGES.find((lang) => lang.code === current) : null;
  const selectedLabel = languageLabel(language);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={
          compact
            ? "flex h-10 w-10 shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
            : drawer
              ? "flex w-full items-center justify-center gap-3 py-4 text-center font-body text-[11px] font-semibold uppercase not-italic tracking-[0.18em] text-ink/55 hover:text-ink"
              : "inline-flex items-center gap-2 uppercase tracking-[0.16em] hover:text-ink"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${nav.lingua}: ${selectedLabel}`}
        translate="no"
        onClick={() => setOpen(true)}
      >
        <LanguageFlag
          code={language}
          className={compact ? "h-[1.05rem] w-[1.55rem]" : drawer ? "h-5 w-7" : "h-4 w-6"}
        />
        {compact ? (
          <span className="sr-only">{selectedLabel}</span>
        ) : drawer ? (
          <>
            <span>{nav.lingua}</span>
            <span className="text-ink/40">{selectedLabel}</span>
          </>
        ) : (
          nav.lingua
        )}
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
              <div className="relative z-10 w-full max-w-md bg-ivory shadow-[0_24px_60px_rgba(43,37,35,0.18)]">
                <WidgetCloseButton
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                />
                <div className="max-h-[min(90vh,40rem)] overflow-y-auto px-7 py-10 md:px-12 md:py-14">
                  <WidgetFrame title={lingua.titolo} titleId={titleId}>
                    <p className="text-sm leading-[1.8] text-ink/70">{lingua.lead}</p>
                    <ul className="mt-8 divide-y divide-ink/10">
                      <li>
                        <LanguageOption
                          code={SITE_SOURCE_LANG}
                          label={lingua.originale}
                          selected={!current}
                          onSelect={() => {
                            setLanguage(SITE_SOURCE_LANG);
                            setOpen(false);
                          }}
                        />
                      </li>
                      {SITE_LANGUAGES.map((lang) => (
                        <li key={lang.code}>
                          <LanguageOption
                            code={lang.code}
                            label={lang.label}
                            selected={current === lang.code}
                            onSelect={() => {
                              setLanguage(lang.code);
                              setOpen(false);
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                    {active ? (
                      <p className="mt-6 text-[10px] uppercase tracking-[0.16em] text-sage">{active.label}</p>
                    ) : null}
                  </WidgetFrame>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function LanguageOption({
  code,
  label,
  selected,
  onSelect,
}: {
  code: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 py-3.5 text-left text-sm ${
        selected ? "text-ink" : "text-ink/55 hover:text-ink"
      }`}
      onClick={onSelect}
    >
      <LanguageFlag code={code} />
      <span className="flex-1">{label}</span>
    </button>
  );
}
