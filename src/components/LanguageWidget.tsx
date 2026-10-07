import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siteContent } from "../data/siteContent";
import { useLanguage } from "../context/LanguageContext";
import { findLanguage, languageLabel, SITE_LANGUAGES, SITE_SOURCE_LANG } from "../lib/language";
import { LanguageFlag } from "./LanguageFlag";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetFrame } from "./WidgetFrame";

const { lingua, nav } = siteContent;

type Props = {
  placement: "nav" | "footer" | "drawer";
};

function matchesQuery(query: string, label: string, name: string, code: string) {
  if (!query) return true;
  const hay = `${label} ${name} ${code}`.toLowerCase();
  return hay.includes(query);
}

export function LanguageWidget({ placement }: Props) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const current = language === SITE_SOURCE_LANG ? null : language;
  const titleId = useId();
  const searchId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focus = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(focus);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const compact = placement === "nav";
  const drawer = placement === "drawer";
  const active = current ? findLanguage(current) : null;
  const selectedLabel = languageLabel(language);
  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () => SITE_LANGUAGES.filter((lang) => matchesQuery(needle, lang.label, lang.name, lang.code)),
    [needle],
  );
  const showItalian = matchesQuery(needle, lingua.originale, "Italian", SITE_SOURCE_LANG);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={
          compact
            ? "flex h-10 w-10 shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
            : drawer
              ? "flex w-full items-center justify-center gap-3 py-4 text-center font-body text-[13px] font-bold uppercase not-italic leading-none tracking-[0.22em] text-ink/55 hover:text-ink"
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
              <div className="relative z-10 flex max-h-[min(90vh,42rem)] w-full max-w-md flex-col bg-ivory shadow-[0_24px_60px_rgba(43,37,35,0.18)]">
                <WidgetCloseButton
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                />
                <div className="shrink-0 px-7 pt-10 md:px-12 md:pt-14">
                  <WidgetFrame title={lingua.titolo} titleId={titleId}>
                    <p className="text-sm leading-[1.8] text-ink/70">{lingua.lead}</p>
                    <label className="mt-6 block" htmlFor={searchId}>
                      <span className="sr-only">{lingua.cerca}</span>
                      <input
                        ref={searchRef}
                        id={searchId}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={lingua.cerca}
                        autoComplete="off"
                        spellCheck={false}
                        className="w-full border-0 border-b border-ink/15 bg-transparent py-2.5 font-body text-sm text-ink outline-none placeholder:text-ink/30 focus:border-ink/40"
                      />
                    </label>
                  </WidgetFrame>
                </div>
                <ul className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 pb-10 md:px-12 md:pb-14">
                  {showItalian ? (
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
                  ) : null}
                  {filtered.map((lang) => (
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
                  <p className="shrink-0 px-7 pb-6 text-center text-[10px] uppercase tracking-[0.16em] text-sage md:px-12">
                    {active.label}
                  </p>
                ) : null}
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
      className={`flex w-full items-center gap-3 border-t border-ink/10 py-3.5 text-left text-sm ${
        selected ? "text-ink" : "text-ink/55 hover:text-ink"
      }`}
      onClick={onSelect}
      translate="no"
    >
      <LanguageFlag code={code} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  );
}
