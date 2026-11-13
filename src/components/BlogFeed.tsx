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
      <div className="edition-shell page-prose !mx-auto border-t border-ink/80 pt-8 text-left">
        <p className="edition-note__headline !mb-4">{title}</p>
        {note ? <p className="edition-note__body">{note}</p> : null}
        <div className="mt-8">
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
    <div className="edition-shell page-prose !mx-auto" aria-busy="true" aria-live="polite">
      <p className="sr-only">{copy.caricamento}</p>
      <ul className="edition-leaders">
        {[0, 1, 2].map((slot) => (
          <li key={slot}>
            <div className="edition-leaders__row">
              <span className="edition-leaders__n">{String(slot + 1).padStart(2, "0")}</span>
              <span className="h-5 w-2/3 bg-graphite/10 motion-safe:animate-pulse" />
              <span className="mt-3 h-3 w-full bg-graphite/10 motion-safe:animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostRow({ post, index }: { post: SubstackPost; index: number }) {
  const dateLabel = formatPostDate(post.date);
  return (
    <Reveal delay={(index % 4) * 60} as="li">
      <a href={post.link} {...EXTERNAL} className="edition-leaders__link">
        <span className="edition-leaders__n">{String(index + 1).padStart(2, "0")}</span>
        <span className="edition-leaders__title">{post.title}</span>
        <span className="edition-leaders__fill" aria-hidden />
        <span className="edition-leaders__trail">{dateLabel || copy.leggi}</span>
        {post.snippet ? (
          <span className="edition-note__body mt-2 w-full basis-full pl-[2.65rem] sm:pl-0">
            {post.snippet}
          </span>
        ) : null}
      </a>
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
    <ol className="edition-leaders edition-shell page-shell !mx-auto">
      {payload.posts.map((post, index) => (
        <PostRow key={post.id} post={post} index={index} />
      ))}
    </ol>
  );
}
