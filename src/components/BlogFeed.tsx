import { siteContent } from "../data/siteContent";
import { siteDateTime } from "../lib/locale";
import { SUBSTACK_HOME, type SubstackPost } from "../lib/substack";
import { useSubstackFeed } from "../lib/useSubstackFeed";
import { Button } from "./Button";
import { Reveal } from "./Reveal";

const copy = siteContent.pages.blog;
const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

function formatPostDate(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return siteDateTime({ day: "numeric", month: "long", year: "numeric" }).format(date);
}

function StatusPanel({ title, note }: { title: string; note?: string }) {
  return (
    <Reveal>
      <div className="mx-auto max-w-2xl bg-mist px-8 py-20 text-center md:px-16 md:py-28">
        <p className="font-display text-2xl italic leading-relaxed text-ink">{title}</p>
        {note ? <p className="mt-8 text-sm leading-[1.9] text-ink/65">{note}</p> : null}
        <div className="mt-10">
          <Button href={SUBSTACK_HOME} {...EXTERNAL} variant="ghost">
            {copy.suSubstack}
          </Button>
        </div>
      </div>
    </Reveal>
  );
}

function LoadingPanel() {
  return (
    <div className="mx-auto max-w-3xl" aria-busy="true" aria-live="polite">
      <p className="sr-only">{copy.caricamento}</p>
      <ul className="grid gap-6">
        {[0, 1, 2].map((slot) => (
          <li key={slot} className="bg-mist px-8 py-10 md:px-10 md:py-12">
            <div className="h-2 w-24 bg-ink/10 motion-safe:animate-pulse" />
            <div className="mt-6 h-7 w-4/5 bg-ink/10 motion-safe:animate-pulse" />
            <div className="mt-5 h-3 w-full bg-ink/10 motion-safe:animate-pulse" />
            <div className="mt-3 h-3 w-2/3 bg-ink/10 motion-safe:animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostCard({ post, index }: { post: SubstackPost; index: number }) {
  const dateLabel = formatPostDate(post.date);
  return (
    <Reveal delay={(index % 2) * 80} as="li">
      <article className="flex h-full flex-col bg-paper px-8 py-10 md:px-10 md:py-12">
        {dateLabel ? (
          <time
            dateTime={post.date}
            className="text-[0.625rem] uppercase tracking-[0.16em] text-ember-soft"
          >
            {dateLabel}
          </time>
        ) : null}
        <h2 className="mt-5 font-display text-2xl font-normal leading-snug text-ink">{post.title}</h2>
        {post.snippet ? (
          <p className="mt-5 flex-1 text-sm leading-[1.75] text-ink/75">{post.snippet}</p>
        ) : null}
        <a
          href={post.link}
          {...EXTERNAL}
          className="mt-8 inline-flex items-center self-start px-0 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-ink underline decoration-ember-soft/60 underline-offset-4 transition-colors hover:text-ember"
        >
          {copy.leggi}
        </a>
      </article>
    </Reveal>
  );
}

export function BlogFeed() {
  const payload = useSubstackFeed();

  if (!payload) return <LoadingPanel />;
  if (!payload.available) {
    return <StatusPanel title={copy.errore} note={siteContent.brand.deontologia} />;
  }
  if (payload.posts.length === 0) {
    return <StatusPanel title={copy.vuoto} note={siteContent.brand.deontologia} />;
  }

  return (
    <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
      {payload.posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </ul>
  );
}
