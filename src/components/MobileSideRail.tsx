import { useEffect, useSyncExternalStore } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import { MAIN_NAV, isNavBranch, isTarocchiPath, type NavLeaf } from "../data/navigation";
import { useAuth } from "../context/AuthContext";
import { loginHref, rememberAuthReturn } from "../lib/authReturn";
import { cartItemCount, readBookingDraft } from "../lib/storage";
import { isCartDigital, isPaidDigital, readDigitalDrafts } from "../lib/digitalOrders";
import { tarotChatUi } from "../lib/tarotChat/ui";
import { LanguageWidget } from "./LanguageWidget";
import { AccessibilityTrigger } from "./AccessibilityWidget";
import { ShopIcon } from "./ShopIcon";

const { brand, nav, tarotChat } = siteContent;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Condiviso con la placca wordmark: stesso hide/show allo scroll. */
  away?: boolean;
};

/**
 * Navbar laterale mobile a destra: chip linen (casa → hamburger → chat).
 * Stessa forma e stesso hide/show allo scroll su tutto il sito.
 */
export function MobileSideRail({ open, onOpenChange, away = false }: Props) {
  const { pathname } = useLocation();
  const chatOpen = useSyncExternalStore(tarotChatUi.subscribe, tarotChatUi.getOpen, () => false);

  useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  return (
    <div className="xl:hidden" data-mobile-side-rail>
      {open ? (
        <button
          type="button"
          className="side-rail-scrim fixed inset-0 z-[68]"
          aria-label={nav.chiudi}
          onClick={() => onOpenChange(false)}
        />
      ) : null}

      <aside
        className={`side-rail fixed z-[69] flex flex-col ${open ? "is-open" : "is-collapsed"}${
          away && !open ? " is-away" : ""
        }`}
        aria-label={nav.menu}
      >
        <div
          className={`flex pt-1.5 ${
            open ? "items-center gap-3 px-2.5" : "flex-col items-center gap-1.5 px-0.5"
          }`}
        >
          {open ? (
            <button
              type="button"
              className="side-rail-toggle flex h-11 w-11 shrink-0 items-center justify-center text-on-ink transition-colors hover:text-on-ink/80"
              aria-expanded={open}
              aria-controls="side-rail-nav"
              aria-label={nav.chiudi}
              onClick={() => onOpenChange(false)}
            >
              <MenuIcon open={open} />
            </button>
          ) : null}
          <NavLink
            to="/"
            end
            className={`flex shrink-0 items-center justify-center ${open ? "h-11 w-11" : "h-9 w-9"}`}
            aria-label={nav.home}
            onClick={() => onOpenChange(false)}
          >
            <HomeIcon size={open ? 22 : 20} />
          </NavLink>
          {open ? (
            <div className="side-rail-copy min-w-0 flex-1">
              <p className="truncate font-[family-name:var(--font-display)] text-[0.95rem] font-semibold italic leading-tight text-on-ink">
                {brand.wordmark}
              </p>
              <p className="truncate text-[0.65rem] uppercase tracking-[0.14em] text-on-ink/45">{nav.menu}</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="side-rail-toggle flex h-10 w-10 shrink-0 items-center justify-center transition-opacity hover:opacity-80"
                aria-expanded={open}
                aria-controls="side-rail-nav"
                aria-label={nav.menu}
                onClick={() => onOpenChange(true)}
              >
                <MenuIcon open={open} />
              </button>
              <button
                type="button"
                className="side-rail-chat flex h-10 w-10 shrink-0 items-center justify-center transition-opacity hover:opacity-80"
                aria-label={tarotChat.trigger}
                aria-haspopup="dialog"
                aria-expanded={chatOpen}
                onClick={() => tarotChatUi.toggle()}
              >
                <ChipChatIcon />
              </button>
            </>
          )}
        </div>

        {open ? (
          <>
            <nav
              id="side-rail-nav"
              className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-1.5 pb-2"
            >
              {MAIN_NAV.map((item) => {
                if (isNavBranch(item)) {
                  const active = isTarocchiPath(pathname);
                  return (
                    <div key={item.label} className="flex flex-col gap-1">
                      <p className={`side-rail-item ${active ? "is-active" : ""}`}>
                        <span className="side-rail-icon">
                          <CardsIcon />
                        </span>
                        <span className="side-rail-label">{item.label}</span>
                      </p>
                      {item.children.map((child) => (
                        <RailLink key={child.to} item={child} nested onNavigate={() => onOpenChange(false)} />
                      ))}
                    </div>
                  );
                }
                return <RailLink key={item.to} item={item} onNavigate={() => onOpenChange(false)} />;
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-1 border-t border-white/10 px-2 pb-2 pt-3">
              <LanguageWidget placement="nav" railLabel={nav.lingua} className="text-on-ink" />
              <AccessibilityTrigger railLabel={siteContent.accessibilita.titolo} className="text-on-ink" />
              <AccountRailLink />
              <CartRailLink />
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}

function RailLink({
  item,
  onNavigate,
  nested = false,
}: {
  item: NavLeaf;
  onNavigate: () => void;
  nested?: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={item.label}
      aria-label={item.label}
      className={({ isActive }) =>
        `side-rail-item ${nested ? "side-rail-item--nested" : ""} ${isActive ? "is-active" : ""}`
      }
    >
      <span className="side-rail-icon">{railIcon(item)}</span>
      <span className="side-rail-label">{item.label}</span>
    </NavLink>
  );
}

function railIcon(item: NavLeaf) {
  if (item.icon === "home") return <HomeIcon />;
  if (item.icon === "shop") return <ShopIcon size={18} />;
  if (item.to === "/chi-sono") return <PersonIcon />;
  if (item.to === "/consulti") return <ConsultiIcon />;
  if (item.to === "/percorsi") return <PathIcon />;
  if (item.to === "/blog") return <BlogIcon />;
  if (item.to === "/contatti") return <MailIcon />;
  if (item.to.startsWith("/arcani")) return <CardsIcon />;
  return <DotIcon />;
}

function AccountRailLink() {
  const { session } = useAuth();
  const checkoutIntent = Boolean(readDigitalDrafts().length || readBookingDraft());
  const to = session ? "/riservata" : checkoutIntent ? loginHref("/carrello") : "/login";
  const label = session ? nav.riservata : nav.accedi;
  return (
    <NavLink
      to={to}
      state={session ? undefined : { from: checkoutIntent ? "/carrello" : "/riservata" }}
      onClick={() => {
        if (!session && checkoutIntent) rememberAuthReturn("/carrello");
      }}
      className="side-rail-item"
      aria-label={label}
      title={label}
    >
      <span className="side-rail-icon">
        <ProfileIcon />
      </span>
      <span className="side-rail-label">{label}</span>
    </NavLink>
  );
}

function CartRailLink() {
  const count = useCartCount();
  return (
    <NavLink to="/carrello" className="side-rail-item relative" aria-label={nav.carrello} title={nav.carrello}>
      <span className="side-rail-icon relative">
        <BagIcon />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 min-w-[0.95rem] bg-ember px-0.5 text-center text-[0.5625rem] leading-4 text-ivory">
            {count}
          </span>
        ) : null}
      </span>
      <span className="side-rail-label">{nav.carrello}</span>
    </NavLink>
  );
}

function useCartCount() {
  const { purchases, digitalOrders } = useAuth();
  const pendingDigital = digitalOrders.filter(isCartDigital);
  const digitalDrafts = readDigitalDrafts().filter(
    (item) =>
      !pendingDigital.some((order) => order.productId === item.productId) &&
      !digitalOrders.some((order) => order.productId === item.productId && isPaidDigital(order)),
  );
  return cartItemCount(purchases, pendingDigital.length + digitalDrafts.length);
}

function HomeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h14V9M9 21v-7h6v7" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5 C7 16.8 9.2 15.4 12 15.4 C14.8 15.4 17 16.8 18.5 19.5" />
    </svg>
  );
}

function ConsultiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 4 H15 L17 6 V20 H7 Z" />
      <path d="M9 8 H13 M9 12 H13 M9 16 H11" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 19 C5 12 10 12 12 8 C14 12 19 12 19 19" />
      <circle cx="12" cy="5" r="2" />
    </svg>
  );
}

function BlogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 5 H19 V19 H5 Z" />
      <path d="M8 9 H16 M8 12 H16 M8 15 H13" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6 H20 V18 H4 Z" />
      <path d="M4 7 L12 13 L20 7" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 4 H16 V20 H8 Z" />
      <path d="M6 6 V18" />
      <path d="M18 6 V18" />
    </svg>
  );
}

function DotIcon() {
  return <span className="block h-1.5 w-1.5 bg-current" aria-hidden />;
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="10" r="2.4" />
      <path d="M7.2 17.6 C8 15.4 9.7 14.3 12 14.3 C14.3 14.3 16 15.4 16.8 17.6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 8 H18 L19.2 20 H4.8 Z" />
      <path d="M9 8 V7.2 C9 5.1 10.4 3.8 12 3.8 C13.6 3.8 15 5.1 15 7.2 V8" />
    </svg>
  );
}

function ChipChatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.45"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6 L18 18" />
          <path d="M18 6 L6 18" />
        </>
      ) : (
        <>
          <path d="M5 7 H19" />
          <path d="M5 12 H19" />
          <path d="M5 17 H19" />
        </>
      )}
    </svg>
  );
}
