import { useEffect, useId, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { siteContent } from "../data/siteContent";
import { a11y, isDefault, SIZE_STEPS, useAccessibility } from "../lib/accessibility";
import { Button } from "./Button";
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

type TriggerProps = { className?: string };

/** Pulsante di apertura (Header, menu mobile). Il pannello è unico, montato in `App`. */
export function AccessibilityTrigger({ className = "" }: TriggerProps) {
  const { open } = useAccessibility();
  return (
    <button
      type="button"
      className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink ${className}`}
      aria-label={copy.trigger}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={open ? "pannello-accessibilita" : undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        lastTrigger = event.currentTarget;
        a11y.setOpen(!open);
      }}
    >
      <AccessibilityIcon />
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
        className={`relative h-6 w-11 shrink-0 ring-1 transition-colors duration-200 ${
          checked ? "bg-ink ring-ink" : "bg-mist ring-ink/35"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 transition-[left,background-color] duration-200 ${
            checked ? "left-[1.375rem] bg-ivory" : "left-0.5 bg-ink/55"
          }`}
        />
      </span>
    </button>
  );
}

const stepBtn =
  "flex h-12 flex-1 items-center justify-center bg-paper font-display text-lg text-ink ring-1 ring-ink/20 transition-colors duration-200 hover:bg-mist disabled:opacity-35 disabled:hover:bg-paper";

/** Pannello di facilitazione visiva: non modale, così le modifiche si vedono subito sulla pagina. */
export function AccessibilityPanel() {
  const prefs = useAccessibility();
  const { open, size, contrast, font, spacing } = prefs;
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
      className="a11y-panel fixed inset-x-3 top-[88px] z-[75] max-h-[calc(100dvh-104px)] overflow-y-auto overscroll-contain bg-ivory shadow-[0_24px_60px_rgba(43,37,35,0.22)] ring-1 ring-ink/15 outline-none sm:inset-x-auto sm:right-4 sm:w-[22rem] xl:right-6 xl:top-[128px] xl:max-h-[calc(100dvh-144px)]"
    >
      <WidgetCloseButton onClick={closePanel} />
      <div className="px-6 pb-6 pt-8">
        <WidgetBrandMark size="sm" />
        <h2 id={titleId} className="mt-4 text-center font-display text-xl font-light leading-snug text-ink">
          {copy.titolo}
        </h2>

        <div className="mt-6">
          <p className="label-kicker">{copy.testo}</p>
          <div className="mt-3 flex items-stretch gap-2">
            <button
              type="button"
              className={stepBtn}
              aria-label={copy.riduci}
              disabled={size <= 0}
              onClick={() => a11y.setSize(size - 1)}
            >
              <span aria-hidden>A−</span>
            </button>
            <output
              aria-live="polite"
              className="flex w-16 shrink-0 items-center justify-center font-display text-base text-ink"
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
              <span aria-hidden>A+</span>
            </button>
          </div>
        </div>

        <div className="mt-5">
          <Switch checked={contrast} label={copy.contrasto} note={copy.contrastoNota} onToggle={() => a11y.toggle("contrast")} />
          <Switch checked={font} label={copy.font} note={copy.fontNota} onToggle={() => a11y.toggle("font")} />
          <Switch
            checked={spacing}
            label={copy.spaziatura}
            note={copy.spaziaturaNota}
            onToggle={() => a11y.toggle("spacing")}
          />
        </div>

        <Button variant="ghost" className="mt-2 w-full" disabled={isDefault(prefs)} onClick={() => a11y.reset()}>
          {copy.ripristina}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
