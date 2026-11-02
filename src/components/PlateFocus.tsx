type Voce = {
  n: string;
  titolo: string;
  testo: string;
};

type Props = {
  items: readonly Voce[];
};

/** Quattro lastre editoriali, stesso linguaggio visivo dei quadranti Hero. */
export function PlateFocus({ items }: Props) {
  return (
    <section className="relative z-[2] grid grid-cols-1 border-t border-plate sm:grid-cols-2 xl:grid-cols-4">
      {items.map((voce) => (
        <article
          key={voce.n}
          className="flex min-h-[12.5rem] flex-col border-white/10 bg-plate px-6 py-8 text-on-ink max-sm:border-b max-sm:last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 xl:min-h-[16.5rem] xl:border-r xl:px-8 xl:py-10 xl:[&:nth-child(2n)]:border-r xl:last:border-r-0"
        >
          <span className="font-h1 text-[1.35rem] leading-none tracking-[-0.04em] text-[#d7f713]">
            {voce.n}
          </span>
          <h2 className="mt-5 text-[0.8125rem] font-bold uppercase leading-snug tracking-[0.16em] text-on-ink">
            {voce.titolo}
          </h2>
          <p className="mt-4 flex-1 text-[0.9375rem] font-medium leading-relaxed text-on-ink/70">
            {voce.testo}
          </p>
        </article>
      ))}
    </section>
  );
}
