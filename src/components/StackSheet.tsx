import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
};

/**
 * Foglio dopo la hero: sale dal basso coprendo il blocco precedente, legato allo scroll della finestra.
 * Non usa view-timeline CSS (gli overflow dei genitori la facevano finire subito).
 */
export function StackSheet({ children, className = "", as = "section", id }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.28"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [180, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.35, 1]);

  const Tag = as === "div" ? motion.div : motion.section;

  return (
    <Tag
      ref={ref}
      id={id}
      className={`stack-sheet${className ? ` ${className}` : ""}`}
      style={reduce ? undefined : { y, opacity }}
    >
      {children}
    </Tag>
  );
}

export function StackDeck({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`stack-deck${className ? ` ${className}` : ""}`}>{children}</div>;
}
