import { useEffect, useId, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { siteContent } from "../data/siteContent";
import { a11y, isDefault, SIZE_STEPS, useAccessibility } from "../lib/accessibility";
import { Button } from "./Button";
import { PageSpeechControls } from "./PageSpeech";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetBrandMark } from "./WidgetFrame";

const { accessibilita: copy } = siteContent;

/** Ultimo pulsante che ha aperto il pannello: riceve il focus alla chiusura. */
let lastTrigger: HTMLElement | null = null;

function closePanel() {
  a11y.setOpen(false);
  lastTrigger?.focus();
}

/** Icona universale di accessibilità: figura umana in un cerchio. */
function AccessibilityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="8.75" />
      <circle cx="12" cy="7.9" r="1.1" fill="currentColor" stroke="none" />
      <path d="M7.4 10.3 L12 11.1 L16.6 10.3 M12 11.1 V14.2 M12 14.2 L9.8 17.4 M12 14.2 L14.2 17.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type TriggerProps = {
  className?: string;
  /** Sul desktop la navbar apre il pannello laterale: il clic non apre il dialogo intero. */
  onActivate?: () => void;
  expanded?: boolean;
  controls?: string;
  /** Etichetta testuale nella rail mobile: rende cliccabile tutta la riga. */
  railLabel?: string;
};

/** Pulsante di apertura (Header, menu mobile). Il pannello è unico, montato in `App`. */
export function AccessibilityTrigger({ className = "", onActivate, expanded, controls, railLabel }: TriggerProps) {
  const { open } = useAccessibility();
  const slide = Boolean(onActivate);
  return (
    <button
      type="button"
      className={
        railLabel
          ? `side-rail-item ${className}`.trim()
          : className ||
            "flex h-[40px] w-[40px] shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
      }
      aria-label={copy.trigger}
      aria-haspopup="dialog"
      aria-expanded={slide ? Boolean(expanded) : open}
      aria-controls={slide ? controls : open ? "pannello-accessibilita" : undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (onActivate) {
          onActivate();
          return;
        }
        lastTrigger = event.currentTarget;
        a11y.setOpen(!open);
      }}
    >
      {railLabel ? (
        <>
          <span className="side-rail-icon">
            <AccessibilityIcon />
          </span>
          <span className="side-rail-label">{railLabel}</span>
        </>
      ) : (
        <AccessibilityIcon />
      )}
    </button>
  );
}

function Switch({
  checked,
  label,
  note,
  onToggle,
}: {
  checked: boolean;
  label: string;
  note: string;
  onToggle: () => void;
}) {
  const noteId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={noteId}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 border-t border-ink/10 py-4 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span id={noteId} className="mt-1 block text-xs leading-snug text-ink/65">
          {note}
        </span>
      </span>
      <span
        aria-hidden
        className={`relative h-6 w-11 shrink-0 transition-colors duration-200 ${
          checked ? "bg-ember" : "bg-plate"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 transition-[left,background-color] duration-200 ${
            checked ? "left-[1.375rem] bg-ivory" : "left-0.5 bg-ivory"
          }`}
        />
      </span>
    </button>
  );
}

const stepBtn =
  "flex min-h-14 flex-1 items-center justify-center bg-graphite px-2 text-center text-[0.6875rem] font-bold uppercase leading-tight tracking-[0.12em] text-ink transition-colors duration-200 hover:bg-[#2a2623] disabled:opacity-35";

/** Controlli della facilitazione: usati nel pannello intero e nel cassetto desktop. */
export function AccessibilityControls() {
  const prefs = useAccessibility();
  const { size, contrast, font, spacing } = prefs;

  return (
    <>
      <div>
        <p className="label-kicker">{copy.testo}</p>
        <div className="mt-3 flex items-stretch gap-2">
          <button
            type="button"
            className={stepBtn}
            aria-label={copy.riduci}
            disabled={size <= 0}
            onClick={() => a11y.setSize(size - 1)}
          >
            {copy.riduci}
          </button>
          <output
            aria-live="polite"
            className="flex w-16 shrink-0 items-center justify-center bg-ivory font-display text-lg text-ink"
          >
            {SIZE_STEPS[size]}%
          </output>
          <button
            type="button"
            className={stepBtn}
            aria-label={copy.aumenta}
            disabled={size >= SIZE_STEPS.length - 1}
            onClick={() => a11y.setSize(size + 1)}
          >
            {copy.aumenta}
          </button>
        </div>
      </div>

      <PageSpeechControls />

      <div className="mt-5">
        <Switch checked={contrast} label={copy.contrasto} note={copy.contrastoNota} onToggle={() => a11y.toggle("contrast")} />
        <Switch checked={font} label={copy.font} note={copy.fontNota} onToggle={() => a11y.toggle("font")} />
        <Switch checked={spacing} label={copy.spaziatura} note={copy.spaziaturaNota} onToggle={() => a11y.toggle("spacing")} />
      </div>

      <Button className="mt-8 w-full" disabled={isDefault(prefs)} onClick={() => a11y.reset()}>
        {copy.ripristina}
      </Button>
    </>
  );
}

/** Pannello di facilitazione visiva: non modale, così le modifiche si vedono subito sulla pagina. */
export function AccessibilityPanel() {
  const { open } = useAccessibility();
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      id="pannello-accessibilita"
      ref={panel}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="a11y-panel overlay-panel fixed left-1/2 top-1/2 z-[75] w-[calc(100%-1.4rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain outline-none md:left-auto md:right-4 md:top-[88px] md:h-auto md:max-h-[calc(100dvh-104px)] md:w-[22rem] md:max-w-[22rem] md:translate-x-0 md:translate-y-0 xl:right-6 xl:top-[128px] xl:max-h-[calc(100dvh-144px)]"
    >
      <WidgetCloseButton onClick={closePanel} />
      <div className="px-6 pb-6 pt-8">
        <WidgetBrandMark size="sm" />
        <h2 id={titleId} className="mt-4 text-center font-display text-xl leading-snug text-ink">
          {copy.titolo}
        </h2>

        <AccessibilityControls />
      </div>
    </div>,
    document.body,
  );
}
