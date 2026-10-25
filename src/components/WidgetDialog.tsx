import { useEffect, useId, type ReactNode } from "react";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetFrame } from "./WidgetFrame";

type Props = {
  title: string;
  titleId?: string;
  onClose?: () => void;
  children: ReactNode;
  /** Contenuto fuori dallo scroll del pannello. */
  footer?: ReactNode;
  wide?: boolean;
  xl?: boolean;
  xxl?: boolean;
};

/** Overlay Lumiere: logo, Tarot Italia, titolo. Chiusura opzionale. */
export function WidgetDialog({ title, titleId, onClose, children, footer, wide, xl, xxl }: Props) {
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/45 p-5 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className={`relative flex max-h-[min(92vh,56rem)] w-full flex-col bg-ivory shadow-[0_24px_60px_rgba(43,37,35,0.18)] ${
          xxl ? "max-w-5xl" : xl ? "max-w-3xl" : wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        {onClose ? <WidgetCloseButton onClick={onClose} /> : null}
        <div className="min-h-0 flex-1 overflow-x-visible overflow-y-auto px-7 py-10 md:px-12 md:py-14 [scrollbar-gutter:stable]">
          <WidgetFrame title={title} titleId={labelledBy}>
            {children}
          </WidgetFrame>
        </div>
        {footer ? (
          <div className="relative z-[200] shrink-0 overflow-visible border-t border-ink/10 bg-ivory px-7 py-5 md:px-12 md:py-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
