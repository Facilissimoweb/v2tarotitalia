import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
};

function supportsViewTimeline() {
  return typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()");
}

/**
 * Foglio di contenuto dopo la hero: emerge dal basso seguendo lo scroll.
 * Non avvolge caroselli touch né form lunghe. Le interazioni interne restano intatte.
 */
export function StackSheet({ children, className = "", as: Tag = "section", id }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    if (supportsViewTimeline()) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} id={id} className={`stack-sheet${className ? ` ${className}` : ""}`}>
      {children}
    </Tag>
  );
}

export function StackDeck({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`stack-deck${className ? ` ${className}` : ""}`}>{children}</div>;
}
