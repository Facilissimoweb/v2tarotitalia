import { useEffect, useId, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { siteContent } from "../data/siteContent";
import {
  MAIN_NAV,
  NAV_LEADING,
  NAV_TRAILING,
  isNavBranch,
  isTarocchiPath,
  type NavBranch,
  type NavItem,
} from "../data/navigation";
import { useAuth } from "../context/AuthContext";
import { useItha } from "../context/IthaContext.tsx";
import { LanguageWidget } from "./LanguageWidget";
import { BrandLogo } from "./BrandLogo";
import { WidgetCloseButton } from "./WidgetCloseButton";
import { WidgetBrandMark } from "./WidgetFrame";

const { brand, nav, itha } = siteContent;

/** Tipografia menu hamburger (mobile / tablet). */
const NAV_ITEM =
  "font-body text-[13px] font-bold uppercase not-italic leading-none tracking-[0.22em]";
const NAV_CHILD =
  "font-body text-[11px] font-semibold uppercase not-italic leading-none tracking-[0.18em]";

/** Visualizzazione estesa desktop: voci complete in una riga. */
const desktopLinkClass = (active: boolean) =>
  `whitespace-nowrap text-[10px] uppercase tracking-[0.14em] transition-colors xl:text-[11px] xl:tracking-[0.16em] ${
    active ? "text-ink" : "text-ink/40 hover:text-ink"
  }`;

export function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (mq.matches) setOpen(false);
    };
    closeOnDesktop();
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/5 bg-ivory/95 backdrop-blur-xl">
        <nav className="relative mx-auto hidden h-[6.75rem] lg:block" aria-label="Principale">
          <NavLink
            to="/"
            className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            aria-label={brand.wordmark}
            translate="no"
          >
            <BrandLogo className="h-10 w-10" />
            <span className="mt-2 font-display text-[11px] uppercase leading-none tracking-[0.32em] text-ink">
              {brand.wordmark}
            </span>
          </NavLink>

          <div className="mx-auto flex h-full max-w-[90rem] items-center px-5 xl:px-8">
            <div className="flex h-full min-w-0 flex-1 items-center justify-evenly pr-24 xl:pr-40">
              {NAV_LEADING.map((item) => (
                <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
              ))}
            </div>
            <div className="flex h-full min-w-0 flex-1 items-center justify-evenly pl-24 pr-2 xl:pl-40 xl:pr-3">
              {NAV_TRAILING.map((item) => (
                <DesktopNavEntry key={isNavBranch(item) ? item.label : item.to} item={item} />
              ))}
            </div>
            <div className="flex shrink-0 items-center">
              <LanguageWidget placement="nav" />
              <AccountLink />
              <CartLink />
            </div>
          </div>
        </nav>

        <div className="grid h-20 grid-cols-3 items-center px-3 lg:hidden">
          <div className="flex items-center justify-start">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center text-ink"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? nav.chiudi : nav.menu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
            <LanguageWidget placement="nav" />
          </div>
          <NavLink to="/" className="justify-self-center" aria-label={brand.wordmark}>
            <BrandLogo className="h-12 w-12" />
          </NavLink>
          <div className="flex items-center justify-end">
            <AccountLink />
            <CartLink />
          </div>
        </div>
      </header>

      {open ? <MobileDrawer onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function DesktopNavEntry({ item }: { item: NavItem }) {
  if (isNavBranch(item)) return <TarocchiMenu item={item} />;
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => desktopLinkClass(isActive)}>
      {item.label}
    </NavLink>
  );
}

