import { useSyncExternalStore } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { useConsent } from "../context/ConsentContext";
import { usePercorsi } from "../context/PercorsiContext";
import { tarotChatUi } from "../lib/tarotChat/ui";
import { ShopIcon } from "./ShopIcon";

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
      className="fixed right-3 z-[45] flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-[#d7f713] shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:right-4 bottom-[calc(10.35rem+env(safe-area-inset-bottom))] md:bottom-[calc(11.6rem+env(safe-area-inset-bottom))] md:h-[3.25rem] md:w-[3.25rem]"
    >
      <ShopIcon size={22} />
    </NavLink>
  );
}
