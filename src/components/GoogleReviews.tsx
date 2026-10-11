import { useRef } from "react";
import { googleReviewsContent } from "../data/googleReviewsContent";
import { siteContent } from "../data/siteContent";
import { Kicker } from "./Button";
import { GoogleMark } from "./GoogleMark";
import { Reveal } from "./Reveal";

const { recensioni } = siteContent.home;
// Le stelle prendono il verde d'accento della sezione (smeraldo sul nero, verde scuro sul chiaro)
const STAR_GOLD = "currentColor";

function Stars({ value }: { value: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="flex gap-0.5" aria-label={`${filled} su 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5 text-sage" aria-hidden>
          <path
            d="M12 2.6 14.7 8.4l6.4.9-4.6 4.5 1.1 6.3L12 17.1 6.4 20.1l1.1-6.3L2.9 9.3l6.4-.9L12 2.6z"
            fill={i < filled ? STAR_GOLD : "none"}
            stroke={STAR_GOLD}
            strokeWidth={i < filled ? 0 : 1.2}
            opacity={i < filled ? 1 : 0.28}
          />
        </svg>
      ))}
    </span>
  );
}

const AVATAR_TONES = [
  "bg-sage text-on-ink",
  "bg-moss text-on-ink",
  "bg-bronze text-ink",
] as const;

function initialOf(author: string) {
  const letter = author.trim().match(/\p{L}/u)?.[0];
  return (letter ?? "·").toLocaleUpperCase("it-IT");
}

function toneOf(author: string) {
  let hash = 0;
  for (const char of author) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

function Avatar({ author }: { author: string }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-base leading-none ${toneOf(author)}`}
      aria-hidden
    >
      {initialOf(author)}
    </span>
  );
}

function ReviewCard({
  author,
  rating,
  text,
  date,
  echo,
}: (typeof googleReviewsContent)[number] & { echo?: boolean }) {
  return (
    <article
      className="flex w-[min(100%,20.5rem)] glass-night shrink-0 snap-start flex-col p-5 md:w-[21.25rem] md:p-6"
      aria-hidden={echo || undefined}
    >
      <div className="flex items-center gap-3">
        <Avatar author={author} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] leading-tight text-ink">{author}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-sage">{date}</p>
        </div>
        <GoogleMark className="h-[1.05rem] w-[1.05rem] shrink-0 self-start" />
      </div>
      <div className="mt-4">
        <Stars value={rating} />
      </div>
      <p className="mt-3 line-clamp-5 flex-1 text-sm leading-[1.75] text-ink/75">{text}</p>
    </article>
  );
}

function Chevron({ dir }: { dir: -1 | 1 }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d={dir < 0 ? "M14.5 5.5 8 12l6.5 6.5" : "M9.5 5.5 16 12l-6.5 6.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavArrow({
  dir,
  onClick,
}: {
  dir: -1 | 1;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir < 0 ? "Recensioni precedenti" : "Recensioni successive"}
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-bronze bg-ivory/35 text-ink backdrop-blur-md transition-[color,border-color,box-shadow] duration-300 hover:border-moss hover:text-moss hover:shadow-[0_0_22px_rgba(63,214,154,0.18)]"
    >
      <Chevron dir={dir} />
    </button>
  );
}

function ReviewsStrip() {
  const scroller = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const copies = [0, 1] as const;

  const stepSize = () => {
    const el = scroller.current;
    if (!el) return 0;
    const card = el.querySelector("article");
    if (!(card instanceof HTMLElement)) return Math.round(el.clientWidth * 0.85);
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 16;
    return card.offsetWidth + gap;
  };

  const loopWidth = (el: HTMLDivElement) => el.scrollWidth / 2;

  const settle = (el: HTMLDivElement) => {
    const loopAt = loopWidth(el);
    if (loopAt > 0 && el.scrollLeft >= loopAt) el.scrollLeft -= loopAt;
  };

  const animateTo = (el: HTMLDivElement, to: number, reduce: boolean) => {
    cancelAnimationFrame(frame.current);
    const from = el.scrollLeft;
    if (reduce || Math.abs(to - from) < 1) {
      el.scrollLeft = to;
      el.style.scrollSnapType = "";
      settle(el);
      return;
    }
    el.style.scrollSnapType = "none";
    const start = performance.now();
    const duration = 480;
    const ease = (t: number) => 1 - (1 - t) ** 3;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      el.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      el.scrollLeft = to;
      el.style.scrollSnapType = "";
      settle(el);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const step = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    const delta = stepSize();
    if (delta <= 0) return;
    const loopAt = loopWidth(el);
    el.style.scrollSnapType = "none";
    if (loopAt > 0 && el.scrollLeft >= loopAt) el.scrollLeft -= loopAt;
    if (dir < 0 && loopAt > 0 && el.scrollLeft < delta) el.scrollLeft += loopAt;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    animateTo(el, el.scrollLeft + dir * delta, reduce);
  };

  return (
    <div className="mt-8">
      <div
        ref={scroller}
        className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-auto pb-1 [scrollbar-width:none] [touch-action:pan-x] [&::-webkit-scrollbar]:hidden md:gap-5"
      >
        {copies.flatMap((copy) =>
          googleReviewsContent.map((review) => (
            <ReviewCard
              key={`${copy}-${review.author}-${review.date}`}
              {...review}
              echo={copy === 1}
            />
          )),
        )}
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <NavArrow dir={-1} onClick={() => step(-1)} />
        <NavArrow dir={1} onClick={() => step(1)} />
      </div>
    </div>
  );
}

export function GoogleReviews() {
  if (googleReviewsContent.length === 0) return null;

  return (
    <section
      id="recensioni-google"
      className="section-light scroll-mt-24 bg-ivory px-6 py-20 md:px-10 md:py-24 xl:scroll-mt-[7rem]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <GoogleMark className="h-5 w-5" />
                <Kicker>{recensioni.kicker}</Kicker>
              </div>
              <h2 className="mt-4 font-title text-2xl font-normal leading-snug text-ink md:text-3xl">
                {recensioni.titolo}
              </h2>
            </div>
            <a
              href={recensioni.profiloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] border border-bronze bg-ivory/35 text-ink backdrop-blur-md transition-[color,border-color,box-shadow] duration-300 hover:border-moss hover:text-moss hover:shadow-[0_0_22px_rgba(63,214,154,0.18)]"
            >
              <GoogleMark className="h-4 w-4" />
              {recensioni.cta}
            </a>
          </div>
        </Reveal>

        <ReviewsStrip />
      </div>
    </section>
  );
}
