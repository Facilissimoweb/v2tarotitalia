import { siteContent } from "../data/siteContent";
import type { TarotChatActionId } from "../lib/tarotChat/actions";
import { getPhoneHref, telegramHref, whatsappChatHref } from "../lib/whatsapp";
import { tarotChatUi } from "../lib/tarotChat/ui";

const { tarotChat: copy } = siteContent;

const btnClass =
  "inline-flex min-h-11 items-center justify-center px-3.5 py-2 text-[0.625rem] font-medium uppercase tracking-[0.2em] text-ink ring-1 ring-ink/15 transition-colors hover:bg-ink hover:text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

type Props = {
  actions: TarotChatActionId[];
};

type ActionLink = {
  id: TarotChatActionId;
  href: string;
  external?: boolean;
};

/** Pulsanti CTA sotto i messaggi assistant (contatti e aree del sito). */
export function TarotChatActions({ actions }: Props) {
  if (actions.length === 0) return null;

  const phone = getPhoneHref();
  const whatsapp = whatsappChatHref();
  const telegram = telegramHref();

  const links: ActionLink[] = [];
  for (const id of actions) {
    if (id === "phone" && phone) links.push({ id, href: phone });
    else if (id === "whatsapp" && whatsapp) links.push({ id, href: whatsapp, external: true });
    else if (id === "telegram" && telegram) links.push({ id, href: telegram, external: true });
    else if (id === "consulti") links.push({ id, href: "/consulti" });
    else if (id === "percorsi") links.push({ id, href: "/percorsi" });
  }

  if (links.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Azioni rapide">
      {links.map(({ id, href, external }) => (
        <a
          key={id}
          href={href}
          className={btnClass}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          onClick={() => {
            if (!external) tarotChatUi.setOpen(false);
          }}
        >
          {copy.azioni[id]}
        </a>
      ))}
    </div>
  );
}
