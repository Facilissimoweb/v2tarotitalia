import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Foglio dopo la hero.
 * Il guscio esterno resta nel flusso (niente transform): così IntersectionObserver
 * e whileInView misurano la posizione reale. Sfondo e padding stanno sul foglio
 * interno, che è l’unico a sollevarsi — altrimenti si muoveva solo il testo
 * su un pannello già fermo, e l’effetto risultava invisibile.
 */
export function StackSheet({ children, className = "", as = "section", id }: Props) {
  const reduce = useReducedMotion();
  const Tag = as === "div" ? "div" : "section";

  return (
    <Tag id={id} className="stack-sheet">
      <motion.div
        className={`stack-sheet-lift${className ? ` ${className}` : ""}`}
        initial={reduce ? false : { y: 120, opacity: 0 }}
        whileInView={reduce ? undefined : { y: 0, opacity: 1 }}
        viewport={{ once: true, amount: "some", margin: "0px 0px -12% 0px" }}
        transition={{ duration: 0.9, ease }}
      >
        {children}
      </motion.div>
    </Tag>
  );
}

export function StackDeck({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`stack-deck${className ? ` ${className}` : ""}`}>{children}</div>;
}
