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
      className="overlay-scrim z-[80] bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className={`overlay-panel ${
          xxl
            ? "md:max-h-[min(92vh,56rem)] md:max-w-5xl"
            : xl
              ? "md:max-w-3xl"
              : wide
                ? "md:max-w-2xl"
                : "md:max-w-lg"
        }`}
      >
        {onClose ? <WidgetCloseButton onClick={onClose} /> : null}
        <div className="overlay-body px-7 py-10 md:px-12 md:py-14 [scrollbar-gutter:stable]">
          <WidgetFrame title={title} titleId={labelledBy}>
            {children}
          </WidgetFrame>
        </div>
        {footer ? (
          <div className="relative z-[200] shrink-0 overflow-visible border-t border-ink/10 bg-[var(--neu-face)] px-7 py-5 md:px-12 md:py-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
