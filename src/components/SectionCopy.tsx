import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Blocco editoriale: tipografia raccolta.
 * Blocco editoriale: kicker + titolo + prosa (senza filetti verticali).
 */
export function SectionCopy({ children, className = "" }: Props) {
  return <div className={`section-copy ${className}`.trim()}>{children}</div>;
}

/** Kicker + titolo della sezione. */
export function SectionCopyHead({ children, className = "" }: Props) {
  return <div className={`section-copy-head ${className}`.trim()}>{children}</div>;
}
