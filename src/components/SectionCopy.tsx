import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Blocco editoriale: tipografia raccolta.
 * Il filetto è spezzato — testa spessa (SectionCopyHead), poi un tratto per paragrafo.
 */
export function SectionCopy({ children, className = "" }: Props) {
  return <div className={`section-copy ${className}`.trim()}>{children}</div>;
}

/** Kicker + titolo: un solo filetto spesso, spezzato prima della prosa. */
export function SectionCopyHead({ children, className = "" }: Props) {
  return <div className={`section-copy-head ${className}`.trim()}>{children}</div>;
}
