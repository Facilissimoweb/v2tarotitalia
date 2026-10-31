import { useSyncExternalStore } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { useConsent } from "../context/ConsentContext";
import { usePercorsi } from "../context/PercorsiContext";
import { tarotChatUi } from "../lib/tarotChat/ui";

const { pages } = siteContent;

export function ShopLaunch() {
  const { pathname } = useLocation();
  const { authOpen } = useAuth();
  const { open: cookieOpen, ready } = useConsent();
  const { open: percorsiOpen } = usePercorsi();
  const chatOpen = useSyncExternalStore(tarotChatUi.subscribe, tarotChatUi.getOpen, () => false);
  const hidden = !ready || cookieOpen || authOpen || percorsiOpen || chatOpen;

  if (hidden) return null;

  return (
    <NavLink
      to="/shop"
      aria-label={pages.shop.trigger}
      aria-current={pathname === "/shop" ? "page" : undefined}
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-[calc(0.75rem+3.85rem)] z-[45] flex h-[4.25rem] w-[3.6rem] items-center justify-center bg-transparent p-0 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:right-[calc(1rem+4.35rem)] md:bottom-[calc(6.5rem+env(safe-area-inset-bottom))] md:h-[4.75rem] md:w-[4rem]"
    >
      <img
        src="/logo-seal.webp"
        alt=""
        width={208}
        height={244}
        draggable={false}
        aria-hidden="true"
        className="h-full w-full object-contain drop-shadow-[0_1px_5px_rgba(0,0,0,0.35)]"
      />
    </NavLink>
  );
}
