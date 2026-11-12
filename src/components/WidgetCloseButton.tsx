import { siteContent } from "../data/siteContent";

const { nav } = siteContent;

type Props = {
  onClick: () => void;
  /** `panel` resta fisso in alto a destra; `inline` si usa in barre già posizionate. */
  placement?: "panel" | "inline";
  className?: string;
};

const mark =
  "widget-close flex h-12 w-12 shrink-0 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/** Chiusura uniforme di widget e modali: glifo soft UI, tap 48px. */
export function WidgetCloseButton({ onClick, placement = "panel", className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={nav.chiudi}
      className={`${mark} ${
        placement === "panel"
          ? "absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 md:right-4 md:top-4"
          : ""
      } ${className}`}
    >
      <CloseMark />
    </button>
  );
}

function CloseMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}
