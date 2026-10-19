import { Link } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import type { TarotChatActionId } from "../lib/tarotChat/actions";
import { getPhoneHref, telegramHref, whatsappChatHref } from "../lib/whatsapp";
import { tarotChatUi } from "../lib/tarotChat/ui";

const { tarotChat: copy } = siteContent;

const btnClass =
  "inline-flex min-h-11 items-center justify-center px-3.5 py-2 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink ring-1 ring-ink/15 transition-colors hover:bg-ink hover:text-on-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage";

type Props = {
  actions: TarotChatActionId[];
};

/** Pulsanti CTA sotto i messaggi assistant (contatti e aree del sito). */
export function TarotChatActions({ actions }: Props) {
  if (actions.length === 0) return null;

  const phone = getPhoneHref();
  const whatsapp = whatsappChatHref();
  const telegram = telegramHref();

  return (
    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Azioni rapide">
      {actions.map((id) => {
        const label = copy.azioni[id];
        if (id === "phone" && phone) {
          return (
            <a key={id} href={phone} className={btnClass}>
              {label}
            </a>
          );
        }
        if (id === "whatsapp" && whatsapp) {
          return (
            <a key={id} href={whatsapp} target="_blank" rel="noopener noreferrer" className={btnClass}>
              {label}
            </a>
          );
        }
        if (id === "telegram" && telegram) {
          return (
            <a key={id} href={telegram} target="_blank" rel="noopener noreferrer" className={btnClass}>
              {label}
            </a>
          );
        }
        if (id === "consulti") {
          return (
            <Link key={id} to="/consulti" className={btnClass} onClick={() => tarotChatUi.setOpen(false)}>
              {label}
            </Link>
          );
        }
        if (id === "percorsi") {
          return (
            <Link key={id} to="/percorsi" className={btnClass} onClick={() => tarotChatUi.setOpen(false)}>
              {label}
            </Link>
          );
        }
        return null;
      })}
    </div>
  );
}
