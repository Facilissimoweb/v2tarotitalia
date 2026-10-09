import { useEffect, useRef } from "react";
import { googleReviewsContent } from "../data/googleReviewsContent";
import { siteContent } from "../data/siteContent";
import { Kicker } from "./Button";
import { Reveal } from "./Reveal";

const { recensioni } = siteContent.home;
const STAR_GOLD = "#C6A15B";

function GoogleMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function Stars({ value }: { value: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="flex gap-0.5" aria-label={`${filled} su 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
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

function ReviewCard({
  author,
  rating,
  text,
  date,
  echo,
}: (typeof googleReviewsContent)[number] & { echo?: boolean }) {
  return (
    <article
      className="flex w-[min(84vw,20.5rem)] shrink-0 snap-start flex-col bg-paper p-5 ring-1 ring-ink/10 md:w-[21.25rem] md:p-6"
      aria-hidden={echo || undefined}
    >
      <div className="flex items-center gap-2.5">
        <GoogleMark className="h-[1.05rem] w-[1.05rem] shrink-0" />
        <Stars value={rating} />
      </div>
      <p className="mt-4 line-clamp-5 flex-1 text-sm leading-[1.75] text-ink/75">{text}</p>
      <p className="mt-5 font-display text-[15px] text-ink">{author}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-sage">{date}</p>
    </article>
  );
}

function ReviewsStrip() {
  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const copies = [0, 1] as const;

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const tick = () => {
      if (!paused.current) {
        el.scrollLeft += 0.45;
        const loopAt = el.scrollWidth / 2;
        if (loopAt > 0 && el.scrollLeft >= loopAt) el.scrollLeft -= loopAt;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const pause = () => {
    paused.current = true;
  };
  const resume = () => {
    paused.current = false;
  };

  return (
    <div
      ref={scroller}
      className="mt-8 flex snap-x snap-proximity gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-5"
      onPointerEnter={pause}
      onPointerLeave={resume}
      onPointerDown={pause}
      onPointerUp={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
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
  );
}

export function GoogleReviews() {
  if (googleReviewsContent.length === 0) return null;

  return (
    <section className="bg-ivory px-6 py-14 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <GoogleMark className="h-5 w-5" />
                <Kicker>{recensioni.kicker}</Kicker>
              </div>
              <h2 className="mt-4 font-display text-2xl font-normal leading-snug text-ink md:text-3xl">
                {recensioni.titolo}
              </h2>
            </div>
            <a
              href={recensioni.profiloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink ring-1 ring-ink/15 transition-colors duration-200 hover:bg-mist"
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
