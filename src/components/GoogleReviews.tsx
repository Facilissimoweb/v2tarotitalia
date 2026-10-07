import { siteContent } from "../data/siteContent";
import { useGoogleReviews } from "../lib/useGoogleReviews";
import { Kicker } from "./Button";
import { Reveal } from "./Reveal";

const { recensioni } = siteContent.home;

function Stars({ value }: { value: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span className="flex gap-1" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`h-1.5 w-1.5 ${i < filled ? "bg-sage" : "bg-ink/15"}`} />
      ))}
    </span>
  );
}

export function GoogleReviews() {
  const payload = useGoogleReviews();
  const reviews = payload?.reviews ?? [];
  const loading = payload === null;

  return (
    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Kicker>{recensioni.kicker}</Kicker>
          <h2 className="mt-4 font-display text-3xl font-normal leading-snug text-ink md:text-4xl">
            {recensioni.titolo}
          </h2>
          {payload?.rating ? (
            <div className="mt-5 flex items-center gap-4">
              <Stars value={payload.rating} />
              <p className="text-[11px] uppercase tracking-[0.16em] text-sage">
                {payload.rating.toFixed(1)}
                {payload.total ? ` · ${payload.total}` : ""}
              </p>
            </div>
          ) : null}
        </Reveal>

        {loading ? (
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="min-h-[14rem] bg-paper" />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={`${review.author}-${i}`} delay={i * 80}>
                <article className="flex h-full flex-col bg-paper p-8 md:p-10">
                  <Stars value={review.rating} />
                  <p className="mt-6 flex-1 text-sm leading-[1.85] text-ink/70">{review.text}</p>
                  <p className="mt-8 font-display text-base text-ink">{review.author}</p>
                  {review.relativeTime ? (
                    <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-sage">
                      {review.relativeTime}
                    </p>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
