import { useEffect, useId, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";
import { WidgetFrame } from "./WidgetFrame";

const { nav } = siteContent;

type Props = {
  title: string;
  titleId?: string;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
  xl?: boolean;
};

/** Overlay Lumiere: logo, Tarot Italia, titolo. Chiusura opzionale. */
export function WidgetDialog({ title, titleId, onClose, children, wide, xl }: Props) {
  const fallbackId = useId();
  const labelledBy = titleId ?? fallbackId;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/35 p-5 backdrop-blur-md md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className={`relative max-h-[min(92vh,56rem)] w-full overflow-y-auto bg-ivory px-7 py-10 shadow-[0_24px_60px_rgba(43,37,35,0.18)] md:px-12 md:py-14 ${
          xl ? "max-w-3xl" : wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={nav.chiudi}
            className="absolute right-4 top-4 p-2 text-ink/40 transition-colors hover:text-ink"
          >
            <CloseIcon />
          </button>
        ) : null}
        <WidgetFrame title={title} titleId={labelledBy}>
          {children}
        </WidgetFrame>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}
