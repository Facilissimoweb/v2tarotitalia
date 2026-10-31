import { NavLink, useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { useConsent } from "../context/ConsentContext";
import { usePercorsi } from "../context/PercorsiContext";
import { useFooterClearance } from "../lib/useFooterClearance";
import { tarotChatUi } from "../lib/tarotChat/ui";
import { ShopIcon } from "./ShopIcon";

const { cta, pages, tarotChat } = siteContent;

const cellClass =
  "grid h-9 w-9 place-items-center text-[#d7f713] sm:h-10 sm:w-10 md:h-[3.25rem] md:w-[3.25rem]";

/**
 * Capsula fissa: Torna su, Shop, bocca-chat.
 * Grafite pieno, bordo lime, icone centrate. Nessuna animazione.
 */
export function UtilityCapsule() {
  const { pathname } = useLocation();
  const { authOpen } = useAuth();
  const { open: cookieOpen, ready } = useConsent();
  const { open: percorsiOpen } = usePercorsi();
  const chatOpen = useSyncExternalStore(tarotChatUi.subscribe, tarotChatUi.getOpen, () => false);
  const lift = useFooterClearance();
  const inset = "max(1.25rem, env(safe-area-inset-bottom))";
  const hidden = !ready || cookieOpen || authOpen || percorsiOpen || chatOpen;

  if (hidden) return null;

  return (
    <nav
      className="pointer-events-auto fixed right-2 z-[45] flex flex-col items-center gap-0 rounded-full border-2 border-[#d7f713] bg-[#111111] p-1 sm:right-3 sm:gap-0.5 sm:p-1.5 md:right-4"
      style={{ bottom: `calc(${lift}px + ${inset} + 4.65rem)` }}
    >
      <button
        type="button"
        aria-label={cta.tornaSu}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`${cellClass} hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f713]`}
      >
        <ArrowUpIcon />
      </button>
      <NavLink
        to="/shop"
        aria-label={pages.shop.trigger}
        aria-current={pathname === "/shop" ? "page" : undefined}
        className={`${cellClass} hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f713]`}
      >
        <ShopIcon size={22} className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px] md:h-[22px] md:w-[22px]" />
      </NavLink>
      <button
        type="button"
        className={`${cellClass} hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7f713]`}
        aria-label={tarotChat.trigger}
        aria-haspopup="dialog"
        aria-expanded={chatOpen}
        onClick={() => tarotChatUi.toggle()}
      >
        <img
          src="/chat-mouth.png"
          alt=""
          width={48}
          height={56}
          draggable={false}
          aria-hidden="true"
          className="h-7 w-7 object-contain sm:h-8 sm:w-8 md:h-10 md:w-10"
        />
      </button>
    </nav>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="block h-4 w-4 shrink-0 overflow-visible sm:h-[18px] sm:w-[18px] md:h-[22px] md:w-[22px]"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
