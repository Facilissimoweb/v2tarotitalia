import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Colonne da md in su. */
  cols?: 2 | 3;
  className?: string;
};

/**
 * Griglia editoriale con filetti verticali sottili (respiro visivo alla Trigger).
 * Su mobile resta una colonna senza bordi.
 */
export function SectionRails({ children, cols = 2, className = "" }: Props) {
  return (
    <div
      className={`section-rails section-rails--${cols} ${className}`.trim()}
      data-section-rails
    >
      {children}
    </div>
  );
}
