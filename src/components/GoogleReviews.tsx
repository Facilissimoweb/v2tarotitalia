import { googleReviewsContent } from "../data/googleReviewsContent";
import { siteContent } from "../data/siteContent";
import { Kicker } from "./Button";
import { Reveal } from "./Reveal";

const { recensioni } = siteContent.home;
const STAR_GOLD = "#C6A15B";

function Stars({ value }: { value: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="flex gap-1" aria-label={`${filled} su 5`}>
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
}: (typeof googleReviewsContent)[number]) {
  return (
    <article className="flex h-full flex-col ring-1 ring-on-ink/15 p-8 md:p-10">
      <Stars value={rating} />
      <p className="mt-6 flex-1 whitespace-pre-line text-sm leading-[1.85] text-on-ink/75">{text}</p>
      <p className="mt-8 font-display text-base text-on-ink">{author}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-sage">{date}</p>
    </article>
  );
}

export function GoogleReviews() {
  return (
    <section className="bg-ink px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Kicker>{recensioni.kicker}</Kicker>
          <h2 className="mt-4 font-display text-3xl font-normal leading-snug text-on-ink md:text-4xl">
            {recensioni.titolo}
          </h2>
          <a
            href={recensioni.profiloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-on-ink ring-1 ring-on-ink/20 transition-colors duration-200 hover:bg-on-ink/5"
          >
            {recensioni.cta}
          </a>
        </Reveal>

        <div className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {googleReviewsContent.map((review) => (
            <div key={`${review.author}-${review.date}`} className="w-[min(85vw,22rem)] shrink-0 snap-start">
              <ReviewCard {...review} />
            </div>
          ))}
        </div>

        <div className="mt-14 hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-3">
          {googleReviewsContent.map((review, i) => (
            <Reveal key={`${review.author}-${review.date}`} delay={Math.min(i, 5) * 60}>
              <ReviewCard {...review} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