function TarocchiMenu({ item }: { item: NavBranch }) {
  const { pathname } = useLocation();
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const active = isTarocchiPath(pathname);
  const expanded = pinned || hover;

  useEffect(() => {
    setPinned(false);
    setHover(false);
  }, [pathname]);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setPinned(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPinned(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="relative flex h-full items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        className={`${desktopLinkClass(active)} inline-flex items-center gap-1.5`}
        aria-expanded={expanded}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setPinned((v) => !v)}
      >
        {item.label}
        <span aria-hidden className="text-sage">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1.5 2.5 L4 5.5 L6.5 2.5" />
          </svg>
        </span>
      </button>
      <div
        id={menuId}
        role="menu"
        className={`absolute right-0 top-full z-50 min-w-[13.5rem] pt-2 ${
          expanded ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-4 border border-ink/10 bg-ivory px-6 py-5 shadow-[0_18px_40px_rgba(43,37,35,0.06)]">
          {item.children.map((child) => (
            <li key={child.to} role="none">
              <NavLink
                role="menuitem"
                to={child.to}
                className={({ isActive }) =>
                  `block whitespace-nowrap text-[11px] uppercase tracking-[0.14em] ${
                    isActive ? "text-ink" : "text-ink/45 hover:text-ink"
                  }`
                }
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { openItha } = useItha();

  return (
    <div
      id="menu-mobile"
      className="fixed inset-0 z-[60] flex flex-col bg-ivory lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={nav.menu}
    >
      <div className="relative px-8 pb-8 pt-10">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <AccountLink />
          <CartLink />
          <WidgetCloseButton placement="inline" onClick={onClose} />
        </div>
        <WidgetBrandMark size="sm" />
      </div>

      <nav className="flex-1 overflow-y-auto px-8 pb-4" aria-label="Principale">
        <div className="flex flex-col text-center">
          {MAIN_NAV.map((item) =>
            isNavBranch(item) ? (
              <div key={item.label} className="border-t border-ink/10">
                <p className={`py-6 ${NAV_ITEM} text-ink`}>
                  {item.label}
                </p>
                <ul className="pb-4">
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <NavLink
                        to={child.to}
                        className={({ isActive }) =>
                          `block py-4 ${NAV_CHILD} ${
                            isActive ? "text-ink" : "text-ink/40"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `border-t border-ink/10 py-6 ${NAV_ITEM} ${
                    isActive ? "text-ink" : "text-ink/45"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </div>
      </nav>

      <div className="shrink-0 bg-ivory border-t border-ink/10 px-8 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className="flex w-full flex-col items-center bg-ink px-4 py-4 text-center text-ivory"
          aria-label={`${nav.itha}. ${itha.drawerLead}`}
          onClick={() => {
            onClose();
            openItha();
          }}
        >
          <span className="mb-3 flex h-10 w-10 items-center justify-center bg-sage/25 text-sage" aria-hidden>
            <IthaAppGlyph />
          </span>
          <span className={`block ${NAV_ITEM}`}>
            {nav.itha}
          </span>
          <span className={`mt-2 block ${NAV_CHILD} leading-snug text-ivory/70`}>
            {itha.drawerLead}
          </span>
        </button>
        <div className="mt-1 border-t border-ink/10 pt-1">
          <LanguageWidget placement="drawer" />
        </div>
      </div>
    </div>
  );
}

function AccountLink() {
  const { session } = useAuth();
  return (
    <NavLink
      to={session ? "/riservata" : "/login"}
      className="flex h-10 w-10 items-center justify-center text-ink/70 transition-colors hover:text-ink"
      aria-label={session ? nav.riservata : nav.accedi}
    >
      <ProfileIcon />
    </NavLink>
  );
}

function CartLink() {
  return (
    <NavLink
      to="/carrello"
      className="flex h-10 w-10 items-center justify-center text-ink/70 transition-colors hover:text-ink"
      aria-label={nav.carrello}
    >
      <BagIcon />
    </NavLink>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="10" r="2.4" />
      <path d="M7.2 17.6 C8 15.4 9.7 14.3 12 14.3 C14.3 14.3 16 15.4 16.8 17.6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 8 H18 L19.2 20 H4.8 Z" />
      <path d="M9 8 V7.2 C9 5.1 10.4 3.8 12 3.8 C13.6 3.8 15 5.1 15 7.2 V8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 6 L18 18 M18 6 L6 18" />
    </svg>
  );
}

/** Glifo delle tre lame: distingue Itha dalle voci di navigazione. */
function IthaAppGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="2.2" y="5.2" width="8.2" height="13.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="7" y="3.4" width="8.2" height="13.2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="11.8" y="5.2" width="8.2" height="13.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 2.2 V4.4 M9.9 3.3 H12.1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
