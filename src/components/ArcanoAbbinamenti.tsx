import { useEffect, useRef, useState } from "react";
import { ARCANI } from "../data/arcani";
import { getCombinazione } from "../data/combinazioni";
import { siteContent } from "../data/siteContent";

type Props = {
  slug: string;
};

const copy = siteContent.pages.arcani;
const BREATHING = 16;

/** Header fisso: il padding-top safe-area è già dentro `.site-chrome`. */
function headerOffset(): number {
  const header = document.querySelector<HTMLElement>("header.site-chrome");
  return (header?.getBoundingClientRect().bottom ?? 80) + BREATHING;
}

/**
 * Bordo inferiore libero: dock contatti, bocca della chat, torna su.
 * Ignora header, overlay a tutto schermo e pannelli in alto.
 */
function bottomChromeTop(): number {
  let limit = window.innerHeight;
  const nodes = document.querySelectorAll<HTMLElement>("body .fixed");
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) continue;
    if (rect.bottom < window.innerHeight * 0.45) continue;
    if (rect.top >= window.innerHeight) continue;
    if (rect.height > window.innerHeight * 0.6 && rect.width > window.innerWidth * 0.6) continue;
    if (rect.top < limit) limit = rect.top;
  }
  return limit - BREATHING;
}

/** Allinea il box sotto la navbar, nel corridoio libero da dock, chat e torna su. */
function scrollResultIntoBand(el: HTMLElement) {
  const topOffset = headerOffset();
  const bottomClearance = Math.max(0, window.innerHeight - bottomChromeTop());
  el.style.scrollMarginTop = `${topOffset}px`;
  el.style.scrollMarginBottom = `${bottomClearance}px`;
  const y = window.scrollY + el.getBoundingClientRect().top - topOffset;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });
}

export function ArcanoAbbinamenti({ slug }: Props) {
  const [partner, setPartner] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPartner(null);
  }, [slug]);

  useEffect(() => {
    if (!partner) return;
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        const el = resultRef.current;
        if (el) scrollResultIntoBand(el);
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [partner]);

  const combo = partner ? getCombinazione(slug, partner) : undefined;
  const partnerCard = partner ? ARCANI.find((item) => item.slug === partner) : undefined;

  return (
    <section className="mt-16 border-t border-ink/10 pt-14">
      <h2 className="font-display text-2xl text-ink md:text-3xl">{copy.abbinamenti}</h2>
      <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {ARCANI.filter((item) => item.slug !== slug).map((item) => {
          const active = item.slug === partner;
          return (
            <button
              key={item.slug}
              type="button"
              aria-pressed={active}
              onClick={() => setPartner(item.slug)}
              className={
                active
                  ? "bg-[#d7f713] px-4 py-4 text-left text-black"
                  : "bg-paper px-4 py-4 text-left text-ink transition-colors hover:bg-mist"
              }
            >
              <span
                className={`block text-[0.625rem] uppercase tracking-[0.16em] ${
                  active ? "text-black/55" : "text-ember-soft"
                }`}
              >
                {item.roman}
              </span>
              <span className="mt-1 block font-display text-sm">{item.name}</span>
            </button>
          );
        })}
      </div>

      {partnerCard ? (
        <article
          ref={resultRef}
          className="mt-8 scroll-mt-[calc(80px+env(safe-area-inset-top,0px)+16px)] bg-mist p-8 xl:scroll-mt-[calc(112px+env(safe-area-inset-top,0px)+16px)]"
        >
          <p className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft">
            {partnerCard.roman} · {partnerCard.name}
          </p>
          {combo ? (
            <>
              <p className="mt-5 font-display text-lg text-ink">{combo.titolo}</p>
              <p className="mt-4 text-sm leading-[1.75] text-ink/80">{combo.sintesi}</p>
            </>
          ) : (
            <p className="mt-5 font-display text-lg italic leading-relaxed text-ink">
              {copy.abbinamentoInStudio}
            </p>
          )}
        </article>
      ) : null}
    </section>
  );
}
