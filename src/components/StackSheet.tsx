import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
  /** Conservato per compatibilità con le pagine. */
  label?: string;
};

export function StackSheet({ children, className = "", as = "section", id }: Props) {
  const Tag = as === "div" ? "div" : "section";
  return (
    <Tag id={id} className={className ? `sheet-plane ${className}` : "sheet-plane"}>
      {children}
    </Tag>
  );
}

type DeckProps = {
  children: ReactNode;
  className?: string;
  flush?: boolean;
};

export function StackDeck({ children, className = "" }: DeckProps) {
  if (!className) return children;
  return <div className={className}>{children}</div>;
}
