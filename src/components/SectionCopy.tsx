import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Blocco editoriale con filetto sinistro e tipografia raccolta
 * (kicker, titolo, prosa di sezione).
 */
export function SectionCopy({ children, className = "" }: Props) {
  return <div className={`section-copy ${className}`.trim()}>{children}</div>;
}
