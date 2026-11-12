import { NavLink, useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { useConsent } from "../context/ConsentContext";
import { usePercorsi } from "../context/PercorsiContext";
import { tarotChatUi } from "../lib/tarotChat/ui";
import { getLegalOpen, subscribeLegalOpen } from "./LegalNotice";
import { shopLive } from "../lib/launchFlags";
import { ShopIcon } from "./ShopIcon";

const { cta, pages, tarotChat } = siteContent;

const cellClass =
  "ti-btn ti-btn-icon grid h-9 w-9 place-items-center text-ember-pale sm:h-10 sm:w-10 md:h-[3.25rem] md:w-[3.25rem]";

/**
 * Capsula fissa: Torna su (+ Shop/chat su desktop).
 * Su mobile la chat vive nella chip verde del menu laterale.
 */
export function UtilityCapsule() {
  const { pathname } = useLocation();
  const { authOpen } = useAuth();
  const { open: cookieOpen, ready } = useConsent();
  const { open: percorsiOpen } = usePercorsi();
  const chatOpen = useSyncExternalStore(tarotChatUi.subscribe, tarotChatUi.getOpen, () => false);
  const legalOpen = useSyncExternalStore(subscribeLegalOpen, getLegalOpen, () => false);
  const hidden = !ready || cookieOpen || authOpen || percorsiOpen || chatOpen || legalOpen;

  if (hidden) return null;

  return (
    <nav
      className="pointer-events-auto fixed right-2 z-[45] flex flex-col items-center gap-1.5 sm:right-3 md:right-4"
      style={{
        bottom:
          "calc(var(--l-dock-h, 4.65rem) + var(--dock-lift) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <button
        type="button"
        data-torna-su
        aria-label={cta.tornaSu}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="app-glass-fab grid h-11 w-11 place-items-center text-ink hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:h-12 sm:w-12 md:h-[3.25rem] md:w-[3.25rem]"
      >
        <ArrowUpIcon />
      </button>
      {shopLive() ? (
        <NavLink
          to="/shop"
          aria-label={pages.shop.trigger}
          aria-current={pathname === "/shop" ? "page" : undefined}
          className={`${cellClass} rounded-full border-2 border-ember-pale bg-plate hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-pale`}
        >
          <ShopIcon size={22} className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px] md:h-[22px] md:w-[22px]" />
        </NavLink>
      ) : null}
      <button
        type="button"
        className={`${cellClass} hidden rounded-full border-2 border-ember-pale bg-plate hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-pale xl:grid`}
        aria-label={tarotChat.trigger}
        aria-haspopup="dialog"
        aria-expanded={chatOpen}
        onClick={() => tarotChatUi.toggle()}
      >
        <ChatIcon />
      </button>
    </nav>
  );
}

function ChatIcon() {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="block h-[1.15rem] w-[1.15rem] shrink-0 overflow-visible sm:h-5 sm:w-5 md:h-[1.35rem] md:w-[1.35rem]"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
