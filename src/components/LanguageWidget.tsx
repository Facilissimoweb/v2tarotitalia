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
  className?: string;
  flagClassName?: string;
  /** Sul desktop la navbar apre il pannello laterale: il clic non apre il dialogo. */
  onActivate?: () => void;
  expanded?: boolean;
  controls?: string;
  /** Etichetta testuale nella rail mobile: rende cliccabile tutta la riga. */
  railLabel?: string;
};

function matchesQuery(query: string, label: string, name: string, code: string) {
  if (!query) return true;
  const hay = `${label} ${name} ${code}`.toLowerCase();
  return hay.includes(query);
}

export function LanguageWidget({
  placement,
  className = "",
  flagClassName,
  onActivate,
  expanded,
  controls,
  railLabel,
}: Props) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialog = !onActivate;

  useEffect(() => {
    if (!open || !dialog) return;
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
  }, [open, dialog]);

  const compact = placement === "nav" && !railLabel;
  const drawer = placement === "drawer";
  const selectedLabel = languageLabel(language);
  const flagClass =
    flagClassName ||
    (compact ? "h-[1.35rem] w-8" : drawer ? "h-5 w-7" : railLabel ? "h-3 w-[1.05rem]" : "h-4 w-6");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={
          railLabel
            ? `side-rail-item ${className}`.trim()
            : compact
              ? `ti-btn ti-btn-icon flex h-12 ${className || "w-12"} shrink-0 items-center justify-center text-inherit transition-opacity hover:opacity-70`
              : drawer
                ? `flex w-full items-center justify-center gap-3 py-4 text-center font-body text-[0.8125rem] font-medium uppercase not-italic leading-none tracking-[0.16em] ${className || "text-ink/55 hover:text-ink"}`
                : `inline-flex items-center gap-2 text-[0.8125rem] uppercase tracking-[0.16em] text-inherit shadow-none hover:text-white ${className}`
        }
        aria-haspopup="dialog"
        aria-expanded={onActivate ? Boolean(expanded) : open}
        aria-controls={controls}
        aria-label={`${nav.lingua}: ${selectedLabel}`}
        translate="no"
        onClick={() => {
          if (onActivate) onActivate();
          else setOpen(true);
        }}
      >
        {railLabel ? (
          <>
            <span className="side-rail-icon">
              <LanguageFlag code={language} className={flagClass} />
            </span>
            <span className="side-rail-label">{railLabel}</span>
          </>
        ) : (
          <>
            <LanguageFlag code={language} className={flagClass} />
            {compact ? (
              <span className="sr-only">{selectedLabel}</span>
            ) : drawer ? (
              <>
                <span>{nav.lingua}</span>
                <span className="opacity-50">{selectedLabel}</span>
              </>
            ) : (
              nav.lingua
            )}
          </>
        )}
      </button>

      {dialog && open
        ? createPortal(
            <div className="overlay-scrim z-[85] bg-black/55" role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <button
                type="button"
                className="absolute inset-0 hidden cursor-default md:block"
                aria-label={nav.chiudi}
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              />
              <div className="overlay-panel relative z-10 md:max-w-md">
                <WidgetCloseButton
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                />
                <div className="overlay-body px-7 py-10 md:px-12 md:py-14">
                  <WidgetFrame title={lingua.titolo} titleId={titleId}>
                    <LanguageChoices autoFocus onSelect={() => setOpen(false)} />
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

export function LanguageChoices({ onSelect, autoFocus = false }: { onSelect?: () => void; autoFocus?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [query, setQuery] = useState("");
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const current = language === SITE_SOURCE_LANG ? null : language;
  const active = current ? findLanguage(current) : null;
  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () => SITE_LANGUAGES.filter((lang) => matchesQuery(needle, lang.label, lang.name, lang.code)),
    [needle],
  );
  const showItalian = matchesQuery(needle, lingua.originale, "Italian", SITE_SOURCE_LANG);

  useEffect(() => {
    if (!autoFocus) return;
    const focus = window.setTimeout(() => searchRef.current?.focus(), 40);
    return () => window.clearTimeout(focus);
  }, [autoFocus]);

  function choose(code: string) {
    setLanguage(code);
    onSelect?.();
  }

  return (
    <div>
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
      <ul className="mt-2">
        {showItalian ? (
          <li>
            <LanguageOption
              code={SITE_SOURCE_LANG}
              label={lingua.originale}
              selected={!current}
              onSelect={() => choose(SITE_SOURCE_LANG)}
            />
          </li>
        ) : null}
        {filtered.map((lang) => (
          <li key={lang.code}>
            <LanguageOption
              code={lang.code}
              label={lang.label}
              selected={current === lang.code}
              onSelect={() => choose(lang.code)}
            />
          </li>
        ))}
      </ul>
      {active ? (
        <p className="mt-4 text-center text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">{active.label}</p>
      ) : null}
    </div>
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
