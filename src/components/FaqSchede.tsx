import { useRef, useState } from "react";
import { conPeso } from "./Prosa";
import type { FaqVoce } from "./PageFaq";

type Props = {
  titolo: string;
  precedente: string;
  successiva: string;
  voci: readonly FaqVoce[];
};

/** Schede FAQ da sfogliare, una alla volta, dentro la sezione che le ospita. */
export function FaqSchede({ titolo, precedente, successiva, voci }: Props) {
  const nastro = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  if (!voci.length) return null;

  const vai = (verso: -1 | 1) => {
    const el = nastro.current;
    if (!el) return;
    const prossimo = Math.min(voci.length - 1, Math.max(0, indice + verso));
    const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: prossimo * el.clientWidth, behavior: riduci ? "auto" : "smooth" });
    setIndice(prossimo);
  };

  const allinea = () => {
    const el = nastro.current;
    if (!el || el.clientWidth <= 0) return;
    setIndice(Math.min(voci.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
  };

  return (
    <section className="mt-12 min-w-0 max-w-full" aria-label={titolo}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h3 className="font-display text-2xl font-normal leading-snug text-ink md:text-3xl">{titolo}</h3>
        <div className="flex items-center gap-3">
          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
            {String(indice + 1).padStart(2, "0")} / {String(voci.length).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={() => vai(-1)}
            disabled={indice === 0}
            aria-label={precedente}
            className="inline-flex h-12 w-12 items-center justify-center bg-ivory text-ink ring-1 ring-ink/15 transition-colors duration-200 hover:bg-mist disabled:cursor-not-allowed disabled:bg-ivory/20 disabled:text-on-ink/45 disabled:ring-ivory/25 disabled:opacity-100"
          >
            <Freccia verso={-1} />
          </button>
          <button
            type="button"
            onClick={() => vai(1)}
            disabled={indice === voci.length - 1}
            aria-label={successiva}
            className="inline-flex h-12 w-12 items-center justify-center bg-ivory text-ink ring-1 ring-ink/15 transition-colors duration-200 hover:bg-mist disabled:cursor-not-allowed disabled:bg-ivory/20 disabled:text-on-ink/45 disabled:ring-ivory/25 disabled:opacity-100"
          >
            <Freccia verso={1} />
          </button>
        </div>
      </div>
      <div className="mt-8 min-w-0 max-w-full overflow-hidden">
      <div
        ref={nastro}
        onScroll={allinea}
        className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-auto [scrollbar-width:none] [touch-action:pan-x_pan-y] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
      >
        {voci.map((voce, i) => (
          <article key={voce.domanda} className="depth-panel w-full min-w-full shrink-0 snap-start bg-paper p-8 md:p-10">
            <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h4 className="mt-4 font-display text-xl font-normal leading-snug text-ink md:text-2xl">{voce.domanda}</h4>
            <p className="section-prose mt-6">{conPeso(voce.risposta)}</p>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}

function Freccia({ verso }: { verso: -1 | 1 }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d={verso < 0 ? "M14.5 5.5 8 12l6.5 6.5" : "M9.5 5.5 16 12l-6.5 6.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
