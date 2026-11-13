import { useId, useState, type ReactNode } from "react";
import { siteContent } from "../data/siteContent";

const { fold } = siteContent;

type Props = {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Testo visibile + approfondimento a tendina.
 * Freccia in oro antico nello scacco nero: ruota all’apertura.
 */
export function TextFold({ summary, children, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={className}>
      {summary}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? fold.chiudi : fold.apri}
        onClick={() => setOpen((value) => !value)}
        className="mt-4 flex h-10 w-10 items-center justify-center bg-graphite text-ember-pale transition-colors duration-200 hover:bg-graphite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-pale"
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={`h-4 w-4 origin-center transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            d="M3 5.5 8 10.5 13 5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </button>
      <div
        id={panelId}
        inert={!open}
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
