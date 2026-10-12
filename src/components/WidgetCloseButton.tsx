import { siteContent } from "../data/siteContent";

const { nav } = siteContent;

type Props = {
  onClick: () => void;
  /** `panel` resta fisso in alto a destra; `inline` si usa in barre già posizionate. */
  placement?: "panel" | "inline";
  className?: string;
};

const mark =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-ivory shadow-[0_8px_18px_rgba(43,37,35,0.28)] ring-2 ring-ink transition-[transform,background-color] duration-200 hover:scale-[1.05] hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

/** Chiusura uniforme di widget e modali: cerchio ink, X ivory marcata, tap 48px. */
export function WidgetCloseButton({ onClick, placement = "panel", className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={nav.chiudi}
      className={`${mark} ${
        placement === "panel" ? "absolute right-3 top-3 z-20 md:right-4 md:top-4" : ""
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
