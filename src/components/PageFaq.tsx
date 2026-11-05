import { Reveal } from "./Reveal";
import { Kicker } from "./Button";
import { StackSheet } from "./StackSheet";

export type FaqVoce = {
  domanda: string;
  risposta: string;
};

type Props = {
  kicker: string;
  titolo: string;
  voci: readonly FaqVoce[];
};

/** FAQ visibili, allineate 1:1 al JSON-LD FAQPage. */
export function PageFaq({ kicker, titolo, voci }: Props) {
  if (!voci.length) return null;

  return (
    <StackSheet className="bg-ivory px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <Kicker>{kicker}</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-6 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">{titolo}</h2>
        </Reveal>
        <dl className="mt-16 divide-y divide-ink/10 border-y border-ink/10">
          {voci.map((voce, i) => (
            <Reveal key={voce.domanda} delay={Math.min(i * 60, 240)}>
              <div className="py-10">
                <dt>
                  <h3 className="font-display text-xl font-normal leading-snug text-ink md:text-[1.35rem]">
                    {voce.domanda}
                  </h3>
                </dt>
                <dd className="mt-5 text-base leading-[1.9] text-ink/75">{voce.risposta}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </StackSheet>
  );
}
