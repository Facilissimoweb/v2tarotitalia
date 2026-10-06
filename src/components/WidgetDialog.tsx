import { useEffect, useId, type ReactNode } from "react";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetFrame } from "./WidgetFrame";

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
        className={`relative w-full bg-ivory shadow-[0_24px_60px_rgba(43,37,35,0.18)] ${
          xl ? "max-w-3xl" : wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        {onClose ? <WidgetCloseButton onClick={onClose} /> : null}
        <div className="max-h-[min(92vh,56rem)] overflow-y-auto px-7 py-10 md:px-12 md:py-14">
          <WidgetFrame title={title} titleId={labelledBy}>
            {children}
          </WidgetFrame>
        </div>
      </div>
    </div>
  );
}
