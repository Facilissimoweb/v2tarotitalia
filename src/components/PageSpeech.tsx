import { siteContent } from "../data/siteContent";
import { pageSpeech, usePageSpeech } from "../lib/pageSpeech";

const { accessibilita: copy } = siteContent;

const cell =
  "flex h-12 flex-1 items-center justify-center bg-[#111111] text-[#d7f713] ring-1 ring-[#d7f713] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f713] disabled:opacity-35 disabled:hover:opacity-35";

function SpeakerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" strokeLinejoin="round" />
      <path d="M16 9.5a3.2 3.2 0 0 1 0 5" strokeLinecap="round" />
      <path d="M18.2 7.2a6 6 0 0 1 0 9.6" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <path d="M2.4 1.2v9.6L10.4 6 2.4 1.2Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <rect x="2.4" y="1.6" width="2.4" height="8.8" />
      <rect x="7.2" y="1.6" width="2.4" height="8.8" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <rect x="2.2" y="2.2" width="7.6" height="7.6" />
    </svg>
  );
}

/** Primo comando da tastiera: ascolta o interrompe, senza aprire il pannello. */
export function PageSpeechSkipLink() {
  const { status } = usePageSpeech();
  const active = status === "speaking" || status === "paused";
  if (status === "unsupported") return null;
  return (
    <button
      type="button"
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:bg-[#111111] focus:px-4 focus:py-3 focus:text-[0.6875rem] focus:font-bold focus:uppercase focus:tracking-[0.16em] focus:text-[#d7f713] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#d7f713]"
      onClick={() => pageSpeech.toggle()}
    >
      {active ? copy.ferma : copy.ascolta}
    </button>
  );
}

/** Icona discreta in navbar (desktop). */
export function PageSpeechTrigger({ className = "" }: { className?: string }) {
  const { status } = usePageSpeech();
  const active = status === "speaking" || status === "paused";
  if (status === "unsupported") return null;
  return (
    <button
      type="button"
      className={`${className} ${active ? "text-[#d7f713]" : ""}`.trim()}
      aria-label={active ? copy.ferma : copy.ascolta}
      aria-pressed={active}
      onClick={() => pageSpeech.toggle()}
    >
      <SpeakerIcon />
    </button>
  );
}

/** Controlli nel pannello Accessibilità: ascolta, pausa, interrompi. */
export function PageSpeechControls() {
  const { status, message } = usePageSpeech();
  const unsupported = status === "unsupported";
  const speaking = status === "speaking";
  const paused = status === "paused";
  const live = speaking ? copy.inCorso : paused ? copy.inPausa : message === "empty" ? copy.vuota : "";

  return (
    <div className="mt-6" data-nospeech>
      <p className="label-kicker">{copy.lettura}</p>
      <p className="mt-2 text-xs leading-snug text-ink/65">{unsupported ? copy.nonDisponibile : copy.letturaNota}</p>
      <div className="mt-3 flex items-stretch gap-2">
        <button
          type="button"
          className={cell}
          disabled={unsupported || speaking}
          aria-label={paused ? copy.riprendi : copy.ascolta}
          onClick={() => (paused ? pageSpeech.resume() : pageSpeech.play())}
        >
          <PlayIcon />
        </button>
        <button
          type="button"
          className={cell}
          disabled={unsupported || !speaking}
          aria-label={copy.pausa}
          onClick={() => pageSpeech.pause()}
        >
          <PauseIcon />
        </button>
        <button
          type="button"
          className={cell}
          disabled={unsupported || (!speaking && !paused)}
          aria-label={copy.ferma}
          onClick={() => pageSpeech.stop()}
        >
          <StopIcon />
        </button>
      </div>
      <p id="lettura-vocale-stato" className="mt-2 min-h-[1rem] text-xs text-ink/65" aria-live="polite">
        {live}
      </p>
    </div>
  );
}
