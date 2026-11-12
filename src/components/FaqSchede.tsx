import { conPeso } from "./Prosa";
import type { FaqVoce } from "./PageFaq";

type Props = {
  titolo: string;
  /** Conservati per compatibilità chiamate; il layout a file non usa il carosello. */
  precedente?: string;
  successiva?: string;
  voci: readonly FaqVoce[];
};

/** FAQ a file tipografici (ritmo Gazette), senza carousel a schede. */
export function FaqSchede({ titolo, voci }: Props) {
  if (!voci.length) return null;

  return (
    <section className="edition-section !pt-0" aria-labelledby="faq-edition-title">
      <h2 id="faq-edition-title" className="edition-section__title">
        {titolo}
      </h2>
      <ol className="edition-leaders">
        {voci.map((voce, i) => (
          <li key={voce.domanda}>
            <div className="edition-leaders__row">
              <span className="edition-leaders__n">{String(i + 1).padStart(2, "0")}</span>
              <span className="edition-leaders__title">{voce.domanda}</span>
              <p className="edition-note__body mt-3 w-full basis-full pl-[2.65rem] sm:pl-0">
                {conPeso(voce.risposta)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
